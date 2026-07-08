#!/usr/bin/env python3
"""
Skrypt do weryfikacji obrazów z Wikimedia Commons przed dodaniem nowej rośliny.
Użycie: python verify_images.py <ścieżka_do_pliku> [--check-all]

Przykład:
  python verify_images.py index.html --check-all
  python verify_images.py index.html --plant "Sasanka alpejska"
"""

import sys
import re
import requests
from urllib.parse import unquote

WIKI_COMMONS_BASE = "https://upload.wikimedia.org/wikipedia/commons/"


def extract_plants_from_file(filepath):
    """Wydobądź listę roślin z pliku index.html"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Znajdź tablicę plants
    plants_match = re.search(r'const plants = \[(.*?)\]\s*;', content, re.DOTALL)
    if not plants_match:
        print("❌ Nie znaleziono tablicy plants w pliku")
        return []
    
    plants_str = plants_match.group(1)
    
    # Podziel na poszczególne rośliny
    plant_matches = re.finditer(r'\{(.*?)\}', plants_str, re.DOTALL)
    
    plants = []
    for match in plant_matches:
        plant_data = {}
        plant_str = match.group(1)
        
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
        
        # Wyciągnij obrazy
        i_match = re.search(r'i:\s*\[(.*?)\]', plant_str, re.DOTALL)
        if i_match:
            images_str = i_match.group(1)
            images = re.findall(r'"(.*?)"', images_str)
            plant_data['i'] = [unquote(img) for img in images]
        
        if plant_data:
            plants.append(plant_data)
    
    return plants


def check_image_url(image_path):
    """Sprawdź, czy obraz istnieje na Wikimedia Commons"""
    if image_path.startswith('images/'):
        # Lokalny obraz - sprawdź, czy plik istnieje
        import os
        if os.path.exists(image_path):
            return True, "local"
        else:
            return False, "local file missing"
    
    url = f"{WIKI_COMMONS_BASE}{image_path}"
    
    try:
        # Wikimedia blokuje HEAD requesty, użyj GET z stream=True
        response = requests.get(url, stream=True, timeout=10)
        
        # Sprawdź, czy odpowiedź jest pomyślna
        if response.status_code == 200:
            return True, "wiki"
        else:
            return False, f"HTTP {response.status_code}"
    except requests.exceptions.RequestException as e:
        return False, str(e)


def verify_plants(plants, plant_name=None):
    """Zweryfikuj obrazy dla wszystkich roślin lub wybranej rośliny"""
    results = []
    
    for plant in plants:
        if plant_name and plant.get('n', '').lower() != plant_name.lower():
            continue
        
        plant_result = {
            'id': plant.get('id'),
            'n': plant.get('n', 'Unknown'),
            'l': plant.get('l', 'Unknown'),
            'images': []
        }
        
        if 'i' not in plant:
            plant_result['error'] = 'No images defined'
            results.append(plant_result)
            continue
        
        for img_path in plant['i']:
            exists, status = check_image_url(img_path)
            plant_result['images'].append({
                'path': img_path,
                'exists': exists,
                'status': status,
                'url': f"{WIKI_COMMONS_BASE}{img_path}" if not img_path.startswith('images/') else img_path
            })
        
        # Sprawdź, czy wszystkie obrazy działają
        all_ok = all(img['exists'] for img in plant_result['images'])
        plant_result['all_ok'] = all_ok
        
        results.append(plant_result)
    
    return results


def print_results(results):
    """Wyświetl wyniki weryfikacji"""
    all_ok = True
    
    for plant in results:
        print(f"\n{'✅' if plant.get('all_ok', False) else '❌'} {plant['n']} ({plant['l']})")
        
        if 'error' in plant:
            print(f"   Error: {plant['error']}")
            all_ok = False
            continue
        
        for img in plant['images']:
            status_icon = "✅" if img['exists'] else "❌"
            source = "local" if img['status'] == "local" else "wiki"
            print(f"   {status_icon} {img['path']} ({source})")
            
            if not img['exists']:
                all_ok = False
                print(f"      URL: {img['url']}")
                print(f"      Status: {img['status']}")
    
    print("\n" + "="*60)
    if all_ok:
        print("✅ Wszystkie obrazy są dostępne!")
    else:
        print("❌ Niektóre obrazy nie działają. Popraw ścieżki.")
    
    return all_ok


def main():
    if len(sys.argv) < 2:
        print("Użycie: python verify_images.py <ścieżka_do_pliku> [--check-all] [--plant NAZWA]")
        print("\nPrzykłady:")
        print("  python verify_images.py index.html --check-all")
        print("  python verify_images.py index.html --plant 'Sasanka alpejska'")
        sys.exit(1)
    
    filepath = sys.argv[1]
    check_all = '--check-all' in sys.argv
    plant_name = None
    
    if '--plant' in sys.argv:
        idx = sys.argv.index('--plant')
        if idx + 1 < len(sys.argv):
            plant_name = ' '.join(sys.argv[idx+1:])
    
    print(f"Weryfikacja obrazów dla: {filepath}")
    if plant_name:
        print(f"Sprawdzanie tylko: {plant_name}")
    
    plants = extract_plants_from_file(filepath)
    
    if not plants:
        print("❌ Nie znaleziono żadnych roślin w pliku")
        sys.exit(1)
    
    print(f"Znaleziono {len(plants)} roślin(y)")
    
    results = verify_plants(plants, plant_name)
    all_ok = print_results(results)
    
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
