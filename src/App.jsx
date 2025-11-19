import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import AppRouter from './routes/AppRouter'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import './App.css'

function App() {
  return (
    <ThemeProvider> 
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main className="main-content">
                <AppRouter />
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider> 
  )
}

export default App