import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext' // Importar CartProvider

import AppRouter from './routes/AppRouter'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider> {/* Agregar CartProvider aquí */}
          <div className="App">
            <Navbar />
            <main className="main-content">
              <AppRouter />
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App