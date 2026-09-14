function CategoryFilter({ categories, selected, onSelect }) {
  // Если categories пустой или не объект, используем дефолтные
  const defaultCategories = {
    sport: { label: "Спорт", icon: "🏃" },
    ecology: { label: "Экология", icon: "🌿" },
    volunteer: { label: "Волонтёрство", icon: "🤝" },
    creative: { label: "Творчество", icon: "🎨" },
    music: { label: "Музыка", icon: "🎵" },
    education: { label: "Образование", icon: "📚" },
    community: { label: "Комьюнити", icon: "👥" },
    animals: { label: "Животные", icon: "🐾" },
    kindness: { label: "Добро", icon: "💝" },
  }

  const cats = categories && Object.keys(categories).length > 0 
    ? categories 
    : defaultCategories

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          !selected
            ? 'bg-sky-500 text-white'
            : 'bg-white text-gray-600 border border-sky-200 hover:border-sky-300'
        }`}
      >
        Все
      </button>
      
      {Object.entries(cats).map(([key, cat]) => {
        // Пропускаем категорию "other" в фильтре
        if (key === 'other') return null
        
        const label = cat.label || key
        const icon = cat.icon || '✨'
        
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selected === key
                ? 'bg-sky-500 text-white'
                : 'bg-white text-gray-600 border border-sky-200 hover:border-sky-300'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
