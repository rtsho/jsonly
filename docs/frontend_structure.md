# Frontend Application Structure

This document provides an overview of the `jsonly-frontend/src` directory structure and key components to help experienced React developers understand the project and contribute effectively.

The application is a React single-page application (SPA) built with Vite, using TypeScript, Tailwind CSS, and React Router for navigation. It interacts with a backend API to handle PDF uploads, JSON extraction, and template management.

## High-Level Structure

The `src` directory is organized into several key folders:

- `components/`: Reusable UI components.
- `context/`: React Context providers for global state management (e.g., authentication, application state).
- `pages/`: Top-level components representing different views or pages of the application.
- `services/`: Modules for interacting with external services, such as the backend API or Firebase.
- `utils/`: Utility functions and helper modules.

The root of the `src` directory contains the main entry point (`main.tsx`), the main application component (`App.tsx`), global styles (`index.css`), and environment type definitions (`vite-env.d.ts`).

## Entry Point (`main.tsx`)

- This is the application's entry point.
- It uses `createRoot` from `react-dom/client` to render the main `<App />` component into the DOM element with the ID 'root'.
- `StrictMode` is used for highlighting potential problems in the application.

## Main Application Component (`App.tsx`)

- Sets up the main application layout and routing.
- Uses `react-router-dom` for client-side navigation.
- Wraps the application with `<AppProvider>` from `./context/AppContext` to provide global state.
- Includes core layout components: `<Sidebar>`, `<Header>`.
- Defines application routes using `<Routes>` and `<Route>` for different pages (`/`, `/verify-email`, `/template`, `/credentials`, `/usage`, `/subscription`).
- Manages the sidebar's collapsed state.
- Includes an `<AuthModal>` component, controlled by the `AppContext`.
- Contains a simple footer.

## Components (`components/`)

This directory contains various reusable React components used throughout the application. Based on imports in `App.tsx` and the application description, key components likely include:

- `AuthModal.tsx`: Handles user authentication (login/signup).
- `CreateTemplateModal.tsx`: (Already examined) Modal for creating new templates, includes JSON editor/textarea toggle.
- `FileUploadSection.tsx`: Component for handling PDF file uploads.
- `Header.tsx`: Application header, potentially containing navigation or user information.
- `JsonViewer.tsx`: Component for displaying JSON data.
- `Sidebar.tsx`: Navigation sidebar component.
- `VerifyEmail.tsx`: Component for handling email verification.
- *Other components*: May include components for displaying lists, forms, buttons, etc.

## Context (`context/`)

This directory manages global application state using React Context.

- `AppContext.tsx`: Provides application-wide context, likely including user authentication status, modal states (like `isAuthModalOpen`), and potentially other shared data or functions. The `useAppContext` hook is provided for easy access to this context.

## Pages (`pages/`)

This directory contains the top-level components that are rendered by the `react-router-dom` routes defined in `App.tsx`.

- `HomePage.tsx`: The main landing page component.
- `TemplatePage.tsx`: Page for managing user templates.
- `CredentialsPage.tsx`: Page for managing API credentials or similar settings.
- `UsagePage.tsx`: Page displaying user usage statistics.
- `SubscriptionPage.tsx`: Page for managing user subscriptions.
- *Other pages*: Potentially other pages as needed for the application flow.

## Services (`services/`)

This directory contains modules responsible for interacting with external services.

- `api.ts`: Module for making API calls to the backend. This would likely contain functions for uploading files, fetching templates, handling authentication requests, etc.
- `firebase.ts`: Module for interacting with Firebase services, likely used for authentication and potentially other backend features.

## Utils (`utils/`)

This directory contains general utility functions and helper modules that can be used across the application.

- `helpers.ts`: A common place for miscellaneous helper functions that don't fit into other categories.

## Other Files

- `index.css`: Contains global CSS styles, including Tailwind CSS directives and potentially custom styles.
- `vite-env.d.ts`: TypeScript declaration file for Vite environment variables.

This structure promotes modularity and separation of concerns, making the codebase easier to understand, maintain, and extend.