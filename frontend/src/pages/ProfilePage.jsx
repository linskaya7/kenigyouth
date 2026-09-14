import { useState } from 'react'

function ProfilePage() {
  const [notifications, setNotifications] = useState(true)
  const [selectedTopics, setSelectedTopics] = useState(['sport', 'ecology', 'creative'])

  const topics = [
    { id: 'sport', label: 'Спорт', icon: '🏃' },
    { id: 'ecology', label: 'Экология', icon: '🌿' },
    { id: 'volunteer', label: 'Волонтёрство', icon: '🤝' },
    { id: 'creative', label: 'Творчество', icon: '🎨' },
    { id: 'music', label: 'Музыка', icon: '🎵' },
    { id: 'education', label: 'Образование', icon: '📚' },
    { id: 'community', label: 'Комьюнити', icon: '👥' },
    { id: 'animals', label: 'Животные', icon: '🐾' },
  ]

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  return (
    <div className="px-4 pt-4">
      <header className="mb-6 safe-area-top">
        <h1 className="text-2xl font-bold text-gray-800">Профиль</h1>
        <p className="text-gray-500 text-sm">Настройки и предпочтения</p>
      </header>

      {/* Аватар и имя */}
      <div className="bg-white rounded-2xl p-6 border border-sky-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">👤</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Молодой Калининградец</h2>
            <p className="text-sm text-gray-500">Участник сообщества</p>
          </div>
        </div>
      </div>

      {/* Интересы */}
      <div className="bg-white rounded-2xl p-4 border border-sky-100 mb-4">
        <h3 className="font-medium text-gray-700 mb-3">Мои интересы</h3>
        <p className="text-sm text-gray-500 mb-3">
          Выберите темы, которые вам интересны
        </p>
        <div className="flex flex-wrap gap-2">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedTopics.includes(topic.id)
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{topic.icon}</span>
              <span>{topic.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Настройки */}
      <div className="bg-white rounded-2xl p-4 border border-sky-100 mb-4">
        <h3 className="font-medium text-gray-700 mb-3">Настройки</h3>
        
        {/* Уведомления */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="font-medium text-gray-700">Уведомления</p>
            <p className="text-sm text-gray-500">Получать推送 о новых событиях</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notifications ? 'bg-sky-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                notifications ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        {/* Только бесплатные */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="font-medium text-gray-700">Только бесплатные</p>
            <p className="text-sm text-gray-500">Показывать события без оплаты</p>
          </div>
          <button className="relative w-12 h-6 rounded-full bg-sky-500">
            <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow translate-x-6" />
          </button>
        </div>

        {/* Радиус поиска */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-gray-700">Радиус поиска</p>
            <span className="text-sm text-sky-500 font-medium">5 км</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            defaultValue="5"
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 км</span>
            <span>20 км</span>
          </div>
        </div>
      </div>

      {/* О приложении */}
      <div className="bg-white rounded-2xl p-4 border border-sky-100 mb-4">
        <h3 className="font-medium text-gray-700 mb-3">О приложении</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Версия: 1.0.0</p>
          <p>Молодёжный дайджест Калининграда</p>
          <p className="text-gray-400">
            Собираем и показываем только проверенные и безопасные события для молодёжи региона.
          </p>
        </div>
      </div>

      {/* Ссылки */}
      <div className="space-y-2 mb-8">
        <button className="w-full bg-white rounded-xl p-4 border border-sky-100 text-left hover:bg-gray-50 transition-colors">
          <span className="font-medium text-gray-700">Предложить событие</span>
        </button>
        <button className="w-full bg-white rounded-xl p-4 border border-sky-100 text-left hover:bg-gray-50 transition-colors">
          <span className="font-medium text-gray-700">Связаться с нами</span>
        </button>
        <button className="w-full bg-white rounded-xl p-4 border border-sky-100 text-left hover:bg-gray-50 transition-colors">
          <span className="font-medium text-gray-700">Стать волонтёром</span>
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
