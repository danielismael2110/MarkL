import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import "./css/Perfil.css";

const Perfil = () => {
  const { user, profile, updateProfile, updatePassword, uploadAvatar, fetchUserOrders } = useAuth();

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("perfil");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    telefono: "",
    direccion: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nombre_completo: profile.nombre_completo || "",
        telefono: profile.telefono || "",
        direccion: profile.direccion || "",
      });
    }
    if (activeTab === "pedidos") loadOrders();
  }, [profile, activeTab]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await fetchUserOrders();
      if (error) throw error;
      setOrders(data || []);
    } catch {
      setError("Error al cargar tus pedidos");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await updateProfile(formData);
      if (error) throw error;
      setMessage("Perfil actualizado correctamente ✅");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(passwordData.newPassword);
      if (error) throw error;
      setMessage("Contraseña actualizada con éxito 🔒");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB");
      return;
    }

    setAvatarLoading(true);
    try {
      await uploadAvatar(file);
      setMessage("Avatar actualizado correctamente 🖼️");
    } catch (err) {
      setError("Error al subir imagen");
    } finally {
      setAvatarLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="perfil-wrapper">
      <div className="perfil-glass-card">
        {/* ENCABEZADO */}
        <div className="perfil-header">
          <div className="perfil-avatar-box">
            <img
              src={
                profile?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profile?.nombre_completo || "Usuario"
                )}&background=1e293b&color=fff`
              }
              alt="Avatar"
              className="perfil-avatar"
            />
            <label htmlFor="avatar-upload" className="avatar-edit-btn">
              <i className="fa-solid fa-camera"></i>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            {avatarLoading && <LoadingSpinner size="sm" />}
          </div>
          <div className="perfil-user-info">
            <h1>{profile?.nombre_completo || "Usuario"}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        {/* TABS */}
        <div className="perfil-tabs">
          {["perfil", "seguridad", "pedidos"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            >
              {tab === "perfil"
                ? "Datos Personales"
                : tab === "seguridad"
                ? "Seguridad"
                : "Pedidos"}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="perfil-body">
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          {/* TAB: PERFIL */}
          {activeTab === "perfil" && (
            <form onSubmit={handleSubmit} className="perfil-form animate-fade">
              <Input
                label="Nombre Completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
              />
              <Input
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
              <div className="form-group">
                <label>Dirección</label>
                <textarea
                  name="direccion"
                  rows="3"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : "Actualizar Datos"}
              </Button>
            </form>
          )}

          {/* TAB: SEGURIDAD */}
          {activeTab === "seguridad" && (
            <form
              onSubmit={handlePasswordSubmit}
              className="perfil-form animate-fade"
            >
              <Input
                label="Nueva Contraseña"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              <Input
                label="Confirmar Contraseña"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
              <Button type="submit" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : "Cambiar Contraseña"}
              </Button>
            </form>
          )}

          {/* TAB: PEDIDOS */}
          {activeTab === "pedidos" && (
            <div className="pedidos-list animate-fade">
              {ordersLoading ? (
                <div className="loading-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-center text-gray-600">
                  No tienes pedidos aún 🛒
                </p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="pedido-card">
                    <div className="pedido-header">
                      <h4>Pedido #{o.numero_pedido}</h4>
                      <span className={`estado ${o.estado}`}>
                        {o.estado.toUpperCase()}
                      </span>
                    </div>
                    <p>{formatDate(o.creado_en)}</p>
                    <p className="pedido-total">
                      Total: Bs. {o.total?.toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;
