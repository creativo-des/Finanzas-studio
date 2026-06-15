import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FinanceProvider } from './context/FinanceContext'
import TabBar from './components/layout/TabBar'
import ProfileScreen from './pages/auth/ProfileScreen'
import ModeSelector from './pages/ModeSelector'

const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Personal      = lazy(() => import('./pages/Personal'))
const PersonalMes   = lazy(() => import('./pages/PersonalMes'))
const Estudio       = lazy(() => import('./pages/Estudio'))
const Suscripciones = lazy(() => import('./pages/Suscripciones'))
const Mas           = lazy(() => import('./pages/Mas'))
const Deudas        = lazy(() => import('./pages/Deudas'))
const Metas         = lazy(() => import('./pages/Metas'))
const Patrimonio    = lazy(() => import('./pages/Patrimonio'))
const Ajustes       = lazy(() => import('./pages/Ajustes'))
const Tarjetas      = lazy(() => import('./pages/Tarjetas'))

const Fallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: 'var(--radius-sm)' }} />
  </div>
)

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Fallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"                  element={<Dashboard />} />
          <Route path="/personal"          element={<Personal />} />
          <Route path="/personal/mes/:num" element={<PersonalMes />} />
          <Route path="/estudio"           element={<Estudio />} />
          <Route path="/suscripciones"     element={<Suscripciones />} />
          <Route path="/mas"               element={<Mas />} />
          <Route path="/deudas"            element={<Deudas />} />
          <Route path="/metas"             element={<Metas />} />
          <Route path="/patrimonio"        element={<Patrimonio />} />
          <Route path="/ajustes"           element={<Ajustes />} />
          <Route path="/tarjetas"          element={<Tarjetas />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

function AuthGate() {
  const { ready, activeProfile, mode } = useAuth()

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg-base)' }}>
        <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '22px' }} />
      </div>
    )
  }

  if (!activeProfile) return <ProfileScreen />

  if (!mode) return <ModeSelector />

  return (
    <FinanceProvider profileId={activeProfile.id}>
      <div className="app-shell" data-mode={mode}>
        <AppRoutes />
        <TabBar />
      </div>
    </FinanceProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGate />
      </BrowserRouter>
    </AuthProvider>
  )
}
