import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts'
import useProjectStore from '../store/projectStore'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'

// Custom tooltip for charts — looks better than default
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { projectId } = useParams()
  const { activeProject, activeSprint, fetchAnalytics } = useProjectStore()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = `${activeProject?.name} — DevBoard`
    return () => { document.title = 'DevBoard' }
  }, [activeProject])

  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)
    fetchAnalytics(projectId, activeSprint?._id)
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [projectId, activeSprint?._id])

  if (isLoading) return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Analytics" subtitle={activeProject?.name} />
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    </div>
  )

  if (!data) return null

  const completionRate = data.total > 0
    ? Math.round((data.done / data.total) * 100)
    : 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Analytics"
        subtitle={activeProject?.name}
        actions={
          <div className="text-sm text-gray-500">
            Sprint: <span className="text-white">{activeSprint?.name || 'All tasks'}</span>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ── Stat cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📋" label="Total Tasks"  value={data.total}      color="gray"   />
          <StatCard icon="🔵" label="In Progress"  value={data.inprogress} color="purple" />
          <StatCard icon="✅" label="Completed"    value={data.done}       color="teal"
            sub={`${completionRate}% done`} />
          <StatCard icon="🔴" label="Overdue"      value={data.overdue}    color="red"    />
        </div>

        {/* ── Burndown + Distribution row ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Burndown chart — takes 2/3 width */}
          <div className="lg:col-span-2 bg-gray-800/40 border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-1">Sprint Burndown</h3>
            <p className="text-xs text-gray-500 mb-4">
              Tasks remaining per day — ideal vs actual
            </p>
            {data.burndown.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                Select a sprint to see burndown
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.burndown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                  <Line
                    type="monotone" dataKey="ideal"
                    stroke="#6b7280" strokeDasharray="5 5"
                    dot={false} name="Ideal"
                  />
                  <Line
                    type="monotone" dataKey="actual"
                    stroke="#8b5cf6" strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 3 }}
                    connectNulls={false} name="Actual"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart — takes 1/3 width */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-1">Task Distribution</h3>
            <p className="text-xs text-gray-500 mb-4">By status</p>
            {data.total === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                No tasks yet
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={data.distribution}
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.distribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="space-y-2 mt-2">
                  {data.distribution.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-gray-400">{d.name}</span>
                      </div>
                      <span className="text-white font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Workload + Activity row ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Member workload bar chart */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-1">Member Workload</h3>
            <p className="text-xs text-gray-500 mb-4">Tasks assigned per person</p>
            {data.workload.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                No assigned tasks
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.workload} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]}>
                    {data.workload.map((_, i) => (
                      <Cell
                        key={i}
                        fill={['#8b5cf6', '#14b8a6', '#f59e0b', '#f43f5e', '#3b82f6'][i % 5]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Activity feed */}
          <ActivityFeed projectId={projectId} />
        </div>

      </div>
    </div>
  )
}

// ── Activity Feed subcomponent ────────────────────────────
// Reads from the ActivityLog collection you'll populate in Step 6
function ActivityFeed({ projectId }) {
  const [activities, setActivities] = useState([])
  const { fetchAnalytics } = useProjectStore()

  useEffect(() => {
    // Fetch recent activity — we'll add this endpoint in Step 6
    import('../api/axios').then(({ default: axios }) => {
      axios.get(`/api/projects/${projectId}/activity`)
        .then(({ data }) => setActivities(data))
        .catch(() => setActivities([]))
    })
  }, [projectId])

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60)   return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-1">Activity</h3>
      <p className="text-xs text-gray-500 mb-4">Latest actions in this project</p>
      {activities.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
          No activity yet
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-52">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">
                  <span className="text-white font-medium">{a.user?.name}</span>
                  {' '}{a.action}{' '}
                  <span className="text-violet-400">{a.target}</span>
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{timeAgo(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}