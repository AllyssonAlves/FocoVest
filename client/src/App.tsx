import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'

// Context
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Componente de Loading
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
)

// Pages com Lazy Loading
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SimulationPage = lazy(() => import('./pages/SimulationPage'))
const SimulationsPage = lazy(() => import('./pages/SimulationsPageNew'))
const SimulationResultsPage = lazy(() => import('./pages/SimulationResultsPage'))
const IntegratedSimulationPage = lazy(() => import('./pages/IntegratedSimulationPage'))
const QuestionsPage = lazy(() => import('./pages/QuestionsPage'))
const RankingPage = lazy(() => import('./pages/RankingPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const CreateSimulationPage = lazy(() => import('./pages/CreateSimulationPage'))
const SimulationHistoryPage = lazy(() => import('./pages/SimulationHistoryPage'))
const AIPage = lazy(() => import('./pages/AIPage'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'))
const SecurityPage = lazy(() => import('./pages/SecurityPage'))
const AIQuestionGeneratorPage = lazy(() => import('./pages/AIQuestionGeneratorPage'))

// Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <Router basename={import.meta.env.BASE_URL || '/'}>
            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingSpinner />}>
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
                      path="/integrated-simulation/:simulationId"
                      element={
                        <ProtectedRoute>
                          <IntegratedSimulationPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/questions"
                      element={
                        <ProtectedRoute>
                          <QuestionsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/rankings"
                      element={
                        <ProtectedRoute>
                          <RankingPage />
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
                    <Route
                      path="/ai-generator"
                      element={
                        <ProtectedRoute>
                          <AIQuestionGeneratorPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/comparison"
                      element={
                        <ProtectedRoute>
                          <ComparisonPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/security"
                      element={
                        <ProtectedRoute>
                          <SecurityPage />
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
                    
                    {/* 404 - Catch all unmatched routes */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
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