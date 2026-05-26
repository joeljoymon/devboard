import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center">
      <div className="space-y-4">
        <p className="text-6xl">🔍</p>
        <h1 className="text-3xl font-bold text-white">Page not found</h1>
        <p className="text-gray-500">This page doesn't exist or you don't have access.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-lg transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}