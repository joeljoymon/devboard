const variants = {
  high:       'bg-rose-500/20 text-rose-400',
  medium:     'bg-amber-500/20 text-amber-400',
  low:        'bg-green-500/20 text-green-400',
  todo:       'bg-gray-500/20 text-gray-400',
  inprogress: 'bg-blue-500/20 text-blue-400',
  done:       'bg-green-500/20 text-green-400',
  manager:    'bg-violet-500/20 text-violet-400',
  member:     'bg-teal-500/20 text-teal-400',
  viewer:     'bg-gray-500/20 text-gray-400',
}

export default function Badge({ label }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${variants[label] || 'bg-gray-700 text-gray-300'}`}>
      {label}
    </span>
  )
}