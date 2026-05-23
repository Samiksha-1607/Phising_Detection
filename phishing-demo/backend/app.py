import os
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS

from feature_extractor import (
    FEATURE_NAMES,
    extract_features,
    features_to_dict,
    is_suspicious_url,
)
from model_loader import load_pickle_model, legacy_predict
from preprocess import load_scaler, raw_features_to_model_input

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

ACCOUNTS = {
    "attacker@demo.com": {"password": "attacker123", "role": "attacker"},
    "victim@demo.com": {"password": "victim123", "role": "victim"},
    "admin@demo.com": {"password": "admin123", "role": "admin"},
}

emails = [
    {
        "id": 0,
        "from": "support@paypa1-secure.tk",
        "to": "victim@demo.com",
        "subject": "⚠️ Urgent: Your PayPal Account Is Limited",
        "body": (
            "Dear Customer,\n\n"
            "We detected suspicious login activity on your account.\n"
            "Verify immediately or your account will be suspended in 24 hours.\n\n"
            "Click here to verify: http://paypa1-secure-login.tk/verify?user=victim\n"
        ),
        "link": "http://paypa1-secure-login.tk/verify?user=victim",
        "timestamp": "2024-01-15 09:15:00",
        "read": False,
        "reported": False,
    },
    {
        "id": 1,
        "from": "noreply@amaz0n-deals.ml",
        "to": "victim@demo.com",
        "subject": "🎁 You've Won a $500 Amazon Gift Card!",
        "body": (
            "Congratulations!\n\n"
            "You have been selected as today's lucky winner.\n"
            "Claim your $500 Amazon Gift Card now before it expires!\n\n"
            "Claim here: http://amaz0n-giftcard.ml/claim?id=WIN500\n"
        ),
        "link": "http://amaz0n-giftcard.ml/claim?id=WIN500",
        "timestamp": "2024-01-15 11:00:00",
        "read": False,
        "reported": False,
    },
    {
        "id": 2,
        "from": "it-support@google.com",
        "to": "victim@demo.com",
        "subject": "Scheduled maintenance notification",
        "body": (
            "Dear User,\n\n"
            "We will be performing scheduled maintenance on Sunday from 2AM-4AM UTC.\n"
            "No action required.\n\n"
            "Best regards,\n"
            "Google IT Team\n"
        ),
        "link": "https://google.com/support",
        "timestamp": "2024-01-15 13:30:00",
        "read": False,
        "reported": False,
    },
]

reports = []
scan_log = []
admin_actions = []
next_email_id = max(email["id"] for email in emails) + 1
next_report_id = 1
model = None
scaler_ready = False


def load_model():
    global model, scaler_ready
    model_path = os.path.join(os.path.dirname(__file__), "Phishing_model.pkl")
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Phishing_model.pkl not found at {model_path}. "
            "Place your trained model file in the backend/ folder."
        )
    model = load_pickle_model(model_path)
    load_scaler()
    scaler_ready = True


def predict_url(url: str) -> dict:
    feature_vector = extract_features(url)
    features = features_to_dict(feature_vector)
    features_flagged = [name for name, value in zip(FEATURE_NAMES, feature_vector) if value == -1]

    suspicious, reasons = is_suspicious_url(url)
    if suspicious:
        features_flagged.extend(reasons)
        return {
            "url": url,
            "prediction": "PHISHING",
            "confidence": 0.98,
            "risk_score": 98,
            "features_flagged": features_flagged,
            "features": features,
        }

    scaled_input = raw_features_to_model_input(feature_vector)
    prediction_arr, proba = legacy_predict(model, scaled_input)
    raw_pred = int(prediction_arr[0])
    confidence = float(max(proba[0]))
    prediction = "LEGITIMATE" if raw_pred == 1 else "PHISHING"

    return {
        "url": url,
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "risk_score": int(round(confidence * 100)),
        "features_flagged": features_flagged,
        "features": features,
    }


def build_stats() -> dict:
    total_scanned = len(scan_log)
    total_phishing = sum(1 for entry in scan_log if entry["prediction"] == "PHISHING")
    total_legitimate = sum(1 for entry in scan_log if entry["prediction"] == "LEGITIMATE")
    total_reports = len(reports)
    total_resolved = sum(1 for report in reports if report.get("resolved"))

    scans_by_day = {}
    for entry in scan_log:
        day = entry["timestamp"].split(" ")[0]
        bucket = scans_by_day.setdefault(day, {"date": day, "phishing": 0, "legitimate": 0})
        if entry["prediction"] == "PHISHING":
            bucket["phishing"] += 1
        else:
            bucket["legitimate"] += 1

    top_features = {}
    for entry in scan_log:
        for feature in entry.get("features_flagged", []):
            top_features[feature] = top_features.get(feature, 0) + 1

    top_features_flagged = [
        {"feature": feature, "count": count}
        for feature, count in sorted(top_features.items(), key=lambda item: item[1], reverse=True)
    ]

    threat_level = "LOW"
    if total_scanned > 0:
        ratio = total_phishing / total_scanned
        if ratio >= 0.6:
            threat_level = "HIGH"
        elif ratio >= 0.3:
            threat_level = "MEDIUM"

    return {
        "total_scanned": total_scanned,
        "total_phishing": total_phishing,
        "total_legitimate": total_legitimate,
        "total_reports": total_reports,
        "total_resolved": total_resolved,
        "scans_by_day": sorted(scans_by_day.values(), key=lambda item: item["date"]),
        "top_features_flagged": top_features_flagged,
        "threat_level": threat_level,
    }


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    account = ACCOUNTS.get(email)
    if account and account["password"] == password:
        return jsonify({"success": True, "role": account["role"], "email": email})

    return jsonify({"success": False, "error": "Invalid credentials"}), 401


@app.route("/inbox/<path:email>", methods=["GET"])
def inbox(email):
    email = email.strip().lower()
    received = [e for e in emails if e["to"].lower() == email]
    sent = [e for e in emails if e["from"].lower() == email]
    return jsonify({"received": received, "sent": sent})


@app.route("/send-email", methods=["POST"])
def send_email():
    global next_email_id
    data = request.get_json() or {}
    from_addr = (data.get("from") or "").strip()
    to_addr = (data.get("to") or "").strip()
    subject = (data.get("subject") or "").strip()
    body = (data.get("body") or "").strip()
    link = (data.get("link") or "").strip()

    if not all([from_addr, to_addr, subject, body]):
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    email_entry = {
        "id": next_email_id,
        "from": from_addr,
        "to": to_addr,
        "subject": subject,
        "body": body,
        "link": link,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "read": False,
        "reported": False,
    }
    emails.append(email_entry)
    next_email_id += 1

    return jsonify({"success": True, "email": email_entry})


@app.route("/email/<int:email_id>/read", methods=["PATCH"])
def mark_read(email_id):
    target = next((email for email in emails if email["id"] == email_id), None)
    if not target:
        return jsonify({"success": False, "error": "Email not found"}), 404
    target["read"] = True
    return jsonify({"success": True, "email": target})


@app.route("/scan-url", methods=["POST"])
def scan_url():
    if model is None or not scaler_ready:
        return jsonify({"success": False, "error": "ML model or scaler not loaded"}), 503

    data = request.get_json() or {}
    url = (data.get("url") or "").strip()
    email_id = data.get("email_id")

    if not url:
        return jsonify({"success": False, "error": "URL is required"}), 400

    target = next((email for email in emails if email["id"] == email_id), None)
    if not target:
        return jsonify({"success": False, "error": "Email not found"}), 404

    result = predict_url(url)
    target["read"] = True
    scan_log.append(
        {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "email_id": email_id,
            "url": url,
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "risk_score": result["risk_score"],
            "features_flagged": result["features_flagged"],
        }
    )

    return jsonify(result)


@app.route("/report", methods=["POST"])
def submit_report():
    global next_report_id
    data = request.get_json() or {}
    email_id = data.get("email_id")
    url = (data.get("url") or "").strip()
    victim_email = (data.get("victim_email") or "").strip().lower()
    reason = (data.get("reason") or "").strip()
    description = (data.get("description") or "").strip()

    if not all([email_id is not None, url, victim_email, reason, description]):
        return jsonify({"success": False, "error": "Missing required report fields"}), 400

    target_email = next((email for email in emails if email["id"] == email_id), None)
    if not target_email:
        return jsonify({"success": False, "error": "Email not found"}), 404

    report_entry = {
        "id": next_report_id,
        "email_id": email_id,
        "url": url,
        "victim_email": victim_email,
        "reason": reason,
        "description": description,
        "status": "Pending Review",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "resolved": False,
        "admin_note": None,
        "action_taken": None,
    }
    reports.append(report_entry)
    next_report_id += 1
    target_email["reported"] = True
    return jsonify({"success": True, "report": report_entry})


@app.route("/reports", methods=["GET"])
def get_reports():
    return jsonify({"reports": reports})


@app.route("/report/<int:report_id>/action", methods=["PATCH"])
def action_report(report_id):
    global next_email_id
    data = request.get_json() or {}
    action_taken = (data.get("action_taken") or "").strip()
    admin_note = (data.get("admin_note") or "").strip()

    if not all([action_taken, admin_note]):
        return jsonify({"success": False, "error": "Action and note are required"}), 400

    report = next((entry for entry in reports if entry["id"] == report_id), None)
    if not report:
        return jsonify({"success": False, "error": "Report not found"}), 404

    if report["resolved"]:
        return jsonify({"success": False, "error": "Report already resolved"}), 400

    report["resolved"] = True
    report["status"] = "Resolved"
    report["action_taken"] = action_taken
    report["admin_note"] = admin_note
    report["resolved_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    original_email = next((email for email in emails if email["id"] == report["email_id"]), None)
    original_subject = original_email["subject"] if original_email else "Phishing report"
    notification_body = (
        "Dear Victim,\n\n"
        "Thank you for reporting the phishing attempt. We have taken the following action:\n\n"
        f"Action: {action_taken}\n"
        f"Admin Note: {admin_note}\n\n"
        "The malicious URL has been flagged in our system. You are safe.\n\n"
        "Stay vigilant,\n"
        "Security Admin Team"
    )

    notification_email = {
        "id": next_email_id,
        "from": "admin@demo.com",
        "to": report["victim_email"],
        "subject": f"✅ Your Phishing Report Has Been Resolved — {original_subject}",
        "body": notification_body,
        "link": report["url"],
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "read": False,
        "reported": False,
    }
    emails.append(notification_email)
    next_email_id += 1

    admin_actions.append(
        {
            "report_id": report_id,
            "action_taken": action_taken,
            "admin_note": admin_note,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
    )

    return jsonify({"success": True, "report": report, "notification": notification_email})


@app.route("/stats", methods=["GET"])
def stats():
    return jsonify(build_stats())


if __name__ == "__main__":
    try:
        load_model()
        print("Phishing model and scaler loaded successfully.")
    except FileNotFoundError as e:
        print(f"WARNING: {e}")
        print("Scan endpoint will be unavailable until model/scaler files are added.")
        print("Run: python build_scaler.py")
    except Exception as e:
        print(f"ERROR loading model: {e}")
        print(
            "Your Phishing_model.pkl may have been saved with an older scikit-learn "
            "version. See README.md troubleshooting."
        )

    app.run(debug=True, port=5000)
