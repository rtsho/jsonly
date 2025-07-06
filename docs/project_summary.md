Based on the documentation files in the `docs/` folder and the pages in the `jsonly-frontend/src/pages` folder, this project, named **Jsonly**, is a web application and API service designed to extract structured JSON data from PDF files.

Here's a summary of its key aspects:

1.  **Core Functionality:** The primary purpose is to process uploaded PDF files and return structured information in JSON format. This can be done using pre-defined templates or templates generated with AI.
2.  **API:** It provides a [`/extract`](docs/endpoints.md:3) API endpoint that allows users to programmatically upload files and specify a template ID to get the JSON output. API access is authenticated using `client_id` and `client_secret`.
3.  **Frontend Application:** The project includes a React single-page application (`jsonly-frontend`) built with TypeScript, Tailwind CSS, and React Router. This frontend serves as a user interface for interacting with the service.
4.  **Frontend Features:** The frontend provides several key pages and components:
    *   [`HomePage.tsx`](jsonly-frontend/src/pages/HomePage.tsx): Likely the main landing page where users can upload files and manage templates.
    *   [`TemplatePage.tsx`](jsonly-frontend/src/pages/TemplatePage.tsx): Allows users to view, create, edit (using a JSON editor), delete, and organize their templates into folders. It also supports "harmonizing" templates within a folder using AI and setting up webhook URLs for templates.
    *   [`CredentialsPage.tsx`](jsonly-frontend/src/pages/CredentialsPage.tsx): Enables users to view their API `client_id` and regenerate their `client_secret`. It also provides code examples (curl, Python, Postman) for using the [`/extract`](docs/endpoints.md:3) API.
    *   [`UsagePage.tsx`](jsonly-frontend/src/pages/UsagePage.tsx): Displays the user's document processing activity, including total pages processed, current month's usage, and usage over time (via a chart). It also shows information about the user's current subscription plan and remaining pages.
    *   [`SubscriptionPage.tsx`](jsonly-frontend/src/pages/SubscriptionPage.tsx): Lists the available subscription plans (Basic, Pro, Business) with details on page quotas and pricing, allowing users to manage their subscription.
    *   [`BillingPage.tsx`](jsonly-frontend/src/pages/BillingPage.tsx): A placeholder indicating future billing-related features.
    *   **Authentication:** Includes components for user sign-in, sign-up, and email verification.
5.  **Backend/Data:** The project uses Firebase for managing user data, including authentication, storing user credentials (`clientId`, `clientSecret`), tracking document analysis history (`documentAnalysis` sub-collection storing `documentName`, `nbPages`, `runAt`), and storing user-defined templates (`templates` collection storing `userId`, `folder`, `template`, `summary`, `webhookUrl`).
6.  **Pricing Model:** The service has a usage-based pricing model, likely tied to the number of pages processed, with different tiers offered through subscription plans. The documentation mentions costs related to underlying AI/document processing services (Gemini, Docupipe).
7.  **Documentation:** The `docs/` folder contains documentation covering API endpoints, Firebase data structure, frontend components and structure, pricing details, and a plan for the usage tracking page.

In essence, Jsonly is a platform that leverages document processing and AI to convert PDFs into structured JSON, offering both an API for developers and a user-friendly web interface for managing templates, credentials, usage, and subscriptions.