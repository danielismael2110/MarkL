import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';
import './css/layout.css';

const Layout = () => {
  const { darkMode } = useTheme(); // Usar el hook del tema

  return (
    <div className={`layout ${darkMode ? 'dark-theme' : ''}`}>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;