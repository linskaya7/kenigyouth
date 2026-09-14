import { useState } from 'react'
import EventCard from '../components/EventCard'
import CategoryFilter from '../components/CategoryFilter'

const DEMO_EVENTS = [
  {
    id: "demo001",
    title: "Субботник на берегу Янтарного",
    description: "Приглашаем всех на экологический субботник! Собираем мусор, высаживаем деревья.",
    url: "https://example.com/event1",
    date: new Date().toLocaleDateString('ru-RU'),
    image: "",
    source: "Эко-движение Калининграда",
    category: "ecology",
    tags: "экология субботник",
  },
  {
    id: "demo002",
    title: "Бесплатная тренировка по брейк-дансу",
    description: "Открытая тренировка для всех возрастов.",
    url: "https://example.com/event2",
    date: new Date(Date.now() + 86400000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Студия «Движение»",
    category: "sport",
    tags: "спорт танцы",
  },
  {
    id: "demo003",
    title: "Мастер-класс по летней акварели",
    description: "Научим рисовать акварелью на свежем воздухе.",
    url: "https://example.com/event3",
    date: new Date(Date.now() + 172800000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Арт-пространство «Маяк»",
    category: "creative",
    tags: "творчество мастер-класс",
  },
  {
    id: "demo004",
    title: "Встреча клуба настольных игр",
    description: "Играем в Мафию, Alias, Монополию.",
    url: "https://example.com/event4",
    date: new Date(Date.now() + 259200000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Клуб «ИгроМания»",
    category: "community",
    tags: "комьюнити встречи",
  },
  {
    id: "demo005",
    title: "Добрые дела: помощь приюту",
    description: "Едем в приют помогать.",
    url: "https://example.com/event5",
    date: new Date(Date.now() + 345600000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Волонтёрский центр",
    category: "animals",
    tags: "животные волонтёрство",
  },
  {
    id: "demo006",
    title: "Лекторий «Город и экология»",
    description: "Как сделать наш город зеленее.",
    url: "https://example.com/event6",
    date: new Date(Date.now() + 432000000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Библиотека",
    category: "education",
    tags: "образование экология",
  },
  {
    id: "demo007",
    title: "Акустический вечер на Ярмарке",
    description: "Живая музыка и уютная атмосфера.",
    url: "https://example.com/event7",
    date: new Date(Date.now() + 518400000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Калининградская Ярмарка",
    category: "music",
    tags: "музыка творчество",
  },
  {
    id: "demo008",
    title: "Йога в парке",
    description: "Бесплатная утренняя йога для всех.",
    url: "https://example.com/event8",
    date: new Date(Date.now() + 604800000).toLocaleDateString('ru-RU'),
    image: "",
    source: "Йога-студия",
    category: "sport",
    tags: "спорт здоровье",
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

function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = DEMO_EVENTS.filter(event => {
    const matchesCategory = !selectedCategory || event.category === selectedCategory
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="px-4 pt-4">
      {/* Заголовок */}
      <header className="mb-4 safe-area-top">
        <h1 className="text-2xl font-bold text-gray-800">События</h1>
        <p className="text-gray-500 text-sm">Активные события на этой неделе</p>
      </header>

      {/* Поиск */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Найти событие..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-white rounded-xl border border-sky-200 
                     focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                     placeholder-gray-400"
        />
        <svg 
          className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Фильтр категорий */}
      <CategoryFilter
        categories={CATEGORIES}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Счётчик результатов */}
      <div className="flex items-center justify-between mt-4 mb-3">
        <p className="text-sm text-gray-500">
          Найдено: <span className="font-medium text-gray-700">{filteredEvents.length}</span>
        </p>
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)}
            className="text-sm text-sky-500 hover:text-sky-600"
          >
            Сбросить фильтр
          </button>
        )}
      </div>

      {/* Список событий */}
      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-500 mb-2">Ничего не найдено</p>
            <p className="text-sm text-gray-400">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage
