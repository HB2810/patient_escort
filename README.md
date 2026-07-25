# Stavya Spine Hospital - Patient Escort Coordination System

Production-quality, real-time **Patient Escort Coordination System** built for **Stavya Spine Hospital & Research Institute, Ahmedabad**. Manages inter-departmental patient transfers between OPD Cabins, Radiology, Physiotherapy, and Admission with live handover protocols, Web Audio API sound alerts, and Turnaround Time (TAT) tracking.

---

## 🏥 Key Features & Workflow

### 1. OPD Structure (13 Normal + 2 Privileged Cabins)
- **Cabins 1 to 13**: Normal OPD Cabins (Spine Consultant Interactive Panel).
- **Cabins 14 & 15**: **Privileged OPD Cabins 👑** (Highlighted in Gold with High Priority STAT dispatching).

### 2. Inter-Departmental Handover Protocol
- **OPD Escort Team**: Picks up the patient from OPD Cabin (1-15) and transports them to Radiology, Physiotherapy, or Admission.
- **Handover Trigger**: Upon arrival at the target department, OPD Escort clicks `🤝 Arrived at Dept - Initiate Handover`.
- **Dept Acceptance**: Radiology or Physiotherapy Escort Team/Desk clicks `🤝 Accept Handover from OPD Escort`.
- **OPD Escort Released**: OPD Escort becomes `AVAILABLE` immediately for the next patient.
- **Return Handover**: Once the procedure or rehab therapy finishes, Dept Desk clicks `🔄 Procedure Complete`, automatically dispatching a return transfer back to the OPD Cabin!

### 3. Modules & User Interfaces
- **👑 Super Admin Command Center (`/admin`)**: Real-time patient flow, escort fleet roster, cabin matrix, and delay blockers summary.
- **🩺 OPD Front Desk & Consultant Panel (`/opd`)**: 15 Cabin Grid (13 Normal + 2 Privileged) with dispatch modal.
- **☢️ Radiology Front Desk (`/dept`)**: Incoming OPD Escort handovers queue and return trip dispatching.
- **🏋️ Physiotherapy Rehab Dashboard (`/physio`)**: Modality tracking (Traction, Gait Training, Post-Op Rehab), handover acceptance, and therapy completion controls.
- **📱 Escort Mobile Companion (`/escort`)**: Mobile-first touch UI with `Acknowledge`, `Picked Up`, and `Handover` step workflow buttons.

### 4. Audio Alerts & Delay Blockers
- **Synthesized Web Audio API Sounds**: Instant medical chimes on new dispatch requests, pending handovers, and overdue alerts (includes `🔊 Sound On` / `🔇 Muted` header toggle).
- **Overdue Delay Blockers**: Live timers that flag `🚨 OVERDUE PICKUP BLOCKER` (if pickup > 5m) or `⚠️ OVERDUE HANDOVER BLOCKER` (if handover > 3m).

---

## 🚀 Tech Stack

- **Frontend**: React 18 (Vite) + Bootstrap 5 + React Router DOM
- **Real-time**: Socket.io Client + Web Audio API
- **Backend**: Node.js + Express + Socket.io Server
- **Database**: Dual-mode engine — automatic **In-Memory Store Fallback** (zero setup required) + **MySQL** (`mysql2`) pool support.

---

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js (v18 or v20 LTS)

### 1. Start Server (Backend)
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5001
```

### 2. Start Client (Frontend)
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔐 Test Accounts (Password: `Escort@123`)

- **Super Admin**: `admin`
- **OPD Front Desk**: `opd_desk`
- **Radiology Front Desk**: `rad_desk`
- **Physiotherapy Desk**: `physio_desk`
- **Escort Staff**: `escort1`

*Note: Use the **Quick Demo Switch** header bar at the top of the webpage to test all roles with a single click!*

---

## 📌 Pushing to GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Complete Stavya Patient Escort Coordination System"
git branch -M main
git remote add origin https://github.com/HB2810/patient_escort.git
git push -u origin main
```
