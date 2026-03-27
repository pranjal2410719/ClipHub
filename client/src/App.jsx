import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import AnimatedBackground from './components/AnimatedBackground'
import Navbar    from './components/Navbar'
import Footer from './components/Footer'
import HomePage  from './pages/HomePage'
import ClipPage  from './pages/ClipPage'
import DocsPage  from './pages/DocsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedBackground />
        <Navbar />
        <Routes>
          <Route path="/"      element={<HomePage />} />
          <Route path="/clip"  element={<ClipPage  />} />
          <Route path="/docs"  element={<DocsPage  />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}