from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sqlite3
from models.database import init_db, get_db_connection

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Initialize Database
init_db()

# Import Services
from services.phishing import evaluate_url
from services.device import scan_device
from services.scoring import calculate_cyber_health_score
from services.encryption import hash_password, check_password, encrypt_vault_data, decrypt_vault_data
from services.breach import check_breach

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "KAWACH Backend is running"})

@app.route('/api/phishing/check', methods=['POST'])
def check_phishing():
    data = request.json
    url = data.get('url', '')
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    result = evaluate_url(url)
    return jsonify(result)

@app.route('/api/scan/device', methods=['GET'])
def run_device_scan():
    result = scan_device()
    return jsonify(result)

@app.route('/api/scan/score', methods=['POST'])
def get_cyber_score():
    data = request.json
    # Pull actual device risks
    device_scan = scan_device()
    
    score = calculate_cyber_health_score(
        device_risks=device_scan['device_risks'],
        network_secure=device_scan['network_secure'],
        breached_accounts=data.get('breached_accounts', 0),
        weak_passwords=data.get('weak_passwords', 0)
    )
    score['advanced_metrics'] = device_scan.get('advanced_metrics', {})
    return jsonify(score)

@app.route('/api/breach/check', methods=['POST'])
def run_breach_check():
    data = request.json
    password = data.get('password', '')
    if not password:
        return jsonify({"error": "Password is required"}), 400
    count = check_breach(password=password)
    return jsonify({"breaches_found": count})

@app.route('/api/breach/email', methods=['POST'])
def run_email_breach_check():
    data = request.json
    email = data.get('email', '')
    if not email:
        return jsonify({"error": "Email is required"}), 400
    from services.breach import check_email_breach
    results = check_email_breach(email)
    return jsonify({"breaches": results, "count": len(results)})

@app.route('/api/osint/scan', methods=['POST'])
def osint_scan():
    data = request.json
    username = data.get('username', '')
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    from services.osint import scan_username
    found_sites = scan_username(username)
    
    return jsonify({
        "username": username,
        "profiles_found": len(found_sites),
        "platforms": found_sites,
        "risk_assessment": "High Exposure" if len(found_sites) >= 2 else "Moderate Exposure"
    })

@app.route('/api/vault', methods=['GET', 'POST'])
@app.route('/api/vault/<string:item_id>', methods=['DELETE']) # Changed to string for Firestore Doc ID
def manage_vault(item_id=None):
    db = get_db_connection()
    user_id = 1 # Prototype user
    
    if request.method == 'DELETE':
        if item_id is None:
            return jsonify({"error": "ID required"}), 400
        # Firestore delete
        db.collection('vault').document(item_id).delete()
        return jsonify({"status": "Success", "message": "Entry removed"})

    if request.method == 'POST':
        data = request.json
        website = data.get('website')
        username = data.get('username')
        password = data.get('password')
        
        encrypted_pw, iv = encrypt_vault_data(password)
        
        # Firestore Create
        db.collection('vault').add({
            "user_id": user_id,
            "website": website,
            "username": username,
            "encrypted_password": encrypted_pw,
            "iv": iv
        })
        return jsonify({"status": "Success", "message": "Password encrypted (AES-256) and saved"})
        
    elif request.method == 'GET':
        # Firestore Read
        docs = db.collection('vault').where('user_id', '==', user_id).get()
        passwords = []
        for doc in docs:
            row = doc.to_dict()
            try:
                decrypted = decrypt_vault_data(row['encrypted_password'], row['iv'])
            except Exception as e:
                decrypted = "Error decrypting"
            passwords.append({
                "id": doc.id,
                "website": row['website'],
                "username": row['username'],
                "password": decrypted
            })
        return jsonify({"vault": passwords})

@app.route('/api/scan/history', methods=['GET'])
def get_scan_history():
    user_id = 1 
    db = get_db_connection()
    # Firestore query
    docs = db.collection('history')\
             .where('user_id', '==', user_id)\
             .order_by('scan_date', direction='DESCENDING')\
             .limit(10)\
             .get()
             
    history = []
    for doc in docs:
        data = doc.to_dict()
        # Firestore doesn't automatically have 'scan_date' as Timestamp unless we send it.
        # Handle conversion if needed
        history.append(data)
    
    return jsonify(history)

@app.route('/api/scan/save', methods=['POST'])
def save_scan_result():
    data = request.json
    user_id = 1 
    db = get_db_connection()
    
    from datetime import datetime
    db.collection('history').add({
        "user_id": user_id,
        "cyber_health_score": data['score'],
        "device_risks_found": data['device_risks'],
        "network_risks_found": data['network_risks'],
        "scan_date": datetime.now() # Use server time
    })
    return jsonify({"status": "success"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
