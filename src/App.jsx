import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FinanceProvider, useFinance } from './context/FinanceContext'
import { ThemeProvider } from './context/ThemeContext'
import TabBar from './components/layout/TabBar'
import Sidebar from './components/layout/Sidebar'
import InstallBanner from './components/ui/InstallBanner'
import LoadingScreen from './components/ui/LoadingScreen'
import ErrorBoundary from './components/ui/ErrorBoundary'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import TwoFactorPage from './pages/auth/TwoFactorPage'
import ModeSelector from './pages/ModeSelector'
import Onboarding from './pages/Onboarding'

const Dashboard         = lazy(() => import('./pages/Dashboard'))
const Personal          = lazy(() => import('./pages/Personal'))
const PersonalMes       = lazy(() => import('./pages/PersonalMes'))
const Estudio           = lazy(() => import('./pages/Estudio'))
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
    <ErrorBoundary>
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"                      element={<Dashboard />} />
          <Route path="/personal"              element={<Personal />} />
          <Route path="/personal/mes/:num"     element={<PersonalMes />} />
          <Route path="/estudio"               element={mode === 'estudio' ? <Estudio /> : <Navigate to="/" replace />} />
          <Route path="/mas"                   element={<Mas />} />
          <Route path="/deudas"                element={mode === 'personal' ? <Deudas />    : <Navigate to="/" replace />} />
          <Route path="/metas"                 element={mode === 'personal' ? <Metas />     : <Navigate to="/" replace />} />
          <Route path="/patrimonio"            element={mode === 'personal' ? <Patrimonio /> : <Navigate to="/" replace />} />
          <Route path="/ajustes"               element={<Ajustes />} />
          <Route path="/tarjetas"              element={mode === 'personal' ? <Tarjetas />  : <Navigate to="/" replace />} />
          <Route path="/ajustes/2fa"           element={<SetupTwoFactorPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
    </ErrorBoundary>
  )
}

// Gate that shows loading → onboarding → app in sequence
function FinanceGate({ children }) {
  const { state, cloudLoading } = useFinance()

  if (cloudLoading) return <LoadingScreen />
  if (!state.config.onboardingDone) return <Onboarding />
  return children
}

function AuthGate() {
  const { ready, user, mfaPending, activeProfile, mode } = useAuth()
  const [authView, setAuthView] = useState('login')

  if (!ready) return <LoadingScreen />

  if (!user) {
    return authView === 'login'
      ? <LoginPage onShowRegister={() => setAuthView('register')} />
      : <RegisterPage onShowLogin={() => setAuthView('login')} />
  }

  if (mfaPending) return <TwoFactorPage />
  if (!mode)      return <ModeSelector />

  return (
    <FinanceProvider profileId={activeProfile.id} mode={mode}>
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
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AuthGate />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
