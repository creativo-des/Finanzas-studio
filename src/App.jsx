import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FinanceProvider, useFinance } from './context/FinanceContext'
import TabBar from './components/layout/TabBar'
import Sidebar from './components/layout/Sidebar'
import InstallBanner from './components/ui/InstallBanner'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import TwoFactorPage from './pages/auth/TwoFactorPage'
import ModeSelector from './pages/ModeSelector'
import Onboarding from './pages/Onboarding'

const Dashboard         = lazy(() => import('./pages/Dashboard'))
const Personal          = lazy(() => import('./pages/Personal'))
const PersonalMes       = lazy(() => import('./pages/PersonalMes'))
const Estudio           = lazy(() => import('./pages/Estudio'))
const Suscripciones     = lazy(() => import('./pages/Suscripciones'))
const Mas               = lazy(() => import('./pages/Mas'))
const Deudas            = lazy(() => import('./pages/Deudas'))
const Metas             = lazy(() => import('./pages/Metas'))
const Patrimonio        = lazy(() => import('./pages/Patrimonio'))
const Ajustes           = lazy(() => import('./pages/Ajustes'))
const Tarjetas          = lazy(() => import('./pages/Tarjetas'))
const SetupTwoFactorPage = lazy(() => import('./pages/auth/SetupTwoFactorPage'))

const PageFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: 'var(--radius-sm)' }} />
  </div>
)

function AppRoutes() {
  const location = useLocation()
  const { mode } = useAuth()
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"                      element={<Dashboard />} />
          <Route path="/personal"              element={<Personal />} />
          <Route path="/personal/mes/:num"     element={<PersonalMes />} />
          <Route path="/estudio"               element={mode === 'estudio' ? <Estudio /> : <Navigate to="/" replace />} />
          <Route path="/suscripciones"         element={<Suscripciones />} />
          <Route path="/mas"                   element={<Mas />} />
          <Route path="/deudas"                element={<Deudas />} />
          <Route path="/metas"                 element={<Metas />} />
          <Route path="/patrimonio"            element={<Patrimonio />} />
          <Route path="/ajustes"               element={<Ajustes />} />
          <Route path="/tarjetas"              element={<Tarjetas />} />
          <Route path="/ajustes/2fa"           element={<SetupTwoFactorPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

// Loading spinner shown while cloud data loads
function CloudLoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px',
    }}>
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '72px', height: '72px', borderRadius: '22px',
          background: 'linear-gradient(135deg, var(--accent), #5B4ED6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '34px',
          boxShadow: '0 12px 40px rgba(124,111,247,0.4)',
        }}
      >
        💜
      </motion.div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
            style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}
          />
        ))}
      </div>
    </div>
  )
}

// Gate that shows loading → onboarding → app in sequence
function FinanceGate({ children }) {
  const { state, cloudLoading } = useFinance()

  if (cloudLoading) return <CloudLoadingScreen />
  if (!state.config.onboardingDone) return <Onboarding />
  return children
}

function AuthGate() {
  const { ready, user, mfaPending, activeProfile, mode } = useAuth()
  const [authView, setAuthView] = useState('login')

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg-base)', flexDirection: 'column', gap: '20px' }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '72px', height: '72px', borderRadius: '22px',
            background: 'linear-gradient(135deg, var(--accent), #5B4ED6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px',
            boxShadow: '0 12px 40px rgba(124,111,247,0.4)',
          }}
        >
          💜
        </motion.div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return authView === 'login'
      ? <LoginPage onShowRegister={() => setAuthView('register')} />
      : <RegisterPage onShowLogin={() => setAuthView('login')} />
  }

  if (mfaPending) return <TwoFactorPage />
  if (!mode)      return <ModeSelector />

  return (
    <FinanceProvider profileId={activeProfile.id}>
      <FinanceGate>
        <div className="app-shell" data-mode={mode}>
          <Sidebar />
          <div className="content-wrap">
            <AppRoutes />
            <TabBar />
            <InstallBanner />
          </div>
        </div>
      </FinanceGate>
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
