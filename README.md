# 🌿 Tatra Flora Quiz

Interaktywny quiz do nauki roślin Tatrzańskiego Parku Narodowego.

## 🏗️ Architektura

- **Frontend**: Statyczny HTML/CSS/JS (GitHub Pages)
- **Backend**: Flask (PythonAnywhere)
- **Dane**: JSON (rośliny, opisy, obrazy)

## 📁 Struktura projektu

```
tatra-flora-quiz/
├── backend/               # Flask (PythonAnywhere)
│   ├── app.py             # Aplikacja Flask
│   ├── plants.json        # Dane roślin
│   ├── requirements.txt   # Zależności
│   └── static/
│       └── images/        # Obrazy roślin
├── frontend/              # GitHub Pages
│   ├── index.html         # Strona główna
│   ├── style.css          # Stylowanie
│   └── script.js          # Logika frontend
├── .gitignore
└── README.md
```

## 🚀 Deploy

### Backend (PythonAnywhere)

1. Utwórz konto na [PythonAnywhere](https://www.pythonanywhere.com/)
2. Stwórz nową aplikację web (Flask)
3. Skonfiguruj:
   - Wirtualne środowisko: `mkvirtualenv --python=/usr/bin/python3.10 tatra-flora-env`
   - Zainstaluj zależności: `pip install -r requirements.txt`
   - Ścieżka do aplikacji: `/home/username/tatra-flora-quiz/backend/`
   - WSGI configuration file: `tatra-flora-quiz/backend/app.py`
4. Uruchom aplikację

### Frontend (GitHub Pages)

1. W repozytorium GitHub:
   - Przejdź do Settings → Pages
   - Wybierz branch: `main`
   - Wybierz folder: `/frontend` (lub `/` jeśli przenieś pliki do root)
2. Strona będzie dostępna pod: `https://username.github.io/tatra-flora-quiz/`

### Konfiguracja API

W pliku `frontend/script.js` zmień:
```javascript
const API_BASE = "https://megakot56.pythonanywhere.com";
```
na swoją domenę PythonAnywhere.

## 🌱 Funkcjonalności

- ✅ Quiz z 4 opcjami wielowyboru
- ✅ Losowanie roślin i obrazków
- ✅ Przewodnik z opisami roślin
- ✅ Modal z galerią zdjęć
- ✅ Responsywny design

## 📝 API Endpoints

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/plants` | GET | Lista wszystkich roślin |
| `/api/plants/<id>` | GET | Pojedyncza roślina po ID |
| `/api/random` | GET | Losowa roślina z losowym obrazkiem |
| `/api/quiz` | GET | Pytanie quizowe z 4 opcjami |
| `/api/check-answer` | POST | Sprawdź odpowiedź |

## 🔧 Rozwój

### Dodawanie nowych roślin

1. Dodaj obrazy do `backend/static/images/`
2. Dodaj wpis do `backend/plants.json`:
```json
{
  "id": 8,
  "name": "Nazwa rośliny",
  "latin": "Nazwa łacińska",
  "description": "Opis rośliny...",
  "habitat": "Siedlisko",
  "bloom": "Okres kwitnienia",
  "altitude": "Wysokość występowania",
  "zones": ["regiel dolny", "regiel górny"],
  "characteristics": ["Cechy..."],
  "prefers_limestone": true,
  "images": ["nazwa_obrazka1.jpg", "nazwa_obrazka2.jpg"]
}
```

### Uruchomienie lokalne

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py

# Frontend
# Otwórz frontend/index.html w przeglądarce
# Upewnij się, że API_BASE w script.js wskazuje na localhost:5000
```

## 📊 Dane roślin

Obecnie w bazie znajdują się:
- Arcydziegiel litwor
- Aster alpejski
- Szafran spiski
- Obuwik pospolity
- Sasanka alpejska
- Dziewięćsił bezłodygowy
- Lilia złotogłów

## 🎨 Technologie

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python 3, Flask
- **Hosting**: GitHub Pages (frontend), PythonAnywhere (backend)

## 📄 Licencja

MIT
