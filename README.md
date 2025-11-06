
Here is the new workflow for managing project releases on the website:

1.  **Automation:** The `index.html` file now has a `loadProjects()` JavaScript function. It automatically fetches the release list (title, download link, changelog link) directly from the GitHub API.

2.  **Your Task (New Release):** You no longer need to edit the HTML to add a new project card.

3.  **Steps to Add a New Release (e.g., v2.4):**
    * Open the `index.html` file.
    * Find the `const introTexts = { ... }` JavaScript object.
    * Add a new changelog entry for the release. The key must match the release tag (e.g., 'v2.4' becomes 'changelog-toolkit24').
    * Add this key to both the `id:` (Indonesian) and `en:` (English) sections.

4.  **Example Addition:**
    ```javascript
    const introTexts = {
      id: {
        "changelog-toolkit24": "<ul><li>Fitur baru...</li></ul>", // <-- ADD THIS
        "changelog-toolkit23": "<ul><li>...</li></ul>",
      },
      en: {
        "changelog-toolkit24": "<ul><li>New feature...</li></ul>", // <-- ADD THIS
        "changelog-toolkit23": "<ul><li>...</li></ul>",
      }
    };
    ```

5.  **Final Step:** Save, commit, and push the `index.html` file. The website will automatically display the new release.
