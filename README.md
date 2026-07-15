# Tatra Flora Quiz

Interaktywny quiz do nauki roślin Tatr. Aplikacja webowa z quizem i przewodnikiem.

## Funkcjonalności

- **Quiz**: Losowe pytania o rośliny tatrzańskie z obrazkami
- **Przewodnik**: Pełna lista roślin z opisami, zdjęciami i charakterystyką
- **4 opcje odpowiedzi**: Dla użytkowników, którzy nie są członkami koła botanicznego
- **Auto-check**: Automatyczne sprawdzanie odpowiedzi po wyborze opcji
- **Obsługa mobilna**: Responsywny design dla urządzeń mobilnych

## Rośliny

Aktualnie w bazie:
- Arcydzięgiel litwor
- Aster alpejski
- Szafran spiski
- Obuwik pospolity
- Sasanka alpejska
- Dziewięćsił bezłodygowy
- Lilia złotogłów

## Testy Automatyczne

Projekt zawiera testy automatyczne, które weryfikują:
1. **Ścieżki do obrazków** - czy wszystkie obrazy używają lokalnych ścieżek (`images/`)
2. **Rozszerzenia obrazków** - czy obrazy mają poprawne rozszerzenia (`.jpg`, `.jpeg`, `.png`)
3. **Istnienie lokalnych obrazków** - czy wszystkie obrazy istnieją i nie są puste
4. **Polskie znaki** - czy nazwy roślin zawierają poprawne polskie znaki (ą, ć, ę, ł, ń, ó, ś, ź, ż)
5. **Wymagane pola** - czy wszystkie rośliny mają wszystkie wymagane pola
6. **Funkcja getWikiUrl** - czy funkcja poprawnie obsługuje lokalne obrazy

### Uruchomienie testów

#### 1. Testy w Pythonie (terminal)
```bash
# Uruchom wszystkie testy
python3 test_images.py --check-all

# Sprawdź konkretną roślinę
python3 test_images.py --plant "Sasanka alpejska"
```

#### 2. Testy w przeglądarce
Otwórz plik `tests.html` w przeglądarce internetowej. Kliknij "Uruchom wszystkie testy", aby sprawdzić funkcjonalność.

## Struktura projektu

```
tatra-flora-quiz/
├── index.html          # Główna aplikacja
├── images/             # Obrazy roślin
│   ├── arcydziegiel_litwor_1.jpg
│   ├── arcydziegiel_litwor_2.jpg
│   ├── ...
│   └── lilia_zlotoglow_4.jpg
├── test_images.py      # Testy automatyczne (Python)
├── tests.html          # Testy automatyczne (HTML/JS)
└── README.md           # Dokumentacja
```

## Wymagania

- Przeglądarka internetowa (Chrome, Firefox, Safari, Edge)
- Python 3 (opcjonalnie, do uruchomienia test_images.py)

## Jak dodać nową roślinę

1. Dodaj obrazy do folderu `images/` (np. `images/nowa_roslina_1.jpg`, `images/nowa_roslina_2.jpg`)
2. Dodaj nową roślinę do tablicy `plants` w `index.html`:

```javascript
{
  id: 8,
  n: "Nowa Roślina",
  l: "Nazwa łacińska",
  d: "Opis rośliny...",
  h: "Siedlisko",
  b: "Okres kwitnienia",
  a: "Zakres wysokości",
  z: ["regiel dolny", "regiel górny"],
  i: [
    "images/nowa_roslina_1.jpg",
    "images/nowa_roslina_2.jpg"
  ],
  c: ["Cechy charakterystyczne"],
  pL: true  // czy woli podłoże wapienne
}
```

3. Uruchom testy, aby sprawdzić poprawność:
```bash
python3 test_images.py --check-all
```

## Historia zmian

- **v1.0**: Podstawowa funkcjonalność quizu
- **v1.1**: Dodano przewodnik i obrazy
- **v1.2**: Dodano 4 opcje odpowiedzi i auto-check
- **v1.3**: Naprawiono błędy z ładowaniem obrazków i polskimi znakami
- **v1.4**: Dodano testy automatyczne

## Autor

megakot56

## Licencja

MIT
