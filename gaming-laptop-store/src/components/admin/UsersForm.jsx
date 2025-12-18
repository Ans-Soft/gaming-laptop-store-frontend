import React, { useState, useEffect } from "react";
import { UserPlus, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import "../../styles/admin/usersForm.css";

const UsersForm = ({ onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const isEditMode = Boolean(user);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: "", 
      });
    }
  }, [user, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const dataToSubmit = { ...formData };
    if (isEditMode && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    if (onSubmit) onSubmit(dataToSubmit, user?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Usuario" : "Registrar Nuevo Usuario"}
      icon={isEditMode ? <Edit size={24} /> : <UserPlus size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del usuario"
          : "Completa la información del usuario para agregarlo al sistema"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="first_name">
            Nombre <span className="required">*</span>
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            placeholder="Ej: Ana"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="last_name">
            Apellido <span className="required">*</span>
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            placeholder="Ej: Gómez"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Correo electrónico <span className="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Ej: ana.gomez@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            readOnly={isEditMode}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Contraseña {isEditMode ? "(Opcional)" : <span className="required">*</span>}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
            required={!isEditMode}
          />
        </div>
      </div>
    </ModalBase>
  );
};

export default UsersForm;
