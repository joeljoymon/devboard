import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login, user, isLoading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(form.email, form.password, form.rememberMe)
    if (useAuthStore.getState().user) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 transition"
              placeholder="joel@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 transition"
              placeholder="Your password"
            />
          </div>

          {/* Remember me checkbox — wires to your backend rememberMe logic */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={e => setForm({ ...form, rememberMe: e.target.checked })}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 accent-violet-500"
            />
            <span className="text-sm text-gray-400">Remember me for 30 days</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-lg py-3 transition"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          No account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300">Create one</Link>
        </p>
      </div>
    </div>
  )
}