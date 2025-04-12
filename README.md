# 🏥 Smart Care Assistant

Smart Care Assistant is a modern web application designed to support junior doctors and small clinics in managing patient rounds, logging vitals and symptoms, tracking medications, detecting Adverse Drug Reactions (ADR), and generating end-of-day health reports.

## 🚀 Features

### 🩺 Doctor Dashboard
- View patient list with filters and last seen info.
- Add/Update round notes including vitals, symptoms, and observations.
- Track prescriptions and check for drug interactions using AI + RxNav API.
- Get real-time alerts on potential ADRs.
- Visualize symptom trends and vitals over time.
- Generate and download end-of-day reports in PDF format.

### 👤 Patient Dashboard
- View current vitals, symptoms, and medication summary.
- Access ADR alerts and symptom trends.
- Track personal health history securely.

### 📊 Data Insights
- Chart.js-based trends visualization.
- ADR detection powered by OpenAI + RxNav API.
- Grouped prescriptions by disease, date, and status.

## 🧱 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase Firestore & Firebase Authentication
- **Charting**: Chart.js
- **ADR Detection**: OpenAI API + RxNav Interaction Checker
- **PDF Reports**: [html2pdf.js](https://www.npmjs.com/package/html2pdf.js)


## 🔐 Authentication

- Firebase Authentication is used to manage secure sign-in for doctors and patients.
- Doctors must be approved by the admin before accessing the dashboard.

## 📦 Database Structure (Firestore)

- `users` – Stores info about doctors and patients.
- `patients` – Contains personal and medical history.
- `rounds` – Daily vitals, symptoms, and doctor notes.
- `prescriptions` – Active and past medication records.
- `adrAlerts` – Suspected adverse drug reactions with severity.

## 🛠️ Setup & Installation

1. Clone the repository:
   git clone https://github.com/SaiPrashanth897/heathcare1)
   cd smart-care-assistant

   #excuation
   
   1.clone by repo
   
   2.open file
   
   3.open hackthon in it
   
   4.run landing-page.html
   



