from google import genai
from google.genai import types
from pathlib import Path
import os
import json
from pathlib import Path
from tempfile import TemporaryFile
from datamodel_code_generator import InputFileType, generate
from datamodel_code_generator import DataModelType
from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

with open('schema.json', 'r') as f:
    schema = f.read()


    #temporary_directory = Path(temporary_directory_name)
output = Path('model.py')
generate(
    schema,
    input_file_type=InputFileType.JsonSchema,
    output=output,
    # set up the output model types
    output_model_type=DataModelType.PydanticV2BaseModel,
)

