import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '../components/EventCard'
import CategoryFilter from '../components/CategoryFilter'

// Демо-данные (в продакшене будут загружаться из JSON)
const DEMO_EVENTS = [
  {
    id: "demo001",
    title: "Субботник на берегу Янтарного",
    description: "Приглашаем всех на экологический субботник! Собираем мусор, высаживаем деревья. Берём перчатки и хорошее настроение.",
    url: "https://example.com/event1",
    date: new Date().toLocaleDateString('ru-RU'),
    image: "",
    source: "Эко-движение Калининграда",
    category: "ecology",
    tags: "экология субботник природа волонтёрство",
  },
  {
    id: "demo002",
    title: "Бесплатная тренировка по брейк-дансу",
    description: "Открытая тренировка для всех возрастов. Все уровни подготовки. Приходи танцевать и знакомиться!",
    url: "https://example.com/event2",
    date: new Date(Date.now() + 86400000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Студия «Движение»",
    category: "sport",
    tags: "спорт танцы молодёжь активный отдых",
  },
  {
    id: "demo003",
    title: "Мастер-класс по летней акварели",
    description: "Научим рисовать акварелью на свежем воздухе. Все материалы предоставляем.",
    url: "https://example.com/event3",
    date: new Date(Date.now() + 172800000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Арт-пространство «Маяк»",
    category: "creative",
    tags: "творчество мастер-класс молодёжь",
  },
  {
    id: "demo004",
    title: "Встреча клуба настольных игр",
    description: "Играем в Мафию, Alias, Монополию и другие игры. Новичкам объясним правила.",
    url: "https://example.com/event4",
    date: new Date(Date.now() + 259200000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Клуб «ИгроМания»",
    category: "community",
    tags: "комьюнити встречи молодёжь творчество",
  },
  {
    id: "demo005",
    title: "Добрые дела: помощь приюту для животных",
    description: "Едем в приют помогать — гуляем с собаками, убираем территорию.",
    url: "https://example.com/event5",
    date: new Date(Date.now() + 345600000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Волонтёрский центр «Доброта»",
    category: "animals",
    tags: "животные волонтёрство добро приют",
  },
  {
    id: "demo006",
    title: "Лекторий «Город и экология»",
    description: "Разговор о том, как сделать наш город зеленее. Экологи расскажут о переработке.",
    url: "https://example.com/event6",
    date: new Date(Date.now() + 432000000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Библиотека им. Бородина",
    category: "education",
    tags: "образование экология развитие",
  },
  {
    id: "demo007",
    title: "Акустический вечер на Ярмарке",
    description: "Живая музыка, акустические гитары и уютная атмосфера. Свои песни могут исполнить все желающие!",
    url: "https://example.com/event7",
    date: new Date(Date.now() + 518400000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Калининградская Ярмарка",
    category: "music",
    tags: "музыка молодёжь творчество",
  },
  {
    id: "demo008",
    title: "Йога в парке Нижнее озеро",
    description: "Бесплатная утренняя йога для всех уровней. Маты и коврики по желанию.",
    url: "https://example.com/event8",
    date: new Date(Date.now() + 604800000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Йога-студия «Баланс»",
    category: "sport",
    tags: "спорт активный отдых здоровье молодёжь",
  },
]

const CATEGORIES = {
  sport: { label: "Спорт", icon: "🏃" },
  ecology: { label: "Экология", icon: "🌿" },
  volunteer: { label: "Волонтёрство", icon: "🤝" },
  creative: { label: "Творчество", icon: "🎨" },
  music: { label: "Музыка", icon: "🎵" },
  education: { label: "Образование", icon: "📚" },
  community: { label: "Комьюнити", icon: "👥" },
  animals: { label: "Животные", icon: "🐾" },
  kindness: { label: "Добро", icon: "💝" },
  other: { label: "Другое", icon: "✨" },
}

function HomePage() {
  const [events, setEvents] = useState(DEMO_EVENTS)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(0) // 0 = текущая неделя

  const filteredEvents = selectedCategory
    ? events.filter(e => e.category === selectedCategory)
    : events

  // Группировка по дням недели
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = event.date
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {})

  return (
    <div className="px-4 pt-4">
      {/* Заголовок */}
      <header className="mb-6 safe-area-top">
        <h1 className="text-2xl font-bold text-gray-800">
          Молодёжный дайджест
        </h1>
        <p className="text-sky-600 font-medium">Калининград</p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </p>
      </header>

      {/* Баннер недели */}
      <div className="bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl p-4 mb-6 text-white">
        <h2 className="font-semibold text-lg">Эта неделя</h2>
        <p className="text-sky-100 text-sm mt-1">
          {filteredEvents.length} событий ждут тебя!
        </p>
        <Link 
          to="/events" 
          className="inline-block mt-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          Смотреть все →
        </Link>
      </div>

      {/* Фильтр категорий */}
      <CategoryFilter
        categories={CATEGORIES}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Список событий */}
      <div className="space-y-4 mt-6">
        {Object.entries(groupedEvents).length > 0 ? (
          Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                {date}
              </h3>
              <div className="space-y-3">
                {dayEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-500">Нет событий в выбранной категории</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
