import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../../context/CartContext'
import { Wine, Star, Truck, Shield, CreditCard, Award, ShoppingCart } from 'lucide-react'
import './css/home.css'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingProducts, setAddingProducts] = useState({})
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('productos_destacados')
        .select('*')
        .limit(3)

      if (error) throw error
      
      const limitedProducts = (data || []).slice(0, 3)
      setFeaturedProducts(limitedProducts)
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product) => {
    if (product.stock === 0) {
      alert('Producto agotado')
      return
    }

    // Verificar si el usuario está autenticado
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Redirección directa al login sin mensaje
      navigate('/login')
      return
    }

    setAddingProducts(prev => ({ ...prev, [product.id]: true }))

    try {
      await addToCart(product, 1)
    } catch (error) {
      console.error('Error añadiendo al carrito:', error)
      alert('Error al añadir el producto al carrito')
    } finally {
      setAddingProducts(prev => ({ ...prev, [product.id]: false }))
    }
  }

  const benefits = [
    {
      icon: Truck,
      title: "Envíos a Todo Bolivia",
      description: "Rápidos, seguros y con seguimiento en línea",
    },
    {
      icon: Shield,
      title: "Productos Garantizados",
      description: "Auténticos, originales y con respaldo legal",
    },
    {
      icon: CreditCard,
      title: "Pagos Seguros",
      description: "Con QR, tarjeta o transferencia bancaria",
    },
    {
      icon: Award,
      title: "Calidad Premium",
      description: "Licores seleccionados de marcas reconocidas",
    },
  ]

  const getProductImage = (product) => {
    if (product.imagen) return product.imagen
    const categoryImages = {
      1: 'https://images.unsplash.com/photo-1659464832543-9c6c52abcadf?auto=format&q=80&w=1080',
      2: 'https://images.unsplash.com/photo-1758827926633-621fb8694e6e?auto=format&q=80&w=1080',
      3: 'https://images.unsplash.com/photo-1698064104861-e2dbc14ea72d?auto=format&q=80&w=1080',
      4: 'https://images.unsplash.com/photo-1581018664890-05f5f7618f04?auto=format&q=80&w=1080',
      5: 'https://images.unsplash.com/photo-1519181245277-c6ddec0d35c9?auto=format&q=80&w=1080',
    }
    return categoryImages[product.categoria_id] || 'https://images.unsplash.com/photo-1690248387895-2db2a8072ecc?auto=format&q=80&w=1080'
  }

  const formatPrice = (price) => {
    return `Bs. ${parseFloat(price).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Bienvenido a{" "}
              <span className="brand-highlight">MarkLicor</span>
              <br />
              Tu licorería premium en Bolivia
            </h1>
            <p className="hero-description">
              Descubre una colección exclusiva de vinos, whiskies y cervezas
              artesanales. Calidad internacional, precios locales.
            </p>
            <div className="hero-buttons">
              <Link to="/productos" className="btn btn-primary">
                Ver Productos
              </Link>
            
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1690248387895-2db2a8072ecc?auto=format&q=80&w=1080"
              alt="Vista interior de licorería premium en Bolivia"
              className="hero-img"
            />
            <div className="hero-badge">
              <Wine className="badge-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="benefits-section">
        <div className="benefits-container">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="benefit-card"
            >
              <div className="benefit-icon">
                <benefit.icon className="icon" />
              </div>
              <h3 className="benefit-title">
                {benefit.title}
              </h3>
              <p className="benefit-description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured-section">
        <div className="featured-container">
          <div className="section-header">
            <h2 className="section-title">
              Productos Destacados
            </h2>
            <p className="section-subtitle">
              Selección especial de nuestros clientes en toda Bolivia
            </p>
          </div>

          <div className="products-grid featured-products-grid">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
              >
                <div className="product-image-container">
                  <img
                    src={getProductImage(product)}
                    alt={product.nombre}
                    className="product-image"
                  />
                  {product.ventas_totales > 50 && (
                    <div className="product-badge">
                      Popular
                    </div>
                  )}
                </div>
                <div className="product-content">
                  <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`star-icon ${
                          i < 4 ? "filled" : "empty"
                        }`}
                      />
                    ))}
                  </div>
                  <h3 className="product-name">
                    {product.nombre}
                  </h3>
                  <div className="product-price">
                    <span className="current-price">
                      {formatPrice(product.precio)}
                    </span>
                  </div>
                  <div className="product-stock">
                    <span className="stock-available">
                      {product.stock} unidades disponibles
                    </span>
                  </div>
                  <button 
                    className={`btn btn-add-cart ${product.stock === 0 ? 'disabled' : ''}`}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 || addingProducts[product.id]}
                  >
                    {addingProducts[product.id] ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Añadiendo...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="cart-icon" />
                        Agregar al carrito
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="section-footer">
            <Link to="/productos" className="btn btn-outline">
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home