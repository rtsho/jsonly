from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from structure import summarize_doc
import PyPDF2

# Firebase Admin SDK imports
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

def get_current_user(request: Request):
    """Dependency to verify Firebase ID token from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    id_token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)


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
    user=Depends(get_current_user)
):
    """
    Receives a document (PDF or CSV) and processes it for AI summarization.
    Only accessible to authenticated users.
    """
    allowed_extensions = ["pdf"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")

    # In a real application, you would process the file here.
    # For this starter, we'll just save it temporarily.
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())

        nb_pages = count_pdf_pages(file_location)

        res = summarize_doc(file_location)

        return {
            'nb_pages': nb_pages,
            'summary': res
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during file upload: {e}")

@app.get("/")
async def read_root():
    return {"message": "FastAPI backend is running"}