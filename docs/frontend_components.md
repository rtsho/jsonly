# Frontend Components Documentation

This document describes each React component in the `jsonly-frontend/src/components/` directory, summarizing its purpose, main props, and notable behaviors.

---

## AuthModal.tsx

**Purpose:**  
A modal dialog for user authentication (sign in and sign up).  
- Supports email/password and Google authentication.
- Handles sign-up flow with email verification.
- Displays error messages and loading states.
- Uses context for authentication actions.

---

## CreateTemplateModal.tsx

**Purpose:**  
A modal for creating and saving new JSON summary templates.
- Allows users to enter a folder name, template name, and define the template JSON (with a toggle between a JSON editor and a textarea).
- Handles validation and error display.
- Used in the template creation flow.

---

## FileUploader.tsx

**Purpose:**  
A drag-and-drop file uploader for PDF and CSV files.
- Handles drag events, file selection, and validation.
- Shows file details and allows users to trigger document analysis.
- Integrates with context to upload the selected file and display loading state.

---

## FileUploadSection.tsx

**Purpose:**  
The main section for uploading documents and managing templates.
- Composes `FileUploader`, `CreateTemplateModal`, and `JsonViewer`.
- Allows users to select or create templates, upload files, and view/edit the resulting JSON summary.
- Handles template fetching, creation, and selection.
- Provides instructions and error handling.


---

## Header.tsx

**Purpose:**  
The main application header.
- Displays the app title and subtitle.
- Shows user info and sign-in/sign-out buttons.
- Integrates with `AuthModal` for authentication.
- Responsive and styled with Tailwind.

---

## JsonViewer.tsx

**Purpose:**  
Displays the JSON summary of an uploaded document.
- Syntax highlights JSON and animates on update.
- Allows saving the summary as a template (with folder/template name).
- Supports webhook integration (enabling, saving, and sending to a webhook URL).
- Shows API usage instructions when webhook is enabled.
- Handles loading and empty states.

---

## Sidebar.tsx

**Purpose:**  
The main navigation sidebar.
- Provides links to all main app routes (Home, Templates, Credentials, Usage, Subscription).
- Collapsible for compact view.
- Highlights the active route.
- Uses icons for navigation items.

---

## VerifyEmail.tsx

**Purpose:**  
Handles email verification via Firebase.
- Reads verification parameters from the URL.
- Applies the verification code and displays success or error messages.
- Used as the target for email verification links.

---