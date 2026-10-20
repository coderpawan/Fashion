import { Link } from 'react-router-dom'
import { Header } from './Header'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f4f1] text-[#2d221f]">
      <Header />
      <main>{children}</main>
      <footer className="border-t border-[#eaded9] bg-[#fffaf7]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[#534640] md:flex-row md:items-center md:justify-between">
          <p>Fashion with Ankita © 2026</p>
          <div className="flex gap-5">
            <Link to="/">Home</Link>
            <Link to="/looks">Latest Looks</Link>
            <Link to="/admin/login">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
