# Deploying KAWACH to Render

This guide outlines the steps to deploy the KAWACH Backend (Flask) and Frontend (React) to [Render](https://render.com/).

## 1. Backend Deployment (Flask)

1.  **Create a New Web Service** on Render.
2.  **Connect your GitHub Repository**.
3.  **Configure Settings**:
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r backend/requirements.txt`
    *   **Start Command**: `gunicorn --chdir backend app:app`
4.  **Environment Variables**:
    *   `KAWACH_AES_KEY`: (Your 32-character key)
    *   `PYTHON_VERSION`: `3.9` (or your preferred version)
5.  **Database Note**: Render's free tier uses an ephemeral file system. Your `kawach.db` will reset on every redeploy. For persistence, attach a **Render Blueprints Disk** to the `/backend` folder.

## 2. Frontend Deployment (React)

1.  **Create a New Static Site** on Render.
2.  **Connect your GitHub Repository**.
3.  **Configure Settings**:
    *   **Build Command**: `cd frontend_web && npm install && npm run build`
    *   **Publish Directory**: `frontend_web/dist`
4.  **Update API URL**:
    *   Once your backend is deployed, you will get a URL (e.g., `https://kawach-api.onrender.com`).
    *   Update the `API_BASE_URL` in `frontend_web/src/App.jsx` to match this URL.

## 3. Browser Extension

*   Since the extension connects to the backend, once you deploy to Render, you must update the `host_permissions` in `extension/manifest.json` and the API URL in `extension/background.js` and `extension/content.js` to point to your Render backend URL.
*   Run `python package_extension.py` locally and commit the new `.zip` if you want the dashboard download to work with the production backend.

## 📋 Final Checklist Before Push
- [x] `.gitignore` includes `kawach.db` and `.env`.
- [x] `requirements.txt` includes `gunicorn`.
- [x] `app.py` uses `os.environ.get("PORT")`.
- [x] `App.jsx` uses dynamic `API_BASE_URL`.
