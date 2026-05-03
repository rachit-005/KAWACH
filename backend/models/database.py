import firebase_admin
from firebase_admin import credentials, firestore
import os

# To use Firebase, you need to download your serviceAccountKey.json from:
# Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
# Place that file in the 'backend/' directory.

# Using an environment variable or a default file path
import json

# To use Firebase in production (Render/Vercel), we read from an environment variable.
# Locally, it will still look for the .json file.
FIREBASE_CONFIG_JSON = os.getenv('FIREBASE_CONFIG')
SERVICE_ACCOUNT_PATH = os.getenv('FIREBASE_SERVICE_ACCOUNT', 'kawach-e9ac6-firebase-adminsdk-fbsvc-8d57e85987.json')

def init_firebase():
    """
    Initializes Firebase Admin SDK using either an Env Var or a Local File.
    """
    if not firebase_admin._apps:
        try:
            if FIREBASE_CONFIG_JSON:
                # Load from Render Environment Variable
                config_dict = json.loads(FIREBASE_CONFIG_JSON)
                cred = credentials.Certificate(config_dict)
            else:
                # Load from Local File
                cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
            
            firebase_admin.initialize_app(cred)
            print("🔥 Firebase Admin initialized successfully.")
        except Exception as e:
            print(f"⚠️ Firebase Initialization Error: {e}")

def get_firestore_db():
    init_firebase()
    return firestore.client()

# Re-mapping existing SQLite helper functions to Firebase Logic
# These will be used in app.py to minimize code changes
def init_db():
    # Firestore doesn't need schema initialization like SQL
    pass

def get_db_connection():
    # This now returns the firestore client
    return get_firestore_db()
