import React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "./css/footer.css";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { darkMode } = useTheme(); // Usar el hook del tema

  return (
    <footer className={`footer ${darkMode ? 'dark-theme' : ''}`}>
      <div className="footer-container">
        {/* SECCIÓN IZQUIERDA */}
        <div className="footer-brand">
          <h2 className="footer-title">MarkLicor <span>mundo</span></h2>
          <p className="footer-subtitle">Licores premium para ti</p>
          <p className="footer-description">
            En MarkLicor mundo encontrarás la mejor selección de vinos, licores y bebidas premium. 
            Calidad, variedad y excelencia en cada botella.
          </p>

          <ul className="footer-contact">
            <li>
              <Phone className="footer-icon" /> 77363636
            </li>
            <li>
              <Mail className="footer-icon" /> marklicor2000@marklicormundo.com
            </li>
            <li>
              <MapPin className="footer-icon" /> AV.blanco galindo km 2 acera norte
            </li>
          </ul>

          {/* REDES SOCIALES */}
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <Facebook className="social-icon" />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram className="social-icon" />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter className="social-icon" />
            </a>
          </div>
        </div>

        {/* ENLACES */}
        <div className="footer-links">
          <h3>Enlaces Rápidos</h3>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/productos">Productos</a></li>
            <li><a href="/login">Mi Cuenta</a></li>
            <li><a href="/carrito">Carrito</a></li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        © {currentYear} <span>MarkLicor mundo</span>. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;