# KAWACH: Advanced Cybersecurity Suite 🛡️

### 🔗 Live Project Links
- **🌐 Live Dashboard**: [https://kawach-livid.vercel.app/](https://kawach-livid.vercel.app/)
- **⚙️ Backend API**: [https://kawach-backend.onrender.com](https://kawach-backend.onrender.com)

KAWACH is a modular, high-performance cybersecurity ecosystem designed to provide multi-layered protection for digital assets. It features a real-time device security scanner, an AES-256 encrypted password vault, a breach scanner, and a browser extension for active phishing protection.

## 🚀 Key Modules

- **🖥️ Device Security Scanner**: Low-level OS inspection for registry vulnerabilities, unsecured Wi-Fi protocols, and suspicious active processes.
- **🔐 AES-256 Vault**: Military-grade symmetric encryption for password storage. Uses unique Initialization Vectors (IV) for every entry.
- **⚠️ Breach Pulse**: Real-time lookup against massive leaked databases (HIBP/XposedOrNot) to identify exposed credentials.
- **🔍 OSINT Engine**: Digital footprint extraction from GitHub, Reddit, HackerNews, and Gravatar.
- **🌐 Browser Shield**: Chrome extension that intercept phishing attempts and evaluates URLs against OWASP standards in real-time.

## 🛠️ Technical Stack

- **Backend**: Python (Flask, SQLite, Bcrypt, PyCryptodome, Psutil)
- **Frontend**: React (Vite, Axios, Lucide Icons, Glassmorphism CSS)
- **Browser**: Manifest V3 Chrome Extension (JavaScript, Content Scripts)

## 📦 Installation

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Set your `KAWACH_AES_KEY`.
4. Run the server:
   ```bash
   python app.py
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend_web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dashboard:
   ```bash
   npm run dev
   ```

### Browser Extension
1. Download the package from the **Extension Integration** tab on the KAWACH Dashboard.
2. Unzip the file.
3. Go to `chrome://extensions` in your browser.
4. Enable **Developer mode** and click **Load unpacked**.
5. Select the unzipped folder.

## 🛡️ Security Best Practices
- **Encryption**: Passwords in the vault are never stored in plain text. They are encrypted using AES-256-CBC.
- **Privacy**: Breach checks use k-Anonymity (only the first 5 characters of a hash are sent to external APIs).
- **Hardening**: Backend routes are isolated and sanitized to prevent SQL injection and unauthorized access.

---
*Built for security professionals and privacy enthusiasts.*
