# A11yCourseGen AI

This is a Next.js application built in Firebase Studio that uses AI to help educators create accessible course materials for Google Classroom.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- A Google Cloud account with billing enabled.

## 1. Google Cloud Project Setup

To run this application, you need to configure Google APIs and obtain credentials.

1.  **Create a Google Cloud Project:**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project.

2.  **Enable APIs:**
    *   In your new project, navigate to **APIs & Services > Library**.
    *   Search for and enable the following APIs:
        *   **Google Classroom API**
        *   **Google Drive API**
        *   **Vertex AI API** (for the AI features used by Genkit)

3.  **Configure OAuth Consent Screen:**
    *   Go to **APIs & Services > OAuth consent screen**.
    *   Choose **External** and click **Create**.
    *   Fill in the required information (App name, User support email, Developer contact information).
    *   **Scopes:** You don't need to add scopes here; the application will request them programmatically.
    *   **Test Users:** While in "testing" mode, add the Google account(s) you will use to log in locally as test users.

4.  **Create OAuth 2.0 Credentials:**
    *   Go to **APIs & Services > Credentials**.
    *   Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
    *   For **Application type**, select **Web application**.
    *   Under **Authorized redirect URIs**, click **+ ADD URI** and enter `http://localhost:9002/api/auth/callback/google`.
    *   Click **Create**.
    *   A dialog will appear showing your **Client ID** and **Client Secret**. Copy these values for the `.env` file.

5.  **Create an API Key for Genkit/Vertex AI:**
    *   Go to **APIs & Services > Credentials**.
    *   Click **+ CREATE CREDENTIALS** and select **API key**.
    *   Copy the generated API key. It's highly recommended to restrict this key to only allow the **Vertex AI API**.

## 2. Local Installation & Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    *   Create a new file named `.env` in the root of the project (or use the existing one).
    *   Add the credentials you obtained from the Google Cloud Console.

    ```env
    # Google OAuth Credentials (from step 4)
    GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
    GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

    # NextAuth Secret (generate a random secure string)
    # You can use this command in your terminal: openssl rand -base64 32
    NEXTAUTH_SECRET="YOUR_RANDOM_SECRET"

    # Google AI (Genkit) API Key (from step 5)
    # The googleAI() plugin uses this key for authentication.
    GOOGLE_API_KEY="YOUR_API_KEY"
    ```

## 3. Running the Application Locally

You need to run two processes in separate terminal windows: the Next.js development server and the Genkit development server.

1.  **Terminal 1: Start the Genkit AI server:**
    This command starts the service that runs your AI flows. The `--watch` flag will automatically restart it when you change an AI flow file.
    ```bash
    npm run genkit:watch
    ```

2.  **Terminal 2: Start the Next.js application:**
    This command starts the frontend web server.
    ```bash
    npm run dev
    