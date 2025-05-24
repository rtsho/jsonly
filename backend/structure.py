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

def ai_summarize_doc(filepath):
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


summarize_prompt_with_template = """
Understand what this document is about and summarize it using a strict JSON format (key: value). 
The JSON format must be as such, where the values are only provided as examples: 

{template}

"""

def ai_summarize_with_template(filepath:str, template:dict):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Part.from_bytes(
                data=Path(filepath).read_bytes(),
                mime_type='application/pdf',
            ),
            summarize_prompt_with_template.format(template=template)
        ]
    )

    clean_text = response.text.replace("```json", "").replace("```", "")
    return json.loads(clean_text)




harmonize_prompt = """
You are given a list of JSON templates (as Python dicts). Your task is to analyze them and return a single "harmonized" template (as a JSON/dict) that captures the common structure and information across all the input templates.
- Merge fields that are semantically equivalent, even if their key names differ (e.g., "address" and "location" or "phone" and "phone_number").
- Use your judgment to choose the most representative or standard key name for merged fields.
- Include keys and nested structures that are conceptually present in most or all templates, even if not every template uses the exact same key.
- If a field is present in some templates but not others, include it if it represents important shared information.
- Your output must be a valid JSON/dict.
- Do not include any explanation or extra text, only the harmonized JSON.
- For the values of the field, pick any representative one from the provided templates.
"""

def ai_harmonize_templates(list_of_dicts):
    # Prepare the input for Gemini: a string with all JSONs, pretty-printed
    jsons_str = "\n\n".join([json.dumps(d, indent=2) for d in list_of_dicts])
    full_prompt = (
        harmonize_prompt
        + "\n\nHere are the input templates:\n"
        + jsons_str
    )
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[full_prompt]
    )
    clean_text = response.text.replace("```json", "").replace("```", "")
    return json.loads(clean_text)
