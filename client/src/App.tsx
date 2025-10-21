import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'

// Context
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SimulationPage from './pages/SimulationPage'
import SimulationsPage from './pages/SimulationsPageNew'
import SimulationResultsPage from './pages/SimulationResultsPage'
import TimerDemoPage from './pages/TimerDemoPage'
import TestPage from './pages/TestPage'
import ApiTestPage from './pages/ApiTestPage'
import CompactTimerPage from './pages/CompactTimerPage'
import IntegratedSimulationPage from './pages/IntegratedSimulationPage'
import RouteTestPage from './pages/RouteTestPage'
import QuestionsPage from './pages/QuestionsPage'
import RankingPageImproved from './pages/RankingPageImproved'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import CreateSimulationPage from './pages/CreateSimulationPage'
import SimulationHistoryPage from './pages/SimulationHistoryPage'
import AIPage from './pages/AIPage'

// Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <Router future={{ v7_relativeSplatPath: true }}>
            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulations"
                    element={
                      <ProtectedRoute>
                        <SimulationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulations/create"
                    element={
                      <ProtectedRoute>
                        <CreateSimulationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulations/history"
                    element={
                      <ProtectedRoute>
                        <SimulationHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulations/:simulationId/take"
                    element={
                      <ProtectedRoute>
                        <SimulationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulations/:simulationId/results"
                    element={
                      <ProtectedRoute>
                        <SimulationResultsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulation"
                    element={
                      <ProtectedRoute>
                        <SimulationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/timer-demo" element={<TimerDemoPage />} />
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/api-test" element={<ApiTestPage />} />
                  <Route path="/compact-timer" element={<CompactTimerPage />} />
                  <Route path="/integrated-simulation" element={<IntegratedSimulationPage />} />
                  <Route path="/integrated-simulation/:simulationId" element={<IntegratedSimulationPage />} />
                  <Route path="/route-test" element={<RouteTestPage />} />
                  <Route
                    path="/questions"
                    element={
                      <ProtectedRoute>
                        <QuestionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ranking"
                    element={
                      <ProtectedRoute>
                        <RankingPageImproved />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai"
                    element={
                      <ProtectedRoute>
                        <AIPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 404 - Catch all unmatched routes */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: '',
                style: {
                  background: 'var(--tw-bg-opacity)',
                  color: 'var(--tw-text-opacity)',
                }
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App