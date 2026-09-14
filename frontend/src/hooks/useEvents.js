import { useState, useEffect } from 'react'

const EVENTS_DATA_URL = '/data/events.json'

// Кэш для данных
let cachedData = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

export function useEvents() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      // Проверяем кэш
      if (cachedData && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        setEvents(cachedData.events || [])
        setCategories(cachedData.meta?.categories || {})
        setLoading(false)
        return
      }

      const response = await fetch(EVENTS_DATA_URL)
      if (!response.ok) {
        throw new Error('Failed to load events')
      }
      
      const data = await response.json()
      
      // Кэшируем
      cachedData = data
      cacheTimestamp = Date.now()

      setEvents(data.events || [])
      setCategories(data.meta?.categories || {})
      setLoading(false)
    } catch (err) {
      console.error('Error loading events:', err)
      setError(err.message)
      
      // Fallback к демо-данным
      setEvents(getDemoEvents())
      setCategories(getDemoCategories())
      setLoading(false)
    }
  }

  function refreshEvents() {
    cachedData = null
    cacheTimestamp = null
    setLoading(true)
    loadEvents()
  }

  return { events, categories, loading, error, refreshEvents }
}

function getDemoCategories() {
  return {
    sport: { label: "Спорт и активный отдых", icon: "🏃", color: "#10B981" },
    ecology: { label: "Экология", icon: "🌿", color: "#059669" },
    volunteer: { label: "Волонтёрство", icon: "🤝", color: "#3B82F6" },
    creative: { label: "Творчество", icon: "🎨", color: "#8B5CF6" },
    music: { label: "Музыка и фестивали", icon: "🎵", color: "#EC4899" },
    education: { label: "Образование и развитие", icon: "📚", color: "#F59E0B" },
    community: { label: "Комьюнити", icon: "👥", color: "#6366F1" },
    animals: { label: "Животные", icon: "🐾", color: "#D97706" },
    kindness: { label: "Добро и помощь", icon: "💝", color: "#EF4444" },
    other: { label: "Другое", icon: "✨", color: "#6B7280" },
  }
}

function getDemoEvents() {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())

  return [
    {
      id: "demo001",
      title: "Субботник на берегу Янтарного",
      description: "Экологический субботник для молодёжи. Собираем мусор, высаживаем деревья.",
      url: "#",
      date: new Date(weekStart.getTime() + 5 * 86400000).toLocaleDateString('ru-RU'),
      image: "",
      source: "Эко-движение Калининграда",
      category: "ecology",
    },
    {
      id: "demo002",
      title: "Бесплатная тренировка по брейк-дансу",
      description: "Открытая тренировка для молодёжи от 14 лет. Все уровни подготовки.",
      url: "#",
      date: new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('ru-RU'),
      image: "",
      source: "Студия «Движение»",
      category: "sport",
    },
    {
      id: "demo003",
      title: "Мастер-класс по летней акварели",
      description: "Научим рисовать акварелью на свежем воздухе. Все материалы предоставляем.",
      url: "#",
      date: new Date(weekStart.getTime() + 3 * 86400000).toLocaleDateString('ru-RU'),
      image: "",
      source: "Арт-пространство «Маяк»",
      category: "creative",
    },
    {
      id: "demo004",
      title: "Встреча клуба настольных игр",
      description: "Играем в Мафию, Alias, Монополию. Новичкам объясним правила.",
      url: "#",
      date: new Date(weekStart.getTime() + 4 * 86400000).toLocaleDateString('ru-RU'),
      image: "",
      source: "Клуб «ИгроМания»",
      category: "community",
    },
    {
      id: "demo005",
      title: "Добрые дела: помощь приюту",
      description: "Едем в приют помогать — гуляем с собаками, убираем территорию.",
      url: "#",
      date: new Date(weekStart.getTime() + 0 * 86400000).toLocaleDateString('ru-RU'),
      image: "",
      source: "Волонтёрский центр",
      category: "animals",
    },
  ]
}

export default useEvents
