// src/components/auth/RoleRoute.jsx
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = profile?.rol_id;
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;