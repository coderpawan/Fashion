import { Link, NavLink } from 'react-router-dom'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#eaded9] bg-[#fffaf7]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Fashion with Ankita home">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1d6df] text-sm font-semibold text-[#3b2c2a]">F</div>
          <div className="text-lg font-semibold tracking-[0.08em] text-[#2d221f]">Fashion with Ankita</div>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-[#554640]">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-[#a95b76]' : '')}>Home</NavLink>
          <NavLink to="/looks" className={({ isActive }) => (isActive ? 'text-[#a95b76]' : '')}>Latest Looks</NavLink>
          <Link to="/admin/login">Admin</Link>
        </nav>
      </div>
    </header>
  )
}
