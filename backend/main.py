from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request, Body
from fastapi.middleware.cors import CORSMiddleware
import os
from structure import ai_summarize_doc, ai_harmonize_templates, ai_summarize_with_template
import PyPDF2
import base64
import bcrypt
import uuid
import httpx
from typing import List, Dict, Any

# Firebase Admin SDK imports
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

VALID_CLIENTS = {
    "my_client_id": "my_secret",
    "partner_backend": "secure_token_123"
}


# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

@app.post("/regenerate-client-secret")
async def regenerate_client_secret(request: Request):
    uid = request.headers.get("X-User-UID")
    if not uid:
        raise HTTPException(status_code=400, detail="Missing user UID")

    client_ref = db.collection("users").document(uid)
    user_doc = client_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    client_id = user_doc.to_dict().get("clientId")
    if not client_id:
        raise HTTPException(status_code=400, detail="Missing client ID")

    # Generate new secret
    client_secret = str(uuid.uuid4())
    hashed_secret = bcrypt.hashpw(client_secret.encode(), bcrypt.gensalt()).decode()

    # Update only the secret
    client_ref.update({
        "clientSecret": hashed_secret,
        "updatedAt": firestore.SERVER_TIMESTAMP,
    })

    return {
        "client_id": client_id,
        "client_secret": client_secret  # Only shown once
    }


@app.post("/register-client")
async def register_client(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    id_token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    # Ensure user record and client_id exist
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    if not user_doc.exists or "clientId" not in user_doc.to_dict():
        client_id = str(uuid.uuid4())
        user_ref.set({
            "clientId": client_id,
            "email": email,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }, merge=True)

    # Call regenerate-secret internally
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/regenerate-client-secret",
            headers={"X-User-UID": uid}
        )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to generate client secret")

    return response.json()


def get_current_entity(request: Request) -> dict:
    """Authenticate either a Firebase user or a backend client."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    # Try Firebase Bearer token
    if auth_header.startswith("Bearer "):
        id_token = auth_header.split("Bearer ")[1]
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            return {"type": "user", "details": None}
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid Firebase token")

    # Try Basic Auth for client_id and secret
    if auth_header.startswith("Basic "):
        try:
            decoded = base64.b64decode(auth_header.split(" ")[1]).decode()
            client_id, client_secret = decoded.split(":", 1)
            # print(f"client_id {client_id}")
            # print(f"client_secret {client_secret}")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid Basic Auth format")
        
        try:
            # doc = db.collection("users").document(client_id).get()
            # if not doc.exists:
            #     raise HTTPException(status_code=401, detail="Client not found")
            query = db.collection("users").where(filter=FieldFilter("clientId", "==", client_id)).limit(1)
            results = query.get()
            if not results:
                raise HTTPException(status_code=401, detail="Client not found")
            doc = results[0]
            
            user_data = doc.to_dict()
            expected_secret = user_data.get("clientSecret")

            if not expected_secret or not bcrypt.checkpw(client_secret.encode(), expected_secret.encode()):
                raise HTTPException(status_code=401, detail="Invalid client credentials")

            return {"type": "client", "details": {"client_id": client_id}}

        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="Error verifying client credentials")

    raise HTTPException(status_code=401, detail="Unsupported Authorization scheme")


def count_pdf_pages(pdf_path):
    """
    Counts the number of pages in a PDF file.

    Args:
        pdf_path (str): The path to the PDF file.

    Returns:
        int: The number of pages in the PDF, or -1 if an error occurs.
    """
    try:
        with open(pdf_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            return len(pdf_reader.pages)
    except FileNotFoundError:
        print(f"Error: File not found at {pdf_path}")
        return -1
    except PyPDF2.errors.PdfReadError:
        print(f"Error: Could not read PDF file at {pdf_path}")
        return -1
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return -1



@app.post("/analyze-document/")
async def analyze_document(
    file: UploadFile = File(...),
    entity=Depends(get_current_entity)
):
    """
    Receives a document (PDF or CSV) and processes it for AI summarization.
    Only accessible to authenticated users.
    """
    allowed_extensions = ["pdf"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")

    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())

        nb_pages = count_pdf_pages(file_location)

        res = ai_summarize_doc(file_location)

        return {
            'nb_pages': nb_pages,
            'summary': res,
            "received_by": entity["type"],
            "entity_details": entity["details"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during file upload: {e}")
    

# Helper function to process a single file with a template
async def _process_single_file_with_template(file: UploadFile, template_summary: Dict[str, Any]):
    """Helper function to process a single file with a template."""
    file_location = None
    try:
        # Save file temporarily
        file_location = f"temp_{uuid.uuid4()}_{file.filename}" # Use uuid for unique filenames
        with open(file_location, "wb+") as file_object:
            file_object.write(await file.read()) # Use await file.read() for async

        # Count pages
        nb_pages = count_pdf_pages(file_location)

        # Summarize with template
        summary = ai_summarize_with_template(file_location, template_summary)

        return {
            "filename": file.filename,
            "nb_pages": nb_pages,
            "summary": summary
        }

    except Exception as e:
        # Handle errors during processing
        print(f"Error processing file {file.filename}: {e}")
        return {
            "filename": file.filename,
            "error": str(e)
        }
    finally:
        # Clean up temporary file
        if file_location and os.path.exists(file_location):
            os.remove(file_location)


@app.post("/extract")
async def analyze_with_template(
    file: UploadFile = File(...),
    template_id: str = Body(...), # Accept template ID
    entity=Depends(get_current_entity)
):
    """
    Receives a document (PDF or CSV) and processes it for AI summarization using a template.
    Only accessible to authenticated users.
    """
    allowed_extensions = ["pdf"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")

    try:
        # Fetch template from Firebase
        template_ref = db.collection("templates").document(template_id)
        template_doc = template_ref.get()

        if not template_doc.exists:
            raise HTTPException(status_code=404, detail=f"Template with ID {template_id} not found.")

        template_data = template_doc.to_dict()
        template_summary = template_data.get("summary")

        if not template_summary:
             raise HTTPException(status_code=400, detail=f"Template with ID {template_id} has no summary data.")

        # Process the single file using the helper function
        result = await _process_single_file_with_template(file, template_summary)

        # Check if processing failed for the single file
        if "error" in result:
             raise HTTPException(status_code=500, detail=f"Error processing file {file.filename}: {result['error']}")


        return {
            'nb_pages': result.get('nb_pages', 0), # Get pages from result
            'summary': result.get('summary'), # Get summary from result
            "received_by": entity["type"],
            "entity_details": entity["details"]
        }

    except HTTPException as http_exc:
        # Re-raise HTTPException to be handled by FastAPI
        raise http_exc
    except Exception as e:
        # Catch other potential errors (e.g., Firebase fetch errors)
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    
    
@app.post("/analyze-many-with-template/")
async def analyze_many_with_template(
    files: List[UploadFile] = File(...), # Accept list of files
    template_id: str = Body(...), # Accept template ID
    entity=Depends(get_current_entity)
):
    """
    Receives multiple documents (PDF or CSV) and processes them for AI summarization using a template.
    Only accessible to authenticated users.
    """
    allowed_extensions = ["pdf"]
    for file in files:
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Invalid file type for {file.filename}. Only PDF is allowed.")

    if not files:
         raise HTTPException(status_code=400, detail="No files provided.")


    try:
        # Fetch template from Firebase (same logic as analyze_with_template)
        template_ref = db.collection("templates").document(template_id)
        template_doc = template_ref.get()

        if not template_doc.exists:
            raise HTTPException(status_code=404, detail=f"Template with ID {template_id} not found.")

        template_data = template_doc.to_dict()
        template_summary = template_data.get("summary")

        if not template_summary:
             raise HTTPException(status_code=400, detail=f"Template with ID {template_id} has no summary data.")

        all_summaries = []
        total_pages = 0

        # Process each file using the helper function
        for file in files:
            result = await _process_single_file_with_template(file, template_summary)
            all_summaries.append(result)
            if "nb_pages" in result and result["nb_pages"] > 0:
                 total_pages += result["nb_pages"]


        return {
            'total_pages': total_pages,
            'files_summary': all_summaries, # Return list of summaries for each file
            "received_by": entity["type"],
            "entity_details": entity["details"]
        }

    except HTTPException as http_exc:
        # Re-raise HTTPException to be handled by FastAPI
        raise http_exc
    except Exception as e:
        # Catch other potential errors (e.g., Firebase fetch errors)
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@app.post("/harmonize-templates")
async def harmonize_templates(payload: List[Dict[str, Any]] = Body(...)):
    result = ai_harmonize_templates(payload)
    return {"result": result}

@app.get("/")
async def read_root():
    return {"message": "FastAPI backend is running"}