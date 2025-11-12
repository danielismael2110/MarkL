import React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import "./css/footer.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
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
              <Phone className="footer-icon" /> 1 (555) 987-6543
            </li>
            <li>
              <Mail className="footer-icon" /> contacto@marklicormundo.com
            </li>
            <li>
              <MapPin className="footer-icon" /> 456 Avenida Central, Ciudad, CP 54321
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

        {/* ENLACES RÁPIDOS */}
        <div className="footer-links">
          <h3>Enlaces Rápidos</h3>
          <ul>
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Acerca</a></li>
            <li><a href="#">Productos</a></li>
            <li><a href="#">Promociones</a></li>
            <li><a href="#">Contacto</a></li>
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
