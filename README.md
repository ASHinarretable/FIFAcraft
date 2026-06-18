# ⚽ FIFACraft

<p align="center">

AI-powered football match prediction simulator built with **Python**, **Flask**, and **Monte Carlo simulations**.

Predict realistic outcomes between clubs and national teams using FIFA ratings, probability models, and live match events.

</p>

---

## 📸 Preview

> *(Add screenshots after deployment)*

| Home                      | Match Prediction            |
| ------------------------- | --------------------------- |
| ![](screenshots/home.png) | ![](screenshots/result.png) |

---

## ✨ Features

* ⚽ Predict matches between **600+ clubs** and **national teams**
* 🎲 Monte Carlo-inspired match simulation
* 📈 Win / Draw / Loss probability calculation
* ⭐ Dynamic match commentary
* 🥅 Goal, save, foul and yellow card events
* 🎨 Interactive football animations
* ⚡ RESTful Flask API
* ☁️ Docker-ready
* 🚀 Deployable on Render & Google Cloud Run

---

## 🛠 Tech Stack

| Layer      | Technology                       |
| ---------- | -------------------------------- |
| Frontend   | HTML5, CSS3, JavaScript          |
| Backend    | Flask                            |
| Language   | Python                           |
| Dataset    | JSON                             |
| Deployment | Docker, Render, Google Cloud Run |

---

## 📂 Project Structure

```
fifacraft/

│

├── app.py

├── predictor.py

├── requirements.txt

├── Dockerfile

├── README.md

├── .gitignore

│

├── data/

│ └── teams_data.json

│

└── static/

├── index.html

├── script.js

├── style.css

└── background.js
```

---

## 🚀 Run Locally

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/fifacraft.git
```

Go inside

```bash
cd fifacraft
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run

```bash
python app.py
```

Open

```
http://localhost:5000
```

---

## 🐳 Docker

Build

```bash
docker build -t fifacraft .
```

Run

```bash
docker run -p 5000:5000 fifacraft
```

---

## 🌐 REST API

### Get Teams

```
GET /api/teams
```

Returns every available club and national team.

---

### Predict Match

```
GET /api/predict?team_a=Real Madrid&team_b=Manchester City
```

Example Response

```json
{
    "team_a": "Real Madrid",
    "team_b": "Manchester City",
    "score": "2-1",
    "winner": "Real Madrid"
}
```

---

## ☁ Deployment

* ✅ Docker
* ✅ Render
* ✅ Google Cloud Run

---

## 🎯 Roadmap

* [ ] Tournament Mode
* [ ] FIFA World Cup Simulator
* [ ] Club Career Mode
* [ ] Live Team Ratings
* [ ] Gemini AI Match Analysis
* [ ] Mobile Responsive UI

---

## 🤝 Contributing

Pull requests are welcome!

Feel free to fork the project and submit improvements.

---

## 📜 License

MIT License

---

<p align="center">

Made with ❤️ by **Aishwarya Pawar**

</p>
