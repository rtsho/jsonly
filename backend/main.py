from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from structure import summarize_doc

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

@app.post("/upload-document/")
async def upload_document(file: UploadFile = File(...)):
    """
    Receives a document (PDF or CSV) and processes it for AI summarization.
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