# JSONly - PDF to Structured JSON Conversion Service

## 1. Project Overview

JSONly is a web application that allows users to upload PDF documents and receive a structured JSON representation of their content. It leverages AI to understand the document's structure, generate a template (JSON schema), and then extract the data into a clean JSON format. The service is designed for both interactive use through a web interface and programmatic use via a REST API.

## 2. Core Features

- **PDF to JSON Conversion**: Upload a PDF and get a structured JSON output.
- **AI-Powered Template Generation**: Automatically creates a JSON schema that best represents the document's structure.
- **Use Your Own Template**: Users can provide their own JSON schema (template) for data extraction.
- **User Authentication**: Secure sign-up, login, and email verification using Firebase Authentication.
- **API Access**: Registered users can generate client credentials (ID and secret) to use the service programmatically.
- **Usage Tracking**: A dashboard page to monitor API usage, such as the number of pages processed.
- **Asynchronous Processing**: Support for long-running extraction tasks via async endpoints.
- **Template Harmonization**: An endpoint to merge multiple templates into a single, unified schema.

## 3. Technologies & Frameworks

### Backend (`jsonly-backend`)

- **Framework**: FastAPI (Python)
- **AI/ML**: Google Gemini (for schema generation and data extraction)
- **Database**: Google Firestore (for user data, API credentials, and templates)
- **Authentication**: Firebase Admin SDK, bcrypt for hashing client secrets.
- **Key Libraries**:
  - `pypdf2`: For counting PDF pages.
  - `python-decouple`: For managing environment variables.
  - `uvicorn`: ASGI server.

### Frontend (`jsonly-frontend`)

