import { useState } from 'react'
import useEvents from '../hooks/useEvents'
import EventCard from '../components/EventCard'
import CategoryFilter from '../components/CategoryFilter'

function EventsPage() {
  const { events, categories, loading, error } = useEvents()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = events.filter(event => {
    const matchesCategory = !selectedCategory || event.category === selectedCategory
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.source && event.source.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <header className="mb-4 safe-area-top">
          <h1 className="text-2xl font-bold text-gray-800">События</h1>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          <span className="ml-3 text-gray-500">Загрузка...</span>
        </div>
      </div>
    )
  }

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
        categories={categories}
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
