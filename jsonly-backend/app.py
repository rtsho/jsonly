from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request, Body
from fastapi.middleware.cors import CORSMiddleware
import os
from structure import ai_harmonize_templates, ai_extract
import PyPDF2
import base64
import bcrypt
import uuid
import httpx
from typing import List, Dict, Any
from decouple import config
from contextlib import asynccontextmanager
import asyncio
import uuid
import uvicorn

# Firebase Admin SDK imports
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

VALID_CLIENTS = {
    "my_client_id": "my_secret",
    "partner_backend": "secure_token_123"
}

SERVER_URL = config('SERVER_URL', default='https://jsonly-backend.fly.dev')


async def lifespan(app: FastAPI):
    app.state.tasks = {}
    yield


# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()
app = FastAPI(lifespan=lifespan)


# Configure CORS
origins = [
    "https://jsonly.dev",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
            f"{SERVER_URL}/regenerate-client-secret",
            headers={"X-User-UID": uid}
        )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to generate client secret")

    return response.json()


def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    
    id_token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return {"type": "user", "details": None}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")


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


@app.get("/status/{task_id}")
async def status(task_id:str, entity=Depends(get_current_entity)):
    if task_id not in app.state.tasks.keys():
        raise HTTPException(status_code=404, detail=f"Task id {task_id} was not found.") 

    return app.state.tasks[task_id].is_done()


@app.get("/result/{task_id}")
async def result(task_id:str, entity=Depends(get_current_entity)):
    if task_id not in app.state.tasks.keys():
        raise HTTPException(status_code=404, detail=f"Task id {task_id} was not found.") 

    return app.state.tasks[task_id].result()


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


async def _do_extract(
    file: UploadFile = File(...),
    template: str|None = None
):
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())

        nb_pages = count_pdf_pages(file_location)

        res = await ai_extract(file_location, template)
        summary = res['summary']
        template = res['template']

        return {
            'nb_pages': nb_pages,
            'summary': summary,
            'template': template
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during file upload: {e}")
    

#--- Explanations
#
# extract and async_extract will generate a tempalte and perform extraction using that template
# extract_with_template and async_extract_with_template will take a template_id, fetch that template, and use it for extraction

@app.post("/extract")
async def extract(
    file: UploadFile = File(...),
    entity=Depends(get_current_entity)
):
    """
    Receives a document (PDF or CSV) and processes it for AI summarization.
    Only accessible to authenticated users on the website.
    """
    allowed_extensions = ["pdf"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")
    
    return await _do_extract(file)


@app.post("/async-extract")
async def async_extract(
    file: UploadFile = File(...),
    entity=Depends(get_current_entity)
):
    """
    Receives a document (PDF or CSV) and processes it for AI summarization.
    Only accessible to authenticated users (website or API).
    """
    allowed_extensions = ["pdf"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")

    task = asyncio.create_task(_do_extract(file))
    task_id = str(uuid.uuid4())
    app.state.tasks[task_id] = task
    return task_id
    

def get_template(template_id: str):
    template_ref = db.collection("templates").document(template_id)
    template_doc = template_ref.get()

    if not template_doc.exists:
        raise HTTPException(status_code=404, detail=f"Template with ID {template_id} not found.")

    template_data = template_doc.to_dict()
    template = template_data.get("summary")

    if not template:
        raise HTTPException(status_code=400, detail=f"Template with ID {template_id} has no summary data.")
    
    return template


@app.post("/extract-with-template")
async def extract_with_template(
    file: UploadFile = File(...),
    template_id: str = Body(...), # Accept template ID
    user=Depends(get_current_entity)
):
    """
    Receives a document (PDF or CSV) and processes it for AI summarization using a template.
    Only accessible to authenticated users on the website.
    """
    allowed_extensions = ["pdf"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")
    
    template = get_template(template_id)
    
    return await _do_extract(file, template)


@app.post("/async-extract-with-template")
async def async_extract_with_template(
    file: UploadFile = File(...),
    template_id: str = Body(...), # Accept template ID
    entity=Depends(get_current_entity)
):
    """
    Receives a document (PDF or CSV) and processes it for AI summarization using a template.
    Only accessible to authenticated users (website or API).
    """
    allowed_extensions = ["pdf"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")
    
    template = get_template(template_id)
    
    task = asyncio.create_task(_do_extract(file, template))
    task_id = str(uuid.uuid4())
    app.state.tasks[task_id] = task
    return task_id

        
@app.post("/extract-many-with-template/")
async def extract_many_with_template(
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
    result = await ai_harmonize_templates(payload)
    return {"result": result}

@app.get("/")
async def read_root():
    return {"message": "FastAPI backend is running"}

def main():
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)

if __name__ == '__main__':
    main()
