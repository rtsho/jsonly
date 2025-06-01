from google import genai
from google.genai import types
from pathlib import Path
import os
import json
from dotenv import load_dotenv
from model import Model

load_dotenv()

client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

summarize_prompt = """
You will be asked to understand a document and summarize its structure.
Your output should be a valid JSON schema representation.
"""

filepath = '../coxbusiness1.pdf'

response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Part.from_bytes(
                data=Path(filepath).read_bytes(),
                mime_type='application/pdf',
            ),
            summarize_prompt
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": Model,
        },
    )

with open('summary_with_schema.json', 'w') as f:
    f.write(response.text)