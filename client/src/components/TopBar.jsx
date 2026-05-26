export default function TopBar({ title, subtitle, actions }) {
  return (
    <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
      <div>
        <h1 className="text-white font-semibold text-lg leading-none">{title}</h1>
        {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  )
}