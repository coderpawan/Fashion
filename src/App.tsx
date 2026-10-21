import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminLookFormPage } from './pages/AdminLookFormPage'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { CategoryPage } from './pages/CategoryPage'
import { LookDetailPage } from './pages/LookDetailPage'
import { LooksPage } from './pages/LooksPage'
import { PublicHomePage } from './pages/PublicHomePage'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Analytics />
      <Routes>
        <Route path="/" element={<Layout><PublicHomePage /></Layout>} />
        <Route path="/looks" element={<Layout><LooksPage /></Layout>} />
        <Route path="/look/:slug" element={<Layout><LookDetailPage /></Layout>} />
        <Route path="/category/:categorySlug" element={<Layout><CategoryPage /></Layout>} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Layout><AdminDashboardPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/looks/new"
          element={
            <ProtectedRoute>
              <Layout><AdminLookFormPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/looks/:id/edit"
          element={
            <ProtectedRoute>
              <Layout><AdminLookFormPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Layout><AdminSettingsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
