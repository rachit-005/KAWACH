import firebase_admin
from firebase_admin import credentials, firestore
import os

# To use Firebase, you need to download your serviceAccountKey.json from:
# Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
# Place that file in the 'backend/' directory.

# Using an environment variable or a default file path
# The specific key file provided by the user
SERVICE_ACCOUNT_PATH = os.getenv('FIREBASE_SERVICE_ACCOUNT', 'kawach-e9ac6-firebase-adminsdk-fbsvc-8d57e85987.json')

def init_firebase():
    """
    Initializes Firebase Admin SDK.
    """
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
            print("🔥 Firebase Admin initialized successfully.")
        except Exception as e:
            print(f"⚠️ Firebase Initialization Error: {e}")
            print("Make sure 'serviceAccountKey.json' exists in the backend folder.")

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
