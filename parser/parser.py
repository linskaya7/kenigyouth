"""
Парсер молодёжного дайджеста Калининграда
Собирает события из открытых источников с фильтрацией
"""

import json
import os
import re
import time
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from config import (
    ALL_KEYWORDS,
    EXCLUDE_KEYWORDS,
    CATEGORIES,
    SOURCES,
    PARSER_CONFIG,
)


class EventParser:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": PARSER_CONFIG["user_agent"]})
        self.events = []
        self.seen_urls = set()
        self.stats = {
            "total_parsed": 0,
            "filtered_out": 0,
            "excluded": 0,
            "accepted": 0,
        }

    def fetch_page(self, url: str) -> str | None:
        try:
            response = self.session.get(url, timeout=PARSER_CONFIG["timeout"])
            response.raise_for_status()
            response.encoding = response.apparent_encoding
            return response.text
        except requests.RequestException as e:
            print(f"  [!] Ошибка загрузки {url}: {e}")
            return None

    def matches_keywords(self, text: str) -> tuple[bool, str]:
        """Проверка ключевых слов. Возвращает (совпадение, найденная категория)"""
        if not text:
            return False, ""
        text_lower = text.lower()
        
        for cat_key, cat_info in CATEGORIES.items():
            if cat_key == "other":
                continue
            for kw in cat_info.get("keywords", []):
                if kw.lower() in text_lower:
                    return True, cat_key
        return False, ""

    def contains_excluded(self, text: str) -> bool:
        """Проверка запрещённых слов"""
        if not text:
            return False
        text_lower = text.lower()
        return any(excl.lower() in text_lower for excl in EXCLUDE_KEYWORDS)

    def is_youth_relevant(self, text: str) -> bool:
        """Проверка молодёжной направленности"""
        if not text:
            return False
        text_lower = text.lower()
        youth_markers = [
            "молодёж", "молодеж", "молодые", "зумер", "подростк",
            "teenager", "юность", "студент", "школьник", "школьниц",
            "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
            "24", "25", "26", "27", "28", "29", "30", "31", "32", "33",
            "34", "35", "лет", "возраст",
        ]
        return any(marker in text_lower for marker in youth_markers)

    def categorize_event(self, text: str) -> str:
        """Определение категории по тексту"""
        if not text:
            return "other"
        text_lower = text.lower()
        
        scores = {}
        for cat_key, cat_info in CATEGORIES.items():
            if cat_key == "other":
                continue
            score = sum(1 for kw in cat_info.get("keywords", []) if kw.lower() in text_lower)
            if score > 0:
                scores[cat_key] = score
        
        if scores:
            return max(scores, key=scores.get)
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

        # Универсальный поиск карточек
        selectors = [
            "article",
            ".event-card", ".event-item", ".event",
            ".card", ".post", ".news-item", ".item",
            'div[class*="event"]', 'div[class*="card"]',
            'div[class*="item"]', 'div[class*="post"]',
            'li[class*="event"]', 'li[class*="item"]',
        ]

        found_items = []
        seen_elements = set()
        
        for selector in selectors:
            items = soup.select(selector)
            for item in items:
                item_id = id(item)
                if item_id not in seen_elements:
                    seen_elements.add(item_id)
                    found_items.append(item)

        print(f"    [+] Найдено {len(found_items)} элементов")

        for item in found_items[:PARSER_CONFIG["max_events_per_source"]]:
            self.stats["total_parsed"] += 1
            try:
                event = self._extract_event(item, source["url"])
                if not event:
                    self.stats["filtered_out"] += 1
                    continue

                full_text = f"{event['title']} {event.get('description', '')} {event.get('tags', '')}"

                # Проверка исключений
                if self.contains_excluded(full_text):
                    self.stats["excluded"] += 1
                    print(f"    [-] ИСКЛЮЧЕНО: {event['title'][:50]}...")
                    continue

                # Проверка ключевых слов
                matches, category = self.matches_keywords(full_text)
                if not matches:
                    self.stats["filtered_out"] += 1
                    continue

                event["category"] = category
                event["source"] = source["name"]

                if event["url"] not in self.seen_urls:
                    self.seen_urls.add(event["url"])
                    events.append(event)
                    self.stats["accepted"] += 1
                    print(f"    [+] ПРИНЯТО [{category}]: {event['title'][:50]}...")

            except Exception as e:
                continue

        print(f"    [+] Собрано {len(events)} событий после фильтрации")
        return events

    def _extract_event(self, item, base_url: str) -> dict | None:
        """Извлечение данных из HTML-элемента"""
        # Заголовок
        title_el = item.find(["h2", "h3", "h4", "a", "strong", "b"])
        if not title_el:
            return None
        title = title_el.get_text(strip=True)
        if len(title) < 5 or len(title) > 200:
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

        # Проверка, что ссылка ведёт на домен источника
        try:
            parsed_base = urlparse(base_url)
            parsed_link = urlparse(link)
            if parsed_link.netloc and parsed_link.netloc != parsed_base.netloc:
                link = urljoin(base_url, parsed_link.path)
        except:
            pass

        # Дата
        date_text = ""
        date_el = item.find(["time", "span", "div", "p"], 
                           class_=re.compile(r"date|time|дат|when", re.I))
        if date_el:
            date_text = date_el.get_text(strip=True)
            if date_el.get("datetime"):
                date_text = date_el["datetime"]

        # Описание
        desc = ""
        desc_el = item.find(["p", "div", "span", "dd"], 
                           class_=re.compile(r"desc|text|anons|описан|summary", re.I))
        if desc_el:
            desc = desc_el.get_text(strip=True)[:500]
        else:
            # Берём весь текст элемента как описание
            all_text = item.get_text(strip=True)
            if len(all_text) > len(title) + 10:
                desc = all_text[:500]

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
            "category": "other",
        }

    def run(self, use_demo: bool = True):
        """Запуск парсера"""
        print("=" * 60)
        print("🗓️  Молодёжный дайджест Калининграда — Парсер")
        print("=" * 60)
        print(f"📅 Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')}")
        print()

        if use_demo:
            print("[*] Используем демо-данные")
            self.events = self._generate_demo_data()
            print(f"[+] Сгенерировано {len(self.events)} демо-событий")
        else:
            print("[*] Запуск реального парсинга источников")
            for source in SOURCES:
                try:
                    source_events = self.parse_source(source)
                    self.events.extend(source_events)
                except Exception as e:
                    print(f"  [!] Ошибка парсинга {source['name']}: {e}")
                time.sleep(PARSER_CONFIG["request_delay"])

        # Сортировка
        self.events.sort(key=lambda x: x.get("date", ""))

        # Сохранение
        self.save_results()

        # Статистика
        print("\n" + "=" * 60)
        print("📊 СТАТИСТИКА:")
        print(f"  Всего обработано: {self.stats['total_parsed']}")
        print(f"  Отфильтровано:   {self.stats['filtered_out']}")
        print(f"  Исключено:       {self.stats['excluded']}")
        print(f"  Принято:         {self.stats['accepted']}")
        print("=" * 60)
        print(f"✅ Готово! Событий в дайджесте: {len(self.events)}")
        print(f"📁 Файл: {PARSER_CONFIG['output_dir']}/{PARSER_CONFIG['output_file']}")
        print("=" * 60)

        return self.events

    def _generate_demo_data(self) -> list[dict]:
        """Генерация демо-данных с фильтрацией"""
        now = datetime.now()
        week_start = now - timedelta(days=now.weekday())
        
        demo_events = [
            {
                "id": "demo001",
                "title": "Субботник на берегу Янтарного",
                "description": "Экологический субботник для молодёжи. Собираем мусор, высаживаем деревья. Все материалы предоставляем. Берём перчатки и хорошее настроение!",
                "url": "https://example.com/event1",
                "date": (week_start + timedelta(days=5)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Эко-движение Калининграда",
                "category": "ecology",
                "tags": "экология субботник природа волонтёрство молодёжь",
            },
            {
                "id": "demo002",
                "title": "Бесплатная тренировка по брейк-дансу",
                "description": "Открытая тренировка для молодёжи от 14 лет. Все уровни подготовки. Приходи танцевать и знакомиться!",
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
                "description": "Едем в приют помогать — гуляем с собаками, убираем территорию. Спарайтись и авось увезёте нового друга домой!",
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
            {
                "id": "demo009",
                "title": "Курс «Основы программирования»",
                "description": "Бесплатный курс для молодёжи 14-30 лет. Научим создавать сайты и приложения. Все материалы включены.",
                "url": "https://example.com/event9",
                "date": (week_start + timedelta(days=3)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "IT-клуб «Кодер»",
                "category": "education",
                "tags": "образование развитие технологии молодёжь",
            },
            {
                "id": "demo010",
                "title": "Фестиваль уличного искусства",
                "description": "Граффити, стрит-арт, живая музыка и мастер-классы. Творчество для молодёжи!",
                "url": "https://example.com/event10",
                "date": (week_start + timedelta(days=5)).strftime("%d.%m.%Y"),
                "image": "",
                "source": "Культурный центр «Арт-остров»",
                "category": "creative",
                "tags": "творчество музыка молодёжь фестиваль",
            },
        ]

        # Обновление дат
        for event in demo_events:
            event["date"] = self._update_demo_date(event["date"])

        return demo_events

    def _update_demo_date(self, date_str: str) -> str:
        """Обновление даты демо-события на текущую неделю"""
        try:
            date = datetime.strptime(date_str, "%d.%m.%Y")
            now = datetime.now()
            week_start = now - timedelta(days=now.weekday())
            new_date = week_start + timedelta(days=date.weekday())
            return new_date.strftime("%d.%m.%Y")
        except ValueError:
            return date_str

    def save_results(self):
        """Сохранение результатов в JSON"""
        output_dir = Path(PARSER_CONFIG["output_dir"])
        output_dir.mkdir(parents=True, exist_ok=True)

        output_file = output_dir / PARSER_CONFIG["output_file"]

        data = {
            "meta": {
                "generated_at": datetime.now().isoformat(),
                "total_events": len(self.events),
                "categories": {k: {"label": v["label"], "icon": v["icon"], "color": v["color"]} 
                              for k, v in CATEGORIES.items()},
            },
            "events": self.events,
        }

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    parser = EventParser()
    # use_demo=True для демо, use_demo=False для реального парсинга
    parser.run(use_demo=True)
