function MapPage() {
  return (
    <div className="px-4 pt-4">
      <header className="mb-6 safe-area-top">
        <h1 className="text-2xl font-bold text-gray-800">Карта событий</h1>
        <p className="text-gray-500 text-sm">Ближайшие события на карте города</p>
      </header>

      {/* Заглушка карты */}
      <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-sky-100 to-cyan-50 flex flex-col items-center justify-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">
            Интерактивная карта
          </h2>
          <p className="text-gray-500 text-sm text-center max-w-xs">
            Здесь будут отображаться события на карте Калининграда. 
            Функция будет доступна в следующем обновлении.
          </p>
          
          {/* Список локаций */}
          <div className="mt-6 w-full max-w-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-3 text-left">Ближайшие точки:</h3>
            <div className="space-y-2">
              {[
                { name: "Ярмарка", district: "Центральный", count: 3 },
                { name: "Парк Нижнее озеро", district: "Ленинский", count: 2 },
                { name: "Библиотека им. Бородина", district: "Московский", count: 1 },
                { name: "Арт-пространство «Маяк»", district: "Центральный", count: 2 },
              ].map((location, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-700 text-sm">{location.name}</p>
                    <p className="text-xs text-gray-400">{location.district}</p>
                  </div>
                  <span className="bg-sky-100 text-sky-600 text-xs font-medium px-2 py-1 rounded-full">
                    {location.count} события
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Информация */}
      <div className="mt-6 bg-sky-50 rounded-2xl p-4">
        <h3 className="font-medium text-gray-700 mb-2">Как пользоваться картой</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Нажмите на метку для подробностей</li>
          <li>• Используйте фильтры для поиска по категориям</li>
          <li>• Масштабируйте для обзора района</li>
        </ul>
      </div>
    </div>
  )
}

export default MapPage
