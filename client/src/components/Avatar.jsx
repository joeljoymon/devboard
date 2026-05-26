export default function Avatar({ name = '', size = 'md' }) {
  const s = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['bg-violet-600', 'bg-teal-600', 'bg-amber-600', 'bg-rose-600', 'bg-blue-600']
  const color = colors[name.charCodeAt(0) % colors.length]

  return (
    <div className={`${s} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}