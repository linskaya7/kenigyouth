function EventCard({ event }) {
  const categoryColors = {
    sport: 'bg-emerald-100 text-emerald-700',
    ecology: 'bg-green-100 text-green-700',
    volunteer: 'bg-blue-100 text-blue-700',
    creative: 'bg-purple-100 text-purple-700',
    music: 'bg-pink-100 text-pink-700',
    education: 'bg-amber-100 text-amber-700',
    community: 'bg-indigo-100 text-indigo-700',
    animals: 'bg-orange-100 text-orange-700',
    kindness: 'bg-rose-100 text-rose-700',
    other: 'bg-gray-100 text-gray-700',
  }

  const categoryLabels = {
    sport: 'Спорт',
    ecology: 'Экология',
    volunteer: 'Волонтёрство',
    creative: 'Творчество',
    music: 'Музыка',
    education: 'Образование',
    community: 'Комьюнити',
    animals: 'Животные',
    kindness: 'Добро',
    other: 'Другое',
  }

  const categoryIcons = {
    sport: '🏃',
    ecology: '🌿',
    volunteer: '🤝',
    creative: '🎨',
    music: '🎵',
    education: '📚',
    community: '👥',
    animals: '🐾',
    kindness: '💝',
    other: '✨',
  }

  const colorClass = categoryColors[event.category] || categoryColors.other
  const label = categoryLabels[event.category] || 'Другое'
  const icon = categoryIcons[event.category] || '✨'

  return (
    <div className="event-card animate-slide-up">
      {/* Изображение (если есть) */}
      {event.image && (
        <div className="aspect-video bg-gray-100">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4">
        {/* Категория и дата */}
        <div className="flex items-center justify-between mb-2">
          <span className={`category-badge ${colorClass}`}>
            <span className="mr-1">{icon}</span>
            {label}
          </span>
          {event.date && (
            <span className="text-xs text-gray-400">{event.date}</span>
          )}
        </div>

        {/* Заголовок */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Описание */}
        {event.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Источник */}
        {event.source && (
          <p className="text-xs text-gray-400 mb-3">
            📍 {event.source}
          </p>
        )}

        {/* Кнопка详情 */}
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
        >
          Подробнее
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}

export default EventCard
