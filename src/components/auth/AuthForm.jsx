import React from 'react';
import '../../components/auth/css/authForm.css';

const AuthForm = ({ 
  isLogin, 
  onSubmit, 
  loading, 
  error 
}) => {
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    nombre_completo: '',
    telefono: '',
    direccion: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    onSubmit(isLogin ? 
      { email: formData.email, password: formData.password } :
      formData
    );
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>

        {error && (
          <div className="auth-error">
            {error.message}
          </div>
        )}

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="nombre_completo" className="form-label">
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre_completo"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Ingresa tu nombre completo"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="tu@email.com"
          />
        </div>

        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="telefono" className="form-label">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="form-input"
                placeholder="Tu número de teléfono"
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion" className="form-label">
                Dirección
              </label>
              <textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="form-input"
                rows="3"
                placeholder="Tu dirección completa"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            className="form-input"
            placeholder="••••••••"
          />
        </div>

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="form-input"
              placeholder="••••••••"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`auth-submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="btn-spinner"></span>
              Procesando...
            </span>
          ) : (
            isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
          )}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;