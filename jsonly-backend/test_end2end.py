from google import genai
from google.genai import types
from pathlib import Path
import os
import json
from pathlib import Path
from tempfile import NamedTemporaryFile
from datamodel_code_generator import InputFileType, generate
from datamodel_code_generator import DataModelType
import importlib
import importlib.util
from textwrap import dedent
import sys


from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

with open('schema.json', 'r') as f:
    schema = f.read()


with NamedTemporaryFile(mode='a+', suffix='.py', delete=True, delete_on_close=False) as tmp:

    print(f"tmp file name: {tmp.name}")
    generate(
        schema,
        input_file_type=InputFileType.JsonSchema,
        output=Path(tmp.name),
        # set up the output model types
        output_model_type=DataModelType.PydanticV2BaseModel,
    )

    module_name = Path(tmp.name).stem
    spec = importlib.util.spec_from_file_location(module_name, tmp.name)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module  # optional: register it in sys.modules
    spec.loader.exec_module(module)

    # module = importlib.import_module(tmp.name)
    Model = getattr(module, "Model")

    summarize_prompt = dedent(
        """
        You will be asked to understand a document and summarize its structure.
        Your output should be a valid JSON schema representation.
        """
    )

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


