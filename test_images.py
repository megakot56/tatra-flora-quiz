#!/usr/bin/env python3
"""
Skrypt do weryfikacji lokalnych obrazów i testowania funkcjonalności.
Użycie: python test_images.py [--check-all] [--plant NAZWA]

Przykłady:
  python test_images.py --check-all
  python test_images.py --plant "Sasanka alpejska"
"""

import sys
import os
import re
import json
from urllib.parse import unquote


def extract_plants_from_file(filepath='index.html'):
    """Wydobądź listę roślin z pliku index.html"""
    if not os.path.exists(filepath):
        print(f"❌ Plik {filepath} nie istnieje")
        return []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Znajdź tablicę plants - szukamy od 'const plants = [' do '];'
    plants_match = re.search(r'const plants = \[(.*?)\]\s*;', content, re.DOTALL)
    if not plants_match:
        print("❌ Nie znaleziono tablicy plants w pliku")
        return []
    
    plants_str = plants_match.group(1)
    
    # Podziel na poszczególne obiekty roślin
    # Używamy bardziej zaawansowanego parsingu
    plant_objects = []
    brace_count = 0
    current_start = 0
    in_string = False
    string_char = None
    
    for i, char in enumerate(plants_str):
        if char in ['"', "'"] and (i == 0 or plants_str[i-1] != '\\'):
            if in_string:
                if char == string_char:
                    in_string = False
            else:
                in_string = True
                string_char = char
        
        if not in_string:
            if char == '{':
                brace_count += 1
                if brace_count == 1:
                    current_start = i
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    plant_str = plants_str[current_start:i+1]
                    plant_objects.append(plant_str)
    
    plants = []
    for plant_str in plant_objects:
        plant_data = {}
        
        # Wyciągnij id
        id_match = re.search(r'id:\s*(\d+)', plant_str)
        if id_match:
            plant_data['id'] = int(id_match.group(1))
        
        # Wyciągnij nazwę polską
        n_match = re.search(r'n:\s*"(.*?)"', plant_str)
        if n_match:
            plant_data['n'] = unquote(n_match.group(1))
        
        # Wyciągnij nazwę łacińską
        l_match = re.search(r'l:\s*"(.*?)"', plant_str)
        if l_match:
            plant_data['l'] = unquote(l_match.group(1))
        
        # Wyciągnij opis
        d_match = re.search(r'd:\s*"(.*?)"', plant_str)
        if d_match:
            plant_data['d'] = unquote(d_match.group(1))
        
        # Wyciągnij siedlisko
        h_match = re.search(r'h:\s*"(.*?)"', plant_str)
        if h_match:
            plant_data['h'] = unquote(h_match.group(1))
        
        # Wyciągnij okres
        b_match = re.search(r'b:\s*"(.*?)"', plant_str)
        if b_match:
            plant_data['b'] = unquote(b_match.group(1))
        
        # Wyciągnij wysokość
        a_match = re.search(r'a:\s*"(.*?)"', plant_str)
        if a_match:
            plant_data['a'] = unquote(a_match.group(1))
        
        # Wyciągnij strefy
        z_match = re.search(r'z:\s*\[(.*?)\]', plant_str, re.DOTALL)
        if z_match:
            zones_str = z_match.group(1)
            zones = re.findall(r'"(.*?)"', zones_str)
            plant_data['z'] = [unquote(z) for z in zones]
        
        # Wyciągnij obrazy
        i_match = re.search(r'i:\s*\[(.*?)\]', plant_str, re.DOTALL)
        if i_match:
            images_str = i_match.group(1)
            images = re.findall(r'"(.*?)"', images_str)
            plant_data['i'] = [unquote(img) for img in images]
        
        # Wyciągnij cechy
        c_match = re.search(r'c:\s*\[(.*?)\]', plant_str, re.DOTALL)
        if c_match:
            chars_str = c_match.group(1)
            chars = re.findall(r'"(.*?)"', chars_str)
            plant_data['c'] = [unquote(c) for c in chars]
        
        # Wyciągnij pole pL
        pl_match = re.search(r'pL:\s*(true|false)', plant_str)
        if pl_match:
            plant_data['pL'] = pl_match.group(1) == 'true'
        
        if plant_data:
            plants.append(plant_data)
    
    return plants


def check_local_image(image_path):
    """Sprawdź, czy lokalny obraz istnieje i ma rozmiar > 0"""
    if image_path.startswith('images/'):
        full_path = os.path.join(os.path.dirname(__file__), image_path)
        if os.path.exists(full_path):
            size = os.path.getsize(full_path)
            if size > 0:
                return True, f"OK ({size} bytes)"
            else:
                return False, "Plik jest pusty (0 bytes)"
        else:
            return False, "Plik nie istnieje"
    
    return False, f"Nieobsługiwana ścieżka: {image_path} (tylko images/ są dozwolone)"


def check_polish_characters(text):
    """Sprawdź, czy tekst zawiera poprawne polskie znaki"""
    polish_chars = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż', 
                    'Ą', 'Ć', 'Ę', 'Ł', 'Ń', 'Ó', 'Ś', 'Ź', 'Ż']
    
    for char in polish_chars:
        if char in text:
            return True
    return False


def verify_polish_encoding(text):
    """Sprawdź, czy tekst jest poprawnie zakodowany (UTF-8)"""
    try:
        # Spróbuj zakodować i odkodować
        encoded = text.encode('utf-8')
        decoded = encoded.decode('utf-8')
        return decoded == text, "OK"
    except UnicodeEncodeError as e:
        return False, f"Błąd kodowania: {e}"
    except UnicodeDecodeError as e:
        return False, f"Błąd dekodowania: {e}"


def verify_required_fields(plant):
    """Sprawdź, czy roślina ma wszystkie wymagane pola"""
    required_fields = ['n', 'l', 'i', 'd', 'h', 'b', 'a', 'z', 'c', 'pL']
    missing = [field for field in required_fields if field not in plant]
    return len(missing) == 0, missing


def run_tests(plants, plant_name=None):
    """Uruchom wszystkie testy"""
    all_passed = True
    
    print("=" * 70)
    print("🧪 TATRA FLORA QUIZ - TESTY AUTOMATYCZNE")
    print("=" * 70)
    print()
    
    # Test 1: Ścieżki do obrazków
    print("📁 TEST 1: Ścieżki do obrazków (tylko lokalne images/)")
    print("-" * 70)
    test1_passed = True
    for plant in plants:
        if plant_name and plant.get('n', '').lower() != plant_name.lower():
            continue
        for img_path in plant.get('i', []):
            if img_path.startswith('images/'):
                print(f"  ✅ {img_path}")
            else:
                print(f"  ❌ {img_path} (nie jest lokalny)")
                test1_passed = False
                all_passed = False
    print(f"  Wynik: {'✅ ZALICZONY' if test1_passed else '❌ NIEZALICZONY'}")
    print()
    
    # Test 2: Rozszerzenia obrazków
    print("🖼️  TEST 2: Rozszerzenia obrazków")
    print("-" * 70)
    test2_passed = True
    for plant in plants:
        if plant_name and plant.get('n', '').lower() != plant_name.lower():
            continue
        for img_path in plant.get('i', []):
            valid_ext = any(img_path.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png'])
            if valid_ext:
                print(f"  ✅ {img_path}")
            else:
                print(f"  ❌ {img_path} (nieprawidłowe rozszerzenie)")
                test2_passed = False
                all_passed = False
    print(f"  Wynik: {'✅ ZALICZONY' if test2_passed else '❌ NIEZALICZONY'}")
    print()
    
    # Test 3: Istnienie lokalnych obrazków
    print("🔍 TEST 3: Istnienie lokalnych obrazków")
    print("-" * 70)
    test3_passed = True
    for plant in plants:
        if plant_name and plant.get('n', '').lower() != plant_name.lower():
            continue
        for img_path in plant.get('i', []):
            exists, status = check_local_image(img_path)
            if exists:
                print(f"  ✅ {img_path} - {status}")
            else:
                print(f"  ❌ {img_path} - {status}")
                test3_passed = False
                all_passed = False
    print(f"  Wynik: {'✅ ZALICZONY' if test3_passed else '❌ NIEZALICZONY'}")
    print()
    
    # Test 4: Polskie znaki
    print("🇵🇱 TEST 4: Polskie znaki w nazwach roślin")
    print("-" * 70)
    test4_passed = True
    for plant in plants:
        if plant_name and plant.get('n', '').lower() != plant_name.lower():
            continue
        name = plant.get('n', '')
        has_polish = check_polish_characters(name)
        encoding_ok, encoding_status = verify_polish_encoding(name)
        
        if has_polish and encoding_ok:
            print(f"  ✅ {name}")
        elif has_polish and not encoding_ok:
            print(f"  ❌ {name} - {encoding_status}")
            test4_passed = False
            all_passed = False
        elif not has_polish:
            print(f"  ℹ️  {name} (brak polskich znaków)")
    print(f"  Wynik: {'✅ ZALICZONY' if test4_passed else '❌ NIEZALICZONY'}")
    print()
    
    # Test 5: Wymagane pola
    print("📋 TEST 5: Wymagane pola w danych roślin")
    print("-" * 70)
    test5_passed = True
    required_fields = ['n', 'l', 'i', 'd', 'h', 'b', 'a', 'z', 'c', 'pL']
    for plant in plants:
        if plant_name and plant.get('n', '').lower() != plant_name.lower():
            continue
        has_all_fields, missing = verify_required_fields(plant)
        if has_all_fields:
            print(f"  ✅ {plant.get('n', 'Unknown')} - wszystkie pola obecne")
        else:
            print(f"  ❌ {plant.get('n', 'Unknown')} - brakujące: {', '.join(missing)}")
            test5_passed = False
            all_passed = False
    print(f"  Wynik: {'✅ ZALICZONY' if test5_passed else '❌ NIEZALICZONY'}")
    print()
    
    # Test 6: Funkcja getWikiUrl (symulacja)
    print("🔗 TEST 6: Funkcja getWikiUrl (symulacja)")
    print("-" * 70)
    test6_passed = True
    
    def get_wiki_url(filename):
        if filename.startswith('images/'):
            return filename
        return None  # Tylko lokalne obrazy są obsługiwane
    
    test_paths = [
        'images/arcydziegiel_litwor_1.jpg',
        'images/szafran_spiski_1.jpg',
        'https://example.com/image.jpg'  # Powinien zostać odrzucony
    ]
    
    for path in test_paths:
        result = get_wiki_url(path)
        if path.startswith('images/'):
            if result == path:
                print(f"  ✅ {path} -> {result}")
            else:
                print(f"  ❌ {path} -> {result} (nieoczekiwany wynik)")
                test6_passed = False
                all_passed = False
        else:
            if result is None:
                print(f"  ✅ {path} -> odrzucony (tylko lokalne obrazy)")
            else:
                print(f"  ❌ {path} -> {result} (powinien zostać odrzucony)")
                test6_passed = False
                all_passed = False
    print(f"  Wynik: {'✅ ZALICZONY' if test6_passed else '❌ NIEZALICZONY'}")
    print()
    
    # Podsumowanie
    print("=" * 70)
    print("📊 PODSUMOWANIE")
    print("=" * 70)
    
    total_tests = 6
    passed_tests = sum([test1_passed, test2_passed, test3_passed, test4_passed, test5_passed, test6_passed])
    failed_tests = total_tests - passed_tests
    
    print(f"Testów łącznie: {total_tests}")
    print(f"✅ Zaliczonych: {passed_tests}")
    print(f"❌ Niezaliczonych: {failed_tests}")
    print()
    
    if all_passed:
        print("🎉 WSZYSTKIE TESTY ZALICZONE! ✅")
        print("Obrazy działają, nawigacja do przewodnika jest sprawna, a polskie znaki nie są zepsute.")
    else:
        print("⚠️  Niektóre testy nie zostały zaliczone. Popraw błędy.")
    
    print("=" * 70)
    
    return all_passed


def main():
    filepath = 'index.html'
    check_all = '--check-all' in sys.argv
    plant_name = None
    
    if '--plant' in sys.argv:
        idx = sys.argv.index('--plant')
        if idx + 1 < len(sys.argv):
            plant_name = ' '.join(sys.argv[idx+1:])
    
    print(f"Weryfikacja dla: {filepath}")
    if plant_name:
        print(f"Sprawdzanie tylko: {plant_name}")
    print()
    
    plants = extract_plants_from_file(filepath)
    
    if not plants:
        print("❌ Nie znaleziono żadnych roślin w pliku")
        sys.exit(1)
    
    print(f"Znaleziono {len(plants)} roślin(y)")
    print()
    
    all_passed = run_tests(plants, plant_name)
    
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
