# 🌿 Tatra Flora Quiz

Interaktywny quiz do nauki roślin Tatrzańskiego Parku Narodowego.

## 🏗️ Architektura

**Cały projekt w czystym JavaScript** - działa na GitHub Pages bez potrzeby backendu.

```
tatra-flora-quiz/
├── index.html          # Strona główna
├── style.css           # Stylowanie
├── script.js           # Cała logika quizu
├── plants.json         # Dane 7 roślin
├── images/             # 28 obrazków roślin
└── README.md
```

## ✨ Funkcjonalności

- ✅ **Quiz z 4 opcjami wielowyboru** - losowanie roślin i obrazków
- ✅ **Sprawdzanie odpowiedzi** z natychmiastowym feedbackiem
- ✅ **Przewodnik** ze wszystkimi roślinami i opisami
- ✅ **Modal** z galerią zdjęć i szczegółowymi informacjami
- ✅ **Responsywny design** - działa na komputerze i telefonie
- ✅ **Polskie znaki** i emoji poprawnie wyświetlane

## 🚀 Uruchomienie

### Lokalnie
Po prostu otwórz plik `index.html` w przeglądarce.

### Na GitHub Pages
1. W repozytorium GitHub:
   - Przejdź do **Settings → Pages**
   - Wybierz branch: `main`
   - Wybierz folder: `/` (root)
   - Kliknij **Save**

2. Strona będzie dostępna pod:
   `https://twoj_nick.github.io/tatra-flora-quiz/`

## 📊 Dane roślin

Obecnie w bazie znajdują się 7 roślin:

| ID | Nazwa | Nazwa łacińska |
|----|-------|----------------|
| 1 | Arcydziegiel litwor | Angelica archangelica |
| 2 | Aster alpejski | Aster alpinus |
| 3 | Szafran spiski | Crocus scepusiensis |
| 4 | Obuwik pospolity | Cypripedium calceolus |
| 5 | Sasanka alpejska | Pulsatilla alpina |
| 6 | Dziewięćsił bezłodygowy | Carlina acaulis |
| 7 | Lilia złotogłów | Lilium martagon |

## 📝 Dodawanie nowych roślin

1. Dodaj obrazy do folderu `images/`
2. Dodaj wpis do pliku `plants.json`:

```json
{
  "id": 8,
  "name": "Nazwa rośliny",
  "latin": "Nazwa łacińska",
  "description": "Opis rośliny...",
  "habitat": "Siedlisko",
  "bloom": "Okres kwitnienia (np. V-VII)",
  "altitude": "Wysokość występowania (np. 1000-2000m)",
  "zones": ["regiel dolny", "regiel górny"],
  "characteristics": ["Cechy charakterystyczne..."],
  "prefers_limestone": true,
  "images": ["images/nazwa_obrazka1.jpg", "images/nazwa_obrazka2.jpg"]
}
```

3. Opcjonalnie dodaj do `relatedPlantsMap` w `script.js` powiązane rośliny

## 🎨 Technologie

- **HTML5** - struktura strony
- **CSS3** - stylowanie i responsywność
- **Vanilla JavaScript** - cała logika aplikacji
- **JSON** - przechowywanie danych roślin

## 📄 Licencja

MIT
