from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from structure import summarize_doc

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

@app.post("/analyze-document/")
async def analyze_document(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    """
    Receives a document (PDF or CSV) and processes it for AI summarization.
    Only accessible to authenticated users.
    """
    allowed_extensions = ["pdf", "csv"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and CSV are allowed.")

    # In a real application, you would process the file here.
    # For this starter, we'll just save it temporarily.
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())

        res = summarize_doc(file_location)

        print(res)

        # TODO: Add AI summarization logic here
        #return {"info": f"file '{file.filename}' uploaded successfully. Processing for summarization...", "file_path": file_location}
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during file upload: {e}")

@app.get("/")
async def read_root():
    return {"message": "FastAPI backend is running"}