import { useState } from 'react'
import { Link } from 'react-router-dom'
import useEvents from '../hooks/useEvents'
import EventCard from '../components/EventCard'
import CategoryFilter from '../components/CategoryFilter'

function HomePage() {
  const { events, categories, loading, error } = useEvents()
  const [selectedCategory, setSelectedCategory] = useState(null)

  const filteredEvents = selectedCategory
    ? events.filter(e => e.category === selectedCategory)
    : events

  // Группировка по дням недели
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = event.date || 'Без даты'
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <header className="mb-6 safe-area-top">
          <h1 className="text-2xl font-bold text-gray-800">
            Молодёжный дайджест
          </h1>
          <p className="text-sky-600 font-medium">Калининград</p>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          <span className="ml-3 text-gray-500">Загрузка событий...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 pt-4">
        <header className="mb-6 safe-area-top">
          <h1 className="text-2xl font-bold text-gray-800">
            Молодёжный дайджест
          </h1>
          <p className="text-sky-600 font-medium">Калининград</p>
        </header>
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <p className="text-red-600">Ошибка загрузки: {error}</p>
        </div>
      </div>
    )
  }

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
        categories={categories}
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
