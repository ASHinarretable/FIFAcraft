# FIFACraft: FIFA Match Predictor (Minecraft Edition)

An accurate, creative, and pixelated match outcome simulator that predicts football matches using historical FIFA 20 player datasets. The application uses a custom-themed Minecraft frontend coupled with a robust, statistical Flask backend.

---

## Technical Stack
- **Backend:** Python 3.13+, Flask
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla, Web Audio API synthesis)
- **Dataset:** Preprocessed rating values derived from FIFA player overall ratings

---

## 🛠️ Testing Locally

We use Python's built-in `unittest` framework to verify backend match calculations and probabilities.

To run the unit tests:
```powershell
python -m unittest test_predictor.py
```

---

## 🚀 Running the App Locally

### 1. Install Dependencies
Make sure you have Flask installed:
```powershell
pip install flask
```

### 2. Preprocess Dataset (Optional)
If you need to regenerate `teams_data.json` from the source CSV file:
```powershell
python generate_dataset.py
```

### 3. Run the Development Server
Launch the Flask server:
```powershell
python app.py
```

Once started, open your web browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## ☁️ Deployment Instructions

### Option 1: Render / Heroku / Railway (PaaS Deployments)

To deploy to modern hosting services like **Render**, **Railway**, or **Heroku**:

1. **Create a `requirements.txt` file**:
   Ensure dependencies are documented. Run:
   ```powershell
   pip freeze > requirements.txt
   ```
2. **Add a production WSGI entrypoint (`gunicorn`)**:
   For production deployments, do not use the built-in Flask dev server. Instead, install and run with Gunicorn:
   ```bash
   pip install gunicorn
   ```
3. **Configure the Start Command**:
   Configure the platform build pack or startup command:
   ```bash
   gunicorn app:app
   ```
4. **Environment Variables**:
   Set `FLASK_ENV=production` inside your PaaS provider's dashboard.

---

### Option 2: Docker Container Deployment

For containerized platforms (e.g. AWS ECS, Google Cloud Run, Azure Container Instances):

1. **Create a `Dockerfile`**:
   ```dockerfile
   FROM python:3.13-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   RUN pip install --no-cache-dir gunicorn

   COPY . .

   EXPOSE 5000

   CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
   ```

2. **Build and Run the Docker Container**:
   ```bash
   docker build -t fifacraft-predictor .
   docker run -p 5000:5000 fifacraft-predictor
   ```
