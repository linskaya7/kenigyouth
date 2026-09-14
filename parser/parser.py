"""
Парсер молодёжного дайджеста Калининграда
Собирает события из открытых источников и фильтрует по ключевым словам
"""

import json
import os
import re
import time
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from config import (
    KEYWORDS_ALL,
    EXCLUDE_KEYWORDS,
    SOURCES,
    PARSER_CONFIG,
    CATEGORIES,
)


class EventParser:
    """Парсер событий для молодёжного дайджеста"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": PARSER_CONFIG["user_agent"]})
        self.events = []
        self.seen_urls = set()

    def fetch_page(self, url: str) -> str | None:
        """Загрузка страницы с обработкой ошибок"""
        try:
            response = self.session.get(
                url, timeout=PARSER_CONFIG["timeout"]
            )
            response.raise_for_status()
            response.encoding = response.apparent_encoding
            return response.text
        except requests.RequestException as e:
            print(f"  [!] Ошибка загрузки {url}: {e}")
            return None

    def matches_keywords(self, text: str) -> bool:
        """Проверка соответствия текста ключевым словам"""
        if not text:
            return False
        text_lower = text.lower()
        return any(kw.lower() in text_lower for kw in KEYWORDS_ALL)

    def contains_excluded(self, text: str) -> bool:
        """Проверка наличия запрещённых слов"""
        if not text:
            return False
        text_lower = text.lower()
        return any(excl.lower() in text_lower for excl in EXCLUDE_KEYWORDS)

    def categorize_event(self, text: str) -> str:
        """Определение категории события по тексту"""
        text_lower = text.lower()

        category_keywords = {
            "sport": ["спорт", "активн", "фитнес", "бег", "йога", "зал", "стадион", "турнир", "соревнован"],
            "ecology": ["экологи", "природ", "зелен", "субботник", "уборк", "рек", "озер", "лес"],
            "volunteer": ["волонтёр", "волонтер", "помощь", "благотворительн", "социальн"],
            "creative": ["творчеств", "арт", "мастер", "рисован", "живопис", "фото", "кино", "театр"],
            "music": ["музык", "концерт", "фестивал", "выступлен", "групп", "исполнител"],
            "education": ["образован", "курс", "лекци", "семинар", "мастер-класс", "воркшоп", "обучен"],
            "community": ["комьюнити", "встреч", "клуб", "сообществ", "знакомств", "общени"],
            "animals": ["животн", "приют", "зоозащит", "хвостат", "собак", "кошк"],
            "kindness": ["добро", "благотворительн", "помощь", "поддержк", "забот"],
        }

        for cat, keywords in category_keywords.items():
            if any(kw in text_lower for kw in keywords):
                return cat
        return "other"

    def parse_source(self, source: dict) -> list[dict]:
        """Парсинг одного источника"""
        events = []
        print(f"\n[*] Парсинг: {source['name']}")
        print(f"    URL: {source['url']}")

        if not source.get("enabled", True):
            print("    [~] Источник отключён, пропуск")
            return events

        html = self.fetch_page(source["url"])
        if not html:
            return events

        soup = BeautifulSoup(html, "html.parser")

        # Универсальный парсинг карточек событий
        # Ищем контейнеры с событиями по типичным селекторам
        selectors = [
            "article",
            ".event-card",
            ".event-item",
            ".event",
            ".card",
            ".post",
            ".news-item",
            ".item",
            'div[class*="event"]',
            'div[class*="card"]',
            'div[class*="item"]',
        ]

        found_items = []
        for selector in selectors:
            items = soup.select(selector)
            if items:
                found_items.extend(items)
                print(f"    [+] Найдено {len(items)} элементов по селектору '{selector}'")

        if not found_items:
            print("    [-] Карточки событий не найдены")
            return events

        for item in found_items[:PARSER_CONFIG["max_events_per_source"]]:
            try:
                event = self._extract_event(item, source["url"])
                if event:
                    # Проверка ключевых слов
                    full_text = f"{event['title']} {event.get('description', '')} {event.get('tags', '')}"
                    if self.contains_excluded(full_text):
                        continue
                    if self.matches_keywords(full_text):
                        event["category"] = self.categorize_event(full_text)
                        if event["url"] not in self.seen_urls:
                            self.seen_urls.add(event["url"])
                            events.append(event)
            except Exception as e:
                continue

        print(f"    [+] Собрано {len(events)} событий после фильтрации")
        return events

    def _extract_event(self, item, base_url: str) -> dict | None:
        """Извлечение данных события из HTML-элемента"""
        # Заголовок
        title_el = item.find(["h2", "h3", "h4", "a", "strong"])
        if not title_el:
            return None
        title = title_el.get_text(strip=True)
        if len(title) < 5:
            return None

        # Ссылка
        link = None
        if title_el.name == "a":
            link = title_el.get("href")
        else:
            a_tag = item.find("a")
            if a_tag:
                link = a_tag.get("href")

        if link:
            link = urljoin(base_url, link)
        else:
            link = base_url

        # Дата
        date_text = ""
        date_el = item.find(["time", "span", "div"], class_=re.compile(r"date|time|дат", re.I))
        if date_el:
            date_text = date_el.get_text(strip=True)

        # Описание
        desc = ""
        desc_el = item.find(["p", "div", "span"], class_=re.compile(r"desc|text|anons|описан", re.I))
        if desc_el:
            desc = desc_el.get_text(strip=True)[:500]

        # Изображение
        img_url = ""
        img_el = item.find("img")
        if img_el:
            img_url = img_el.get("src") or img_el.get("data-src", "")
            if img_url:
                img_url = urljoin(base_url, img_url)

        return {
            "id": hashlib.md5(link.encode()).hexdigest()[:12],
            "title": title,
            "description": desc,
            "url": link,
            "date": date_text,
            "image": img_url,
            "source": "",
            "tags": "",
        }

    def generate_demo_data(self) -> list[dict]:
        """Генерация демо-данных для демонстрации"""
        now = datetime.now()
        week_start = now - timedelta(days=now.weekday())
        
        demo_events = [
            {
                "id": "demo001",
                "title": "Субботник на берегу Янтарного",
                "description": "Приглашаем всех на экологический субботник! Собираем мусор, высаживаем деревья. Берём перчатки и хорошее настроение.",
                "url": "https://example.com/event1",
                "date": (week_start + timedelta(days=5)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Эко-движение Калининграда",
                "category": "ecology",
                "tags": "экология субботник природа волонтёрство",
            },
            {
                "id": "demo002",
                "title": "Бесплатная тренировка по брейк-дансу",
                "description": "Открытая тренировка для всех возрастов. Все уровни подготовки. Приходи танцевать и знакомиться!",
                "url": "https://example.com/event2",
                "date": (week_start + timedelta(days=6)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Студия «Движение»",
                "category": "sport",
                "tags": "спорт танцы молодёжь активный отдых",
            },
            {
                "id": "demo003",
                "title": "Мастер-класс по летней акварели",
                "description": "Научим рисовать акварелью на свежем воздухе. Все материалы предоставляем. Красивый вид на Преголю в подарок!",
                "url": "https://example.com/event3",
                "date": (week_start + timedelta(days=3)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Арт-пространство «Маяк»",
                "category": "creative",
                "tags": "творчество мастер-класс молодёжь",
            },
            {
                "id": "demo004",
                "title": "Встреча клуба настольных игр",
                "description": "Играем в Мафию, Alias, Монополию и другие игры. Новичкам объясним правила. Знакомства и хорошее настроение!",
                "url": "https://example.com/event4",
                "date": (week_start + timedelta(days=4)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Клуб «ИгроМания»",
                "category": "community",
                "tags": "комьюнити встречи молодёжь творчество",
            },
            {
                "id": "demo005",
                "title": "Добрые дела: помощь приюту для животных",
                "description": "Едем в приют помогать — гуляем с собаками, убираем территорию. Сปาрайтись и авось увезёте нового друга домой!",
                "url": "https://example.com/event5",
                "date": (week_start + timedelta(days=0)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Волонтёрский центр «Доброта»",
                "category": "animals",
                "tags": "животные волонтёрство добро приют",
            },
            {
                "id": "demo006",
                "title": "Лекторий «Город и экология»",
                "description": "Разговор о том, как сделать наш город зеленее. Экологи расскажут о переработке, компостировании и вертикальных садах.",
                "url": "https://example.com/event6",
                "date": (week_start + timedelta(days=2)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Библиотека им. Бородина",
                "category": "education",
                "tags": "образование экология развитие",
            },
            {
                "id": "demo007",
                "title": "Акустический вечер на Ярмарке",
                "description": "Живая музыка, акустические гитары и уютная атмосфера. Свои песни могут исполнить все желающие!",
                "url": "https://example.com/event7",
                "date": (week_start + timedelta(days=1)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Калининградская Ярмарка",
                "category": "music",
                "tags": "музыка молодёжь творчество",
            },
            {
                "id": "demo008",
                "title": "Йога в парке Нижнее озеро",
                "description": "Бесплатная утренняя йога для всех уровней. Маты и коврики по желанию. Природа, свежий воздух и гармония!",
                "url": "https://example.com/event8",
                "date": (week_start + timedelta(days=6)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Йога-студия «Баланс»",
                "category": "sport",
                "tags": "спорт активный отдых здоровье молодёжь",
            },
        ]

        # Обновляем даты относительно текущей недели
        for event in demo_events:
            event["date"] = self._update_demo_date(event["date"])

        return demo_events

    def _update_demo_date(self, date_str: str) -> str:
        """Обновление даты демо-события на текущую неделю"""
        try:
            date = datetime.strptime(date_str, "%d.%m.%Y")
            now = datetime.now()
            # Находим начало текущей недели
            week_start = now - timedelta(days=now.weekday())
            # Устанавливаем тот же день недели
            new_date = week_start + timedelta(days=date.weekday())
            return new_date.strftime("%d.%m.%Y")
        except ValueError:
            return date_str

    def run(self, use_demo: bool = True):
        """Запуск парсера"""
        print("=" * 60)
        print("🗓️  Молодёжный дайджест Калининграда — Парсер")
        print("=" * 60)
        print(f"📅 Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')}")
        print()

        if use_demo:
            print("[*] Используем демо-данные для демонстрации")
            self.events = self.generate_demo_data()
            print(f"[+] Сгенерировано {len(self.events)} демо-событий")
        else:
            print("[*] Запуск реального парсинга источников")
            for source in SOURCES:
                source_events = self.parse_source(source)
                for event in source_events:
                    event["source"] = source["name"]
                self.events.extend(source_events)
                time.sleep(PARSER_CONFIG["request_delay"])

        # Сортировка по дате (ближайшие события первыми)
        self.events.sort(key=lambda x: x.get("date", ""))

        # Сохранение результатов
        self.save_results()

        print("\n" + "=" * 60)
        print(f"✅ Готово! Собрано {len(self.events)} событий")
        print(f"📁 Данные сохранены в {PARSER_CONFIG['output_dir']}/{PARSER_CONFIG['output_file']}")
        print("=" * 60)

        return self.events

    def save_results(self):
        """Сохранение результатов в JSON"""
        output_dir = Path(PARSER_CONFIG["output_dir"])
        output_dir.mkdir(parents=True, exist_ok=True)

        output_file = output_dir / PARSER_CONFIG["output_file"]

        data = {
            "meta": {
                "generated_at": datetime.now().isoformat(),
                "total_events": len(self.events),
                "categories": CATEGORIES,
            },
            "events": self.events,
        }

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    parser = EventParser()
    # use_demo=True для демо, use_demo=False для реального парсинга
    parser.run(use_demo=True)
