export default function StatCard({ label, value, color, icon, sub }) {
  const colors = {
    teal:   'border-teal-500/30 bg-teal-500/5',
    amber:  'border-amber-500/30 bg-amber-500/5',
    purple: 'border-violet-500/30 bg-violet-500/5',
    red:    'border-rose-500/30 bg-rose-500/5',
    gray:   'border-gray-700 bg-gray-800/40',
  }
  const textColors = {
    teal:   'text-teal-400',
    amber:  'text-amber-400',
    purple: 'text-violet-400',
    red:    'text-rose-400',
    gray:   'text-gray-400',
  }

  return (
    <div className={`border rounded-xl p-5 ${colors[color] || colors.gray}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && (
          <span className="text-xs text-gray-600">{sub}</span>
        )}
      </div>
      <p className={`text-3xl font-bold mb-1 ${textColors[color]}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}