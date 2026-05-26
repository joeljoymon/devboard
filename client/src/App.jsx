import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProjectPage from './pages/ProjectPage'
import CreateWorkspace from './pages/CreateWorkspace'
import NotFound from './pages/NotFound'

export default function App() {
  const fetchMe = useAuthStore(state => state.fetchMe)

  // On every app load, check if cookie exists and fetch user
  useEffect(() => {
    fetchMe()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-workspace" element={<CreateWorkspace/>} />

        {/* Protected routes — all share AppLayout */}
        <Route path="/" element={
          <ProtectedRoute><AppLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects/:projectId" element={<ProjectPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}