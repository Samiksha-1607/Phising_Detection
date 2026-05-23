# 🛡️ Phising_Detection

## 📌 Project Overview

Phising_Detection is a cybersecurity project that combines **Machine Learning**, **Flask**, and **Cisco Packet Tracer** to detect phishing websites and simulate real-world phishing attacks inside a network environment.

The project demonstrates how phishing attacks occur, how malicious URLs can be identified, and how administrators can monitor and respond to threats.

---

## ✨ Key Features

✅ Machine Learning based phishing URL detection  
✅ Gradient Boosting Classifier model  
✅ Suspicious URL analysis using extracted features  
✅ Flask backend integration  
✅ React frontend interface  
✅ Cisco Packet Tracer network simulation  
✅ Attacker – Victim – Admin workflow  
✅ DNS Server configuration  
✅ Email communication simulation  
✅ Security Dashboard monitoring  
✅ Warning popup & threat alerts  
✅ Admin response system

---

## 🧠 Machine Learning Module

The ML model classifies URLs as:

- **Legitimate Website**
- **Phishing Website**

### URL Features Used

- URL Length
- Number of Dots
- HTTPS Verification
- Special Characters
- Subdomain Analysis
- Suspicious Keywords
- IP Address Usage

### Algorithm Used

**Gradient Boosting Classifier**

Used for identifying phishing patterns and improving prediction accuracy.

---

## 🌐 Network Simulation (Cisco Packet Tracer)

The project uses Cisco Packet Tracer to simulate phishing attacks in a controlled network environment.

### Components Used

- Attacker PC
- Victim PC
- Admin PC
- Router
- Switch
- Email Server
- DNS Server
- Legit Server
- Phishing Server

---

## 🔄 Project Workflow

1. Attacker sends phishing email.
2. Victim receives suspicious link.
3. DNS resolves website request.
4. Victim opens webpage.
5. ML model checks URL.
6. Warning alert displayed.
7. Victim reports suspicious website.
8. Admin monitors dashboard.
9. Security action performed.

---

## 🛠️ Technologies Used

### Backend
- Python
- Flask
- Scikit-learn
- Pandas
- NumPy

### Frontend
- React
- JavaScript
- HTML
- CSS
- Tailwind CSS

### Networking
- Cisco Packet Tracer
- TCP/IP
- HTTP / HTTPS
- DNS
- Ethernet

---

## 🚀 Installation

Clone repository:

```bash
git clone https://github.com/your-username/Phising_Detection.git
```

Move into folder:

```bash
cd Phising_Detection
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
python app.py
```

Run frontend:

```bash
npm install
npm run dev
```

---

## 🔒 Security Measures

- ML-based URL Detection
- DNS Monitoring
- Network Segmentation
- HTTPS Verification
- User Warning System
- Access Control Concepts

---

## 📈 Future Improvements

- Deep Learning integration
- Browser Extension support
- Cloud deployment
- Real-time phishing intelligence
- Advanced dashboard analytics

---

## 👨‍💻 Team Members

- Aditya Sonakanalli
- Samiksha Hubale
- Aditi Nalawade

---

## 📜 License

This project is created for educational and academic purposes.
