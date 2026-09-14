import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import MapPage from './pages/MapPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-sky-50 pb-20">
        {/* Индикатор оффлайн */}
        {!isOnline && (
          <div className="bg-amber-500 text-white text-center py-2 text-sm sticky top-0 z-50">
            📡 Оффлайн-режим — данные могут быть неактуальными
          </div>
        )}

        {/* Основной контент */}
        <main className="max-w-lg mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>

        {/* Нижняя навигация */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-sky-100 safe-area-bottom z-40">
          <div className="max-w-lg mx-auto flex justify-around py-2">
            <NavLink to="/" className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">Главная</span>
            </NavLink>

            <NavLink to="/events" className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">События</span>
            </NavLink>

            <NavLink to="/map" className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-xs">Карта</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs">Профиль</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </Router>
  )
}

export default App
