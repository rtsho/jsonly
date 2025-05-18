from google import genai
from google.genai import types
from pathlib import Path
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

summarize_prompt = """
Understand what this document is about and summarize it using a strict JSON format (key: value). 
value must be a string, except where it makes sense to use nested dicts or lists.
Your output must be a valid JSON.
"""


def summarize_doc(filepath):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Part.from_bytes(
                data=Path(filepath).read_bytes(),
                mime_type='application/pdf',
            ),
            summarize_prompt
        ]
    )

    clean_text = response.text.replace("```json", "").replace("```", "")
    return json.loads(clean_text)




