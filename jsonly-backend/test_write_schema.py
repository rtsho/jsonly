from google import genai
from google.genai import types
from pathlib import Path
import os
import json
from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

summarize_prompt = """
You will be asked to understand a document and summarize its structure using a JSON schema.
The schema should include all important fields, their type and a description.
Do NOT add examples.
You can used nested fields (nested dicts, lists) when appropriate.
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
        ]
    )

res = response.text.strip()

if res.startswith("```json"):
    res = res[len("```json"):].lstrip()

if res.endswith("```"):
    res = res[:-3].rstrip()

with open('schema.json', 'w') as f:
    f.write(res)

