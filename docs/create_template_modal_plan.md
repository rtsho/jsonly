# Create Template Modal Enhancement Plan

This document outlines the plan to enhance the `CreateTemplateModal.tsx` component to allow users to choose between building the JSON step by step using `json-edit-react` or copy-pasting a valid JSON definition in a text area.

**Goal:** Implement a toggle switch to allow users to select their preferred JSON input method.

**Detailed Plan:**

1.  **Add State for Input Method:** Introduce a new state variable within the `CreateTemplateModal` component to track whether the JSON editor or the text area is active. Let's call it `useEditor`, initialized to `true` by default.
2.  **Add State for Text Area Content:** Introduce another state variable, `textAreaContent`, to hold the string content of the text area when it's active.
3.  **Add Toggle UI:** Add a checkbox or toggle switch element near the "Template JSON" label. This element will control the `useEditor` state.
4.  **Conditional Rendering:** Implement conditional rendering logic to display either the `<JsonEditor>` component (when `useEditor` is `true`) or a `<textarea>` element (when `useEditor` is `false`).
5.  **Synchronize Data on Switch:**
    *   When switching from the editor to the text area (`useEditor` becomes `false`), stringify the current `templateJson` and set it as the value of `textAreaContent`.
    *   When switching from the text area to the editor (`useEditor` becomes `true`), attempt to parse the `textAreaContent` string. If successful, update the `templateJson` state with the parsed object. If parsing fails (invalid JSON), handle the error (e.g., display a message, prevent switching, or revert to the last valid JSON).
6.  **Text Area Input Handling:** Add an `onChange` handler to the `<textarea>` that updates the `textAreaContent` state as the user types.
7.  **Save Logic:** The existing `onSave` function uses the `templateJson` state. As long as the `templateJson` state is correctly updated when switching from the text area (step 5), the save functionality should work without modification.

**Component Structure and Data Flow:**

```mermaid
graph TD
    A[CreateTemplateModal] --> B{useEditor is true?};
    B -- Yes --> C[Render JsonEditor];
    B -- No --> D[Render Textarea];
    A --> E[Toggle Switch];
    E --> A; %% Updates useEditor state
    C --> F[templateJson state]; %% JsonEditor updates templateJson
    D --> G[textAreaContent state]; %% Textarea updates textAreaContent
    G --> H{Parse on switch to Editor?};
    H -- Success --> F; %% Update templateJson
    H -- Failure --> I[Handle Error];
    F --> C; %% JsonEditor uses templateJson
    F --> D; %% Textarea displays stringified templateJson
    A --> J[onSave function];
    F --> J; %% onSave uses templateJson