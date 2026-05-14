"""
Скрипт для отбора карт МАК из Cleveland Museum of Art Open Access API.

Что делает:
1. Тянет работы выбранных художников (символизм, абстракция, экспрессионизм) с фильтром cc0=1.
2. Сохраняет превью в public/cards/.
3. Генерирует src/lib/deck.ts с метаданными.

Использование:
    pip install requests
    python scripts/fetch_cards.py

Cleveland API: https://openaccess.clevelandart.org/
Лицензия CC0 — можно использовать без ограничений, включая коммерческое использование.
"""

import json
import os
import sys
from pathlib import Path

import requests

# 60 уникальных карт от разных авторов (по одной работе на художника).
# Японская гравюра + европейский модерн / символизм / импрессионизм + старые мастера.
ARTISTS = [
    # Японская гравюра и живопись
    "Utagawa Hiroshige", "Katsushika Hokusai", "Kitagawa Utamaro",
    "Utagawa Kuniyoshi", "Utagawa Kunisada", "Tsukioka Yoshitoshi",
    "Suzuki Harunobu", "Torii Kiyonaga", "Keisai Eisen", "Kawase Hasui",
    "Hashiguchi Goyō", "Ito Jakuchu", "Kobayashi Kiyochika", "Yoshida Hiroshi",
    "Onchi Kōshirō", "Itō Shinsui", "Tōshūsai Sharaku", "Toyohara Chikanobu",
    "Maruyama Ōkyo", "Ogata Kōrin", "Sakai Hōitsu",
    # Символизм / модерн / экспрессионизм
    "Paul Klee", "Wassily Kandinsky", "Odilon Redon", "Franz Marc",
    "Henri Rousseau", "Edvard Munch", "Gustav Klimt", "Egon Schiele",
    "Käthe Kollwitz", "Oskar Kokoschka", "Giorgio de Chirico",
    "Gustave Moreau", "Pierre Puvis de Chavannes", "Aubrey Beardsley",
    # Импрессионизм / постимпрессионизм
    "Claude Monet", "Pierre-Auguste Renoir", "Edgar Degas", "Édouard Manet",
    "Vincent van Gogh", "Paul Cézanne", "Paul Gauguin", "Georges Seurat",
    "Henri de Toulouse-Lautrec", "Camille Pissarro", "Berthe Morisot",
    "Mary Cassatt", "James McNeill Whistler",
    # Романтизм / реализм
    "William Blake", "Joseph Mallord William Turner", "Caspar David Friedrich",
    "Eugène Delacroix", "Théodore Géricault", "Jean-François Millet",
    "Honoré Daumier", "Gustave Courbet", "Jean-Baptiste-Camille Corot",
    "Francisco Goya",
    # Старые мастера
    "Rembrandt van Rijn", "Albrecht Dürer", "Pieter Bruegel the Elder",
    "Lucas Cranach the Elder", "Hans Holbein the Younger", "Titian",
    "Peter Paul Rubens", "Anthony van Dyck", "Nicolas Poussin",
    "Claude Lorrain", "Hieronymus Bosch",
    # Американцы
    "Winslow Homer", "Childe Hassam", "Thomas Cole", "Albert Bierstadt",
    "Frederic Edwin Church", "John Singer Sargent", "Thomas Eakins",
    "Maurice Prendergast",
    # Запас на случай неудачных запросов
    "Pierre Bonnard", "Édouard Vuillard", "Alfred Sisley", "Eugène Boudin",
    "Henri Fantin-Latour", "James Tissot", "Anders Zorn", "Joaquín Sorolla",
    "John Constable", "Théodore Rousseau", "Gustave Doré", "Sandro Botticelli",
    "Giovanni Battista Tiepolo", "Hans Baldung Grien", "Tani Bunchō",
    "Soga Shōhaku", "Shibata Zeshin", "Mori Sosen", "Nagasawa Rosetsu",
    "Takahashi Shōtei", "Watanabe Seitei", "Pierre-Joseph Redouté",
    "Eugène Carrière", "Felix Vallotton", "Maurice Denis",
]

API_URL = "https://openaccess-api.clevelandart.org/api/artworks/"
TARGET_COUNT = 60  # сколько карт хотим получить
PER_ARTIST_LIMIT = 5  # сколько работ запрашиваем у каждого художника (берём первую с картинкой)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CARDS_DIR = PROJECT_ROOT / "public" / "cards"
DECK_FILE = PROJECT_ROOT / "src" / "lib" / "deck.ts"


def fetch_artworks_for_artist(artist: str) -> list[dict]:
    """Запрашивает работы конкретного художника с фильтром cc0 и наличием изображения."""
    params = {
        "artists": artist,
        "cc0": 1,
        "has_image": 1,
        "limit": PER_ARTIST_LIMIT,
    }
    try:
        response = requests.get(API_URL, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        return data.get("data", [])
    except requests.RequestException as e:
        print(f"  ! Ошибка запроса для {artist}: {e}", file=sys.stderr)
        return []


def download_image(url: str, path: Path) -> bool:
    """Скачивает изображение по URL и сохраняет в файл."""
    try:
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()
        with open(path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except requests.RequestException as e:
        print(f"  ! Ошибка скачивания {url}: {e}", file=sys.stderr)
        return False


def safe(value, default: str = "Unknown") -> str:
    """Безопасно достаёт строку из API-ответа."""
    if value is None or value == "":
        return default
    return str(value)


def main():
    print(f"Создаю папку {CARDS_DIR}")
    CARDS_DIR.mkdir(parents=True, exist_ok=True)

    print("\nТяну работы из Cleveland Museum API...\n")

    collected: list[dict] = []
    seen_artists: set[str] = set()  # Дедупликация по фактическому имени из API

    for artist in ARTISTS:
        if len(collected) >= TARGET_COUNT:
            break
        print(f"  {artist}...")
        artworks = fetch_artworks_for_artist(artist)

        for artwork in artworks:
            # Нужна ссылка на превью
            images = artwork.get("images") or {}
            web_image = images.get("web") or {}
            image_url = web_image.get("url")
            if not image_url:
                continue

            actual_artist = safe(
                (artwork.get("creators") or [{}])[0].get("description"),
                artist,
            )
            # Пропускаем если такой автор уже есть (API иногда возвращает чужие работы)
            if actual_artist in seen_artists:
                continue

            seen_artists.add(actual_artist)
            collected.append({
                "title": safe(artwork.get("title"), "Untitled"),
                "artist": actual_artist,
                "year": safe(artwork.get("creation_date"), "—"),
                "image_url": image_url,
                "source_url": artwork.get("url", ""),
            })
            break  # только одна работа на художника — уникальность

    print(f"\nСобрано {len(collected)} работ. Начинаю скачивание...\n")

    deck_entries: list[dict] = []
    for idx, item in enumerate(collected, start=1):
        card_id = f"card-{idx:03d}"
        filename = f"{card_id}.jpg"
        local_path = CARDS_DIR / filename

        print(f"  {card_id}: {item['artist']} — {item['title'][:50]}")
        if download_image(item["image_url"], local_path):
            deck_entries.append({
                "id": card_id,
                "url": f"/cards/{filename}",
                "title": item["title"],
                "artist": item["artist"],
                "year": item["year"],
                "source": "Cleveland Museum of Art",
            })

    # Генерируем deck.ts
    print(f"\nГенерирую {DECK_FILE}")
    DECK_FILE.parent.mkdir(parents=True, exist_ok=True)

    ts_lines = [
        "// Сгенерировано scripts/fetch_cards.py — не редактировать вручную.",
        "// Все карты — CC0 из Cleveland Museum of Art Open Access.",
        "",
        "export type Card = {",
        "  id: string;",
        "  url: string;",
        "  title: string;",
        "  artist: string;",
        "  year: string;",
        "  source: string;",
        "};",
        "",
        "export const deck: Card[] = [",
    ]
    for entry in deck_entries:
        ts_lines.append("  " + json.dumps(entry, ensure_ascii=False) + ",")
    ts_lines.extend([
        "];",
        "",
        "export function drawCard(): Card {",
        "  return deck[Math.floor(Math.random() * deck.length)];",
        "}",
        "",
    ])

    DECK_FILE.write_text("\n".join(ts_lines), encoding="utf-8")

    print(f"\n✓ Готово. Карт в колоде: {len(deck_entries)}")
    print(f"✓ Изображения: {CARDS_DIR}")
    print(f"✓ Метаданные: {DECK_FILE}")
    print("\nДальше: запусти Claude Code с PRD-projection.md")


if __name__ == "__main__":
    main()