- **Framework**: React (with TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context API (`AppContext`)
- **Authentication**: Firebase Authentication
- **Key Libraries**:
  - `chart.js`: For displaying usage graphs.
  - `lucide-react`: For icons.
  - `json-edit-react`: For displaying/editing JSON data.

## 4. Key Files and Their Roles

### `jsonly-backend/`

- **`app.py`**: The main FastAPI application file. It defines all API endpoints, handles authentication (for both web users and API clients), and integrates with Firebase.
- **`structure.py`**: Contains the core AI logic. It interfaces with the Google Gemini API to generate templates (`ai_generate_template`), extract data based on a schema (`ai_extract`), and harmonize templates (`ai_harmonize_templates`).
- **`serviceAccountKey.json`**: (Not committed) Firebase service account credentials.
- **`.env`**: (Not committed) Environment variables, including `GEMINI_API_KEY` and `SERVER_URL`.

### `jsonly-frontend/`

- **`src/App.tsx`**: The main application component. It sets up routing and the overall page layout, including the header, sidebar, and footer.
- **`src/main.tsx`**: The entry point of the React application.
- **`src/services/firebase.ts`**: (Assumed location) Handles all Firebase interactions (Auth, Firestore).
- **`src/context/AppContext.tsx`**: Provides global state for the application, such as the authenticated user and auth modal state.
- **`src/pages/`**: Contains the main pages of the application:
  - `HomePage.tsx`: The main file upload and analysis interface.
  - `CredentialsPage.tsx`: Where users can register and manage their API client credentials.
  - `UsagePage.tsx`: Displays historical API usage.
  - `TemplatePage.tsx`: Allows users to manage their saved templates.
- **`vite.config.ts`**: Vite build and development server configuration.

## 5. Database Schema (Firestore)

- **`users`** (collection)
  - `{uid}` (document)
    - `clientId`: (string) Unique ID for API access.
    - `clientSecret`: (string) Hashed secret for API access.
    - `email`: (string) User's email.
    - `createdAt`, `updatedAt`: (timestamps)
    - **`documentAnalysis`** (sub-collection)
      - `{analysisId}` (document)
        - `documentName`: (string)
        - `nbPages`: (number)
        - `runAt`: (timestamp)

- **`templates`** (collection)
  - `{templateId}` (document)
    - `userId`: (string) The UID of the user who owns the template.
    - `template`: (string) The name of the template.
    - `summary`: (map/JSON) The JSON schema of the template.
    - `createdAt`, `updatedAt`: (timestamps)

## 6. Last Known State & Next Steps

### What I was working on last:

Based on the `docs/usage_page_plan.md`, the most recent work involved planning and designing the **Usage Page**. The goal was to provide users with a clear view of their document processing history and how it relates to their subscription plan. The plan outlines the data retrieval from Firestore, the UI/UX design (including charts and tables), and the overall implementation steps.

### Next Planned Steps:

1.  **Implement the Usage Page**: Translate the plan from `usage_page_plan.md` into a functional React component (`UsagePage.tsx`). This involves:
    - Fetching `documentAnalysis` data from Firestore for the logged-in user.
    - Aggregating the data to calculate total pages processed.
    - Displaying the data in a chart and a table of recent activity.
2.  **Connect Subscription Tiers**: Integrate the subscription plan details (from `SubscriptionPage.tsx`) with the usage page to show quota information (e.g., "X of Y pages used this month").
3.  **Refine Error Handling**: Improve error handling on both the frontend and backend to provide more specific feedback to the user (e.g., when a PDF is corrupt or a template is invalid).
4.  **Backend Scalability**: For the async endpoints, consider moving from in-memory task storage (`app.state.tasks`) to a more robust solution like Redis or a Firestore collection to handle long-running jobs and scale beyond a single server instance.

## 7. Tricky Parts & Design Decisions

- **Dual Authentication (`get_current_entity`)**: The backend needs to authenticate two types of entities: Firebase users (logged in via the website) and API clients (using Basic Auth with `clientId` and `clientSecret`). The `get_current_entity` dependency in `app.py` is a key piece of logic that handles this by checking for either a `Bearer` token (Firebase) or a `Basic` auth header.
- **AI-Generated Pydantic Models**: The `ai_extract` function in `structure.py` uses a clever, dynamic approach. It first gets a JSON schema (template), then uses the `datamodel-code-generator` library to create a Pydantic model from that schema on-the-fly in a temporary file. This Pydantic model is then used to structure the response from the Gemini API, ensuring the final JSON output is valid and conforms to the generated template. This is powerful but also complex.
- **Client Secret Handling**: When a user registers for API access, a `clientId` and `clientSecret` are generated. The secret is immediately hashed with `bcrypt` before being stored in Firestore. The plain-text secret is returned to the user **only once**. If they lose it, they must regenerate it, which is a standard security practice. The `regenerate-client-secret` endpoint handles this.
- **CORS Configuration**: The FastAPI backend is configured with a very permissive CORS policy (`allow_origins=["*"]`). For a production environment, this should be locked down to only allow requests from the frontend's domain.

## 8. Backend API Endpoints

All endpoints are prefixed with the base URL of the running backend server.

### Authentication

Two authentication methods are supported:
1.  **Firebase Auth (for Web App)**: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
2.  **API Client (for Programmatic Access)**: `Authorization: Basic <BASE64_ENCODED_CREDENTIALS>` where the credentials are `clientId:clientSecret`.

The `get_current_entity` dependency determines which authentication type is being used. Endpoints accessible to both are marked with `[USER, API]`, while those restricted to web users are marked with `[USER]`.

---

### Client & Credential Management

#### `POST /register-client`
- **Description**: Registers the current authenticated user as an API client, generating a new `clientId` and `clientSecret`.
- **Auth**: `[USER]`
- **Response Body**:
  ```json
  {
    "client_id": "your-new-client-id",
    "client_secret": "your-new-client-secret"
  }
  ```

#### `POST /regenerate-client-secret`
- **Description**: Generates a new `clientSecret` for the user identified by the `X-User-UID` header. This is typically called internally by `/register-client`.
- **Auth**: Internal (requires `X-User-UID` header).
- **Response Body**: Same as `/register-client`.

---

### Document Extraction (Synchronous)

These endpoints process the request immediately and return the result in the response body.

#### `POST /extract`
- **Description**: Extracts data from a single PDF. The AI will automatically generate a template for the extraction.
- **Auth**: `[USER]`
- **Request**: `multipart/form-data` with a `file` field containing the PDF.
- **Response Body**:
  ```json
  {
    "nb_pages": 1,
    "summary": { "...extracted data..." },
    "template": { "...generated schema..." }
  }
  ```

#### `POST /extract-with-template`
- **Description**: Extracts data from a single PDF using a predefined template.
- **Auth**: `[USER]`
- **Request**: `multipart/form-data` with a `file` (PDF) and a `template_id` (string).
- **Response Body**: Same as `/extract`.

---

### Document Extraction (Asynchronous)

These endpoints immediately return a `task_id` and process the file in the background. Use the `/status` and `/result` endpoints to check progress and retrieve the output.

#### `POST /async-extract`
- **Description**: Asynchronously extracts data from a single PDF, automatically generating a template.
- **Auth**: `[USER, API]`
- **Request**: `multipart/form-data` with a `file` field.
- **Response Body**:
  ```json
  "your-unique-task-id"
  ```

#### `POST /async-extract-with-template`
- **Description**: Asynchronously extracts data from a single PDF using a predefined template.
- **Auth**: `[USER, API]`
- **Request**: `multipart/form-data` with a `file` (PDF) and a `template_id` (string).
- **Response Body**:
  ```json
  "your-unique-task-id"
  ```

#### `POST /extract-many-with-template`
- **Description**: Asynchronously extracts data from multiple PDFs using a single predefined template.
- **Auth**: `[USER, API]`
- **Request**: `multipart/form-data` with a `files` list (multiple PDFs) and a `template_id` (string).
- **Response Body**:
  ```json
  {
    "total_pages": 10,
    "files_summary": [
      { "...summary for file 1..." },
      { "...summary for file 2..." }
    ]
  }
  ```

---

### Async Task Management

#### `GET /status/{task_id}`
- **Description**: Checks if an asynchronous task has completed.
- **Auth**: `[USER, API]`
- **Response Body**: `true` or `false`.

#### `GET /result/{task_id}`
- **Description**: Retrieves the result of a completed asynchronous task.
- **Auth**: `[USER, API]`
- **Response Body**: The same as the synchronous equivalent (e.g., the output of `/extract`).

---

### Template Management

#### `POST /harmonize-templates`
- **Description**: Merges a list of JSON schemas into a single, harmonized schema.
- **Auth**: `[USER, API]`
- **Request Body**: A JSON array of schema objects.
  ```json
  [
    { "schema1": "..." },
    { "schema2": "..." }
  ]
  ```
- **Response Body**:
  ```json
  {
    "result": { "...harmonized schema..." }
  }
  ```
