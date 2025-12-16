# 🌞 Solar Flare Prediction Dashboard

A real-time solar flare monitoring and prediction system using machine learning and NASA data APIs.

## 🚀 Features

- **Real-time Solar Monitoring**: Live data from NASA APIs
- **ML Flare Prediction**: Random Forest model for flare forecasting  
- **Research Dashboard**: Model performance metrics and analytics
- **Professional UI**: Responsive design with real-time updates

Tech Stack

Frontend: React, TypeScript, Tailwind CSS, D3.js  
Backend: FastAPI, Python, Scikit-learn  
Data: NASA DONKI API, SDO/HMI Data  
Deployment: Vercel + Railway

 Model Performance

"accuracy": 0.914,
"precision": 0.209,
"recall": 0.237,
"f1_score": 0.222,
"auc_roc": 0.755,

Backend Setup:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000


Frontend Setup
cd frontend
npm install
npm run dev

Access Points:
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs



When using Visual Studio
open the folder (which you have extracted from the wrar).
you must have had python and node js install on you laptop or desKtop
after opening the folder. open two terminals for both BACKEND and FRONTEND

FOR BACKEND SETUP
cd backend  - CHANGE DIRECTORY TO BACKEND and run the rest of the codes
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
 
then run backend API (backend DOOR): http://localhost:8000 
it should display: Pretty Print {"message":"Solar Flare Prediction API","status":"active","version":"2.0.0","description":"Professional Solar Monitoring System for Global Talent"}



FOR FRONTEND SETUP
cd frontend - CHANGE DIRECTORY TO FRONTEND and run the rest of the code
npm install
npm run dev

Then run Frontend(Frontend DOOR): http://localhost:3000
it should display the DASHBOARD 


Package Managers (Tool Installers)
pip (for Python) - Usually comes with Python

npm (for Node.js) - Comes with Node.js

Code Editor (Where you write code)
VS Code (Recommended): https://code.visualstudio.com/

Or any text editor




