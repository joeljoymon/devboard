import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { register, user, isLoading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  // useEffect(() => {
  //   document.title = `${activeProject?.name} — DevBoard`
  //   return () => { document.title = 'DevBoard' }
  // }, [activeProject])

  // If already logged in, go to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await register(form.name, form.email, form.password)
    if (useAuthStore.getState().user) {
      toast.success('Account created!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-gray-400 mt-2">Start managing your projects</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 transition"
              placeholder="Joel Joymon"
            />
          </div>

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
              minLength={6}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 transition"
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-lg py-3 transition"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}