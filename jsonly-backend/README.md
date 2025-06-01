

## Tests

- `test_write_schema.py`:

Given a PDF file, will summarize into a JSON schema

- `test_read_schema.py`:

Reads the JSON schema produced above and creates a python file `model.py` that describes the corresponding pydantic model (Model class in that file)

- `test_structure_with_schema.py`:

Takes a new PDF, and applies the pydantic model to structure it with gemini

## In Prod

I have a `test_end2end.py` file where:

- given the JSON schema (which we can generate on the fly as in `test_write_schema.py`, and/or which we can read from the templates collection)
- we create a temporary `.py` file where we write the pydantic model and which we then read as a module and import the `Model` from

