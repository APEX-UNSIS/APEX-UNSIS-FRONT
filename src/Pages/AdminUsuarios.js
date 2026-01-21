import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import './AdminUsuarios.css';
import { CrownIcon, GraduateIcon, ClipboardIcon, EditIcon, TrashIcon } from '../icons';
import usuarioService from '../core/services/usuarioService';
import carreraService from '../core/services/carreraService';
import profesorService from '../core/services/profesorService';

const AdminUsuarios = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    id_usuario: '',
    nombre_usuario: '',
    contraseña: '',
    rol: 'jefe',
    id_carrera: '',
    is_active: true
  });

  // Cargar usuarios, carreras y profesores al montar el componente
  useEffect(() => {
    loadUsuarios();
    loadCarreras();
    loadProfesores();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError('Error al cargar usuarios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadCarreras = async () => {
    try {
      const data = await carreraService.getAll();
      setCarreras(data);
    } catch (err) {
      console.error('Error cargando carreras:', err);
    }
  };

  const loadProfesores = async () => {
    try {
      const data = await profesorService.getActivos();
      setProfesores(data);
    } catch (err) {
      console.error('Error cargando profesores:', err);
    }
  };

  // Función para quitar acentos de un texto
  const quitarAcentos = (texto) => {
    if (!texto) return '';
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Función para extraer iniciales del nombre
  // Ejemplo: "Manuel Alejandro Pinacho Hernández" -> "PIMA"
  // P = Pinacho (penúltimo apellido), I = segunda letra de Pinacho, M = Manuel, A = Alejandro
  const extraerIniciales = (nombreCompleto) => {
    if (!nombreCompleto) return '';
    
    // Quitar acentos antes de procesar
    const nombreSinAcentos = quitarAcentos(nombreCompleto);
    const palabras = nombreSinAcentos.trim().split(/\s+/).filter(p => p.length > 0);
    if (palabras.length === 0) return '';
    
    // Si solo hay una palabra, tomar las primeras 4 letras
    if (palabras.length === 1) {
      return palabras[0].substring(0, 4).toUpperCase().padEnd(4, 'X');
    }
    
    // Si hay 2 palabras: primera letra de cada una + segunda letra de la primera
    if (palabras.length === 2) {
      const primera = palabras[0][0] || '';
      const segunda = palabras[0].length > 1 ? palabras[0][1] : primera;
      const tercera = palabras[1][0] || '';
      return (primera + segunda + tercera + 'X').toUpperCase().substring(0, 4);
    }
    
    // Si hay 3 palabras: asumir: Nombre1 Nombre2 Apellido
    if (palabras.length === 3) {
      const nombre1 = palabras[0][0] || '';
      const nombre2 = palabras[1][0] || '';
      const apellido = palabras[2];
      const apellido1 = apellido[0] || '';
      const apellido2 = apellido.length > 1 ? apellido[1] : apellido1;
      return (apellido1 + apellido2 + nombre1 + nombre2).toUpperCase().substring(0, 4);
    }
    
    // Si hay 4 o más palabras: Nombre1 Nombre2 Apellido1 Apellido2
    // Ejemplo: "Manuel Alejandro Pinacho Hernández"
    // Resultado: P (Pinacho) + I (segunda de Pinacho) + M (Manuel) + A (Alejandro)
    const nombre1 = palabras[0][0] || '';
    const nombre2 = palabras.length > 1 ? palabras[1][0] : '';
    const apellido1 = palabras[palabras.length - 2]; // Penúltima palabra (primer apellido)
    const apellido1ra = apellido1[0] || '';
    const apellido2da = apellido1.length > 1 ? apellido1[1] : apellido1ra;
    
    return (apellido1ra + apellido2da + nombre1 + nombre2).toUpperCase().substring(0, 4);
  };

  // Función para extraer año de la matrícula
  const extraerAño = (matricula) => {
    if (!matricula || matricula.length < 4) return '2024';
    // Tomar los primeros 4 dígitos como año
    const año = matricula.substring(0, 4);
    return /^\d{4}$/.test(año) ? año : '2024';
  };

  // Función para generar contraseña
  const generarContraseña = (nombreCompleto, matricula) => {
    const iniciales = extraerIniciales(nombreCompleto);
    const año = extraerAño(matricula);
    return `Pass_${iniciales}#${año}`;
  };

  // Manejar selección de profesor por nombre
  const handleSeleccionarProfesorPorNombre = (e) => {
    const nombreSeleccionado = e.target.value;
    if (nombreSeleccionado) {
      const profesor = profesores.find(p => p.nombre_profesor === nombreSeleccionado);
      if (profesor) {
        setProfesorSeleccionado(profesor);
        const contraseñaGenerada = generarContraseña(profesor.nombre_profesor, profesor.id_profesor);
        setFormData({
          ...formData,
          id_usuario: profesor.id_profesor,
          nombre_usuario: profesor.nombre_profesor,
          contraseña: contraseñaGenerada
        });
      }
    } else {
      setProfesorSeleccionado(null);
      setFormData({
        ...formData,
        id_usuario: '',
        nombre_usuario: '',
        contraseña: ''
      });
    }
  };

  // Manejar selección de profesor por matrícula
  const handleSeleccionarProfesorPorMatricula = (e) => {
    const matriculaSeleccionada = e.target.value;
    if (matriculaSeleccionada) {
      const profesor = profesores.find(p => p.id_profesor === matriculaSeleccionada);
      if (profesor) {
        setProfesorSeleccionado(profesor);
        const contraseñaGenerada = generarContraseña(profesor.nombre_profesor, profesor.id_profesor);
        setFormData({
          ...formData,
          id_usuario: profesor.id_profesor,
          nombre_usuario: profesor.nombre_profesor,
          contraseña: contraseñaGenerada
        });
      }
    } else {
      setProfesorSeleccionado(null);
      setFormData({
        ...formData,
        id_usuario: '',
        nombre_usuario: '',
        contraseña: ''
      });
    }
  };


  const handleAgregarUsuario = () => {
    setEditando(null);
    setProfesorSeleccionado(null);
    setFormData({
      id_usuario: '',
      nombre_usuario: '',
      contraseña: '',
      rol: 'jefe',
      id_carrera: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEditarUsuario = (usuario) => {
    setEditando(usuario);
    setProfesorSeleccionado(null);
    setFormData({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      contraseña: '', // No mostrar contraseña al editar
      rol: usuario.rol,
      id_carrera: usuario.id_carrera || '',
      is_active: usuario.is_active
    });
    setShowModal(true);
  };

  const handleEliminarUsuario = async (idUsuario, nombreUsuario) => {
    // Validar si el usuario está intentando eliminarse a sí mismo
    if (user && user.id_usuario === idUsuario) {
      alert('No puedes eliminarte a ti mismo. Por favor, solicita a otro administrador que lo haga.');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar al usuario "${nombreUsuario}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await usuarioService.delete(idUsuario);
        await loadUsuarios(); // Recargar lista
      } catch (err) {
        console.error('Error eliminando usuario:', err);
        let errorMessage = 'Error al eliminar usuario. Por favor, intenta de nuevo.';
        
        if (err.response) {
          errorMessage = err.response.data?.detail || errorMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        alert(errorMessage);
      }
    }
  };

  const handleGuardarUsuario = async () => {
    try {
      if (editando) {
        // Editar usuario existente
        const updateData = {
          nombre_usuario: formData.nombre_usuario,
          rol: formData.rol,
          id_carrera: formData.id_carrera || null,
          is_active: formData.is_active
        };
        // Solo incluir contraseña si se proporcionó una nueva
        if (formData.contraseña && formData.contraseña.trim() !== '') {
          updateData.contraseña = formData.contraseña;
        }
        await usuarioService.update(editando.id_usuario, updateData);
      } else {
        // Agregar nuevo usuario
        if (!formData.id_usuario || !formData.nombre_usuario || !formData.contraseña) {
          alert('Por favor, completa todos los campos obligatorios.');
          return;
        }
        
        // Validar que el ID de usuario no tenga espacios
        if (formData.id_usuario.trim() !== formData.id_usuario) {
          alert('El ID de usuario no puede contener espacios.');
          return;
        }
        
        // Validar que la contraseña tenga al menos 4 caracteres
        if (formData.contraseña.length < 4) {
          alert('La contraseña debe tener al menos 4 caracteres.');
          return;
        }
        
        await usuarioService.create(formData);
      }
      setShowModal(false);
      // Limpiar el formulario
      setFormData({
        id_usuario: '',
        nombre_usuario: '',
        contraseña: '',
        rol: 'jefe',
        id_carrera: '',
        is_active: true
      });
      await loadUsuarios(); // Recargar lista
    } catch (err) {
      console.error('Error guardando usuario:', err);
      let errorMessage = 'Error al guardar usuario. Por favor, intenta de nuevo.';
      
      if (err.response) {
        // Error de respuesta del servidor
        errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
      } else if (err.message) {
        // Error de red u otro error
        errorMessage = err.message;
      }
      
      alert(errorMessage);
      // No cerrar el modal si hay error, para que el usuario pueda corregir
    }
  };

  // Función auxiliar para obtener el nombre de la carrera
  const getCarreraNombre = (idCarrera) => {
    if (!idCarrera) return 'N/A';
    const carrera = carreras.find(c => c.id_carrera === idCarrera);
    return carrera ? carrera.nombre_carrera : idCarrera;
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="admin-usuarios-container">
        <div className="content-area">
          <div className="usuarios-section">
            <div className="section-header">
              <h2 className="section-title">Usuarios del Sistema</h2>
              <button className="agregar-btn" onClick={handleAgregarUsuario}>
                + Agregar Usuario
              </button>
            </div>

            {error && (
              <div style={{ 
                background: '#FEE2E2', 
                color: '#991B1B', 
                padding: '12px', 
                borderRadius: '6px', 
                marginBottom: '20px' 
              }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Cargando usuarios...</p>
              </div>
            ) : (
              <>
                <div className="usuarios-table-container">
                  <table className="usuarios-table">
                    <thead>
                      <tr>
                        <th>Matrícula</th>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Información</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                            No hay usuarios registrados
                          </td>
                        </tr>
                      ) : (
                        usuarios.map((usuario) => (
                          <tr key={usuario.id_usuario}>
                            <td>{usuario.id_usuario}</td>
                            <td>{usuario.nombre_usuario}</td>
                            <td>
                              <span className={`rol-badge ${usuario.rol}`}>
                                {usuario.rol === 'admin' && (<><CrownIcon style={{marginRight:6}}/>Administrador</>)}
                                {usuario.rol === 'jefe' && (<><GraduateIcon style={{marginRight:6}}/>Jefe de Carrera</>)}
                                {usuario.rol === 'servicios' && (<><ClipboardIcon style={{marginRight:6}}/>Servicios Escolares</>)}
                              </span>
                            </td>
                            <td>
                              {usuario.rol === 'jefe' && `Carrera: ${getCarreraNombre(usuario.id_carrera)}`}
                              {usuario.rol === 'servicios' && 'Servicios Escolares'}
                              {usuario.rol === 'admin' && 'Administrador del sistema'}
                            </td>
                            <td>
                              <span className={`estado-badge ${usuario.is_active ? 'activo' : 'inactivo'}`}>
                                {usuario.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>
                              <div className="acciones-buttons">
                                <button 
                                  className="editar-btn"
                                  onClick={() => handleEditarUsuario(usuario)}
                                >
                                  <EditIcon style={{marginRight:8}}/>Editar
                                </button>
                                <button 
                                  className="eliminar-btn"
                                  onClick={() => handleEliminarUsuario(usuario.id_usuario, usuario.nombre_usuario)}
                                  disabled={user && user.id_usuario === usuario.id_usuario}
                                  title={user && user.id_usuario === usuario.id_usuario ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                                  style={{
                                    opacity: (user && user.id_usuario === usuario.id_usuario) ? 0.5 : 1,
                                    cursor: (user && user.id_usuario === usuario.id_usuario) ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  <TrashIcon style={{marginRight:8}}/>Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            
            <div className="stats-container">
              <div className="stat-card">
                <h3>Total Usuarios</h3>
                <p className="stat-number">{usuarios.length}</p>
              </div>
              <div className="stat-card">
                <h3>Jefes de Carrera</h3>
                <p className="stat-number">{usuarios.filter(u => u.rol === 'jefe').length}</p>
              </div>
              <div className="stat-card">
                <h3>Servicios Escolares</h3>
                <p className="stat-number">{usuarios.filter(u => u.rol === 'servicios').length}</p>
              </div>
              <div className="stat-card">
                <h3>Usuarios Activos</h3>
                <p className="stat-number">{usuarios.filter(u => u.activo).length}</p>
              </div>
            </div>
          </div>
        </div>

      {/* Modal para agregar/editar usuario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              {editando ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
            </h3>
            
            {!editando ? (
              <>
                <div className="form-group">
                  <label>Seleccionar por Nombre del Maestro</label>
                  <select
                    value={profesorSeleccionado?.nombre_profesor || ''}
                    onChange={handleSeleccionarProfesorPorNombre}
                  >
                    <option value="">-- Selecciona un maestro por nombre --</option>
                    {profesores.map((profesor) => (
                      <option key={profesor.id_profesor} value={profesor.nombre_profesor}>
                        {profesor.nombre_profesor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Seleccionar por Matrícula</label>
                  <select
                    value={profesorSeleccionado?.id_profesor || ''}
                    onChange={handleSeleccionarProfesorPorMatricula}
                  >
                    <option value="">-- Selecciona un maestro por matrícula --</option>
                    {profesores.map((profesor) => (
                      <option key={profesor.id_profesor} value={profesor.id_profesor}>
                        {profesor.id_profesor} - {profesor.nombre_profesor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Matrícula *</label>
                  <input
                    type="text"
                    value={formData.id_usuario}
                    onChange={(e) => setFormData({...formData, id_usuario: e.target.value})}
                    placeholder="Se completará automáticamente al seleccionar un maestro"
                    readOnly
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input
                    type="text"
                    value={formData.nombre_usuario}
                    onChange={(e) => setFormData({...formData, nombre_usuario: e.target.value})}
                    placeholder="Se completará automáticamente al seleccionar un maestro"
                    readOnly
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label>Contraseña * (Generada automáticamente)</label>
                  <input
                    type="text"
                    value={formData.contraseña}
                    onChange={(e) => setFormData({...formData, contraseña: e.target.value})}
                    placeholder="Se generará automáticamente al seleccionar un maestro"
                    style={{ backgroundColor: '#f0fdf4', fontFamily: 'monospace' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    Formato: Pass_[INICIALES]#[AÑO] (ej: Pass_PIMA#2022)
                  </small>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Matrícula</label>
                  <input
                    type="text"
                    value={formData.id_usuario}
                    disabled
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input
                    type="text"
                    value={formData.nombre_usuario}
                    onChange={(e) => setFormData({...formData, nombre_usuario: e.target.value})}
                    placeholder="Ej: Juan Pérez López"
                  />
                </div>

                <div className="form-group">
                  <label>Contraseña (dejar vacío para no cambiar)</label>
                  <input
                    type="password"
                    value={formData.contraseña}
                    onChange={(e) => setFormData({...formData, contraseña: e.target.value})}
                    placeholder="Dejar vacío para mantener la actual"
                  />
                </div>
              </>
            )}
            
            <div className="form-group">
              <label>Rol *</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({...formData, rol: e.target.value, id_carrera: e.target.value !== 'jefe' ? '' : formData.id_carrera})}
              >
                <option value="jefe">Jefe de Carrera</option>
                <option value="servicios">Servicios Escolares</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            {formData.rol === 'jefe' && (
              <div className="form-group">
                <label>Carrera asignada</label>
                <select
                  value={formData.id_carrera}
                  onChange={(e) => setFormData({...formData, id_carrera: e.target.value})}
                >
                  <option value="">Selecciona una carrera</option>
                  {carreras.map((carrera) => (
                    <option key={carrera.id_carrera} value={carrera.id_carrera}>
                      {carrera.nombre_carrera}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {editando && (
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  Usuario activo
                </label>
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-confirm"
                onClick={handleGuardarUsuario}
                disabled={!formData.nombre_usuario || (!editando && (!formData.id_usuario || !formData.contraseña || !profesorSeleccionado))}
              >
                {editando ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default AdminUsuarios;