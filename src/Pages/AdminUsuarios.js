import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import './AdminUsuarios.css';
import { CrownIcon, GraduateIcon, ClipboardIcon, EditIcon, TrashIcon, CopyIcon, KeyIcon, ShareIcon, PlusIcon, RefreshIcon } from '../icons';
import usuarioService from '../core/services/usuarioService';
import carreraService from '../core/services/carreraService';
import profesorService from '../core/services/profesorService';
import adminService from '../core/services/adminService';

const AdminUsuarios = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [showModalSincronizar, setShowModalSincronizar] = useState(false);
  const [sincronizacionLogs, setSincronizacionLogs] = useState([]);
  const [sincronizacionData, setSincronizacionData] = useState({
    periodo: '2526A',
    grupo: '',  // Vacío = sincronizar todos
    limpiarDatos: false
  });
  
  // Periodos permitidos para sincronización
  const periodosPermitidos = ['2526A', '2425B'];
  
  const [showModal, setShowModal] = useState(false);
  const [showModalCredenciales, setShowModalCredenciales] = useState(false);
  const [credencialesUsuario, setCredencialesUsuario] = useState(null);
  const [reseteandoContraseña, setReseteandoContraseña] = useState(false);
  
  // Estados para alertas personalizadas
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'info', // 'success', 'error', 'warning', 'info', 'confirm'
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar'
  });
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    id_usuario: '',
    nombre_usuario: '',
    contraseña: '',
    rol: 'jefe',
    id_carrera: '',
    is_active: true
  });
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [busquedaMatricula, setBusquedaMatricula] = useState('');
  const [focusNombre, setFocusNombre] = useState(false);
  const [focusMatricula, setFocusMatricula] = useState(false);
  const [lastAddedUserId, setLastAddedUserId] = useState(null);

  // Orden: admin logueado primero, último usuario agregado segundo, resto
  const usuariosOrdenados = React.useMemo(() => {
    if (!usuarios.length) return [];
    const currentId = user?.id_usuario;
    const first = currentId ? usuarios.find((u) => u.id_usuario === currentId) : null;
    const secondId = lastAddedUserId && lastAddedUserId !== currentId ? lastAddedUserId : null;
    const second = secondId ? usuarios.find((u) => u.id_usuario === secondId) : null;
    const rest = usuarios.filter((u) => u.id_usuario !== currentId && u.id_usuario !== secondId);
    return [first, second, ...rest].filter(Boolean);
  }, [usuarios, user?.id_usuario, lastAddedUserId]);

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

  const seleccionarProfesor = (profesor) => {
    if (!profesor) return;
    setProfesorSeleccionado(profesor);
    const contraseñaGenerada = generarContraseña(profesor.nombre_profesor, profesor.id_profesor);
    setFormData(prev => ({
      ...prev,
      id_usuario: profesor.id_profesor,
      nombre_usuario: profesor.nombre_profesor,
      contraseña: contraseñaGenerada
    }));
    setBusquedaNombre(profesor.nombre_profesor);
    setBusquedaMatricula(profesor.id_profesor);
    setFocusNombre(false);
    setFocusMatricula(false);
  };

  const limpiarSeleccionProfesor = () => {
    setProfesorSeleccionado(null);
    setFormData(prev => ({
      ...prev,
      id_usuario: '',
      nombre_usuario: '',
      contraseña: ''
    }));
    setBusquedaNombre('');
    setBusquedaMatricula('');
  };

  const q = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const profesoresFiltradosPorNombre = busquedaNombre.trim()
    ? profesores.filter(p => q(p.nombre_profesor).includes(q(busquedaNombre)))
    : profesores;
  const profesoresFiltradosPorMatricula = busquedaMatricula.trim()
    ? profesores.filter(p => (p.id_profesor || '').toLowerCase().includes(busquedaMatricula.trim().toLowerCase()))
    : profesores;


  const handleAgregarUsuario = () => {
    setEditando(null);
    setProfesorSeleccionado(null);
    setBusquedaNombre('');
    setBusquedaMatricula('');
    setFocusNombre(false);
    setFocusMatricula(false);
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

  const handleVerCredenciales = async (usuario) => {
    try {
      setReseteandoContraseña(true);
      // Resetear contraseña para obtener las credenciales
      const resultado = await usuarioService.resetPassword(usuario.id_usuario);
      setCredencialesUsuario({
        id_usuario: resultado.id_usuario,
        nombre_usuario: resultado.nombre_usuario,
        contraseña: resultado.contraseña
      });
      setShowModalCredenciales(true);
    } catch (err) {
      console.error('Error obteniendo credenciales:', err);
      showAlert('error', 'Error', 'Error al obtener credenciales. Por favor, intenta de nuevo.');
    } finally {
      setReseteandoContraseña(false);
    }
  };

  // Funciones helper para mostrar alertas
  const showAlert = (type, title, message) => {
    setAlertState({
      show: true,
      type,
      title,
      message,
      onConfirm: () => setAlertState(prev => ({ ...prev, show: false })),
      onCancel: null,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar'
    });
  };

  const showConfirm = (title, message, onConfirm, onCancel = null) => {
    setAlertState({
      show: true,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setAlertState(prev => ({ ...prev, show: false }));
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setAlertState(prev => ({ ...prev, show: false }));
      },
      confirmText: 'Aceptar',
      cancelText: 'Cancelar'
    });
  };

  const handleCopiarCredenciales = (texto) => {
    navigator.clipboard.writeText(texto).then(() => {
      showAlert('success', '¡Copiado!', 'Las credenciales se han copiado al portapapeles.');
    }).catch(err => {
      console.error('Error copiando:', err);
      showAlert('error', 'Error', 'Error al copiar. Por favor, copia manualmente.');
    });
  };

  const handleEliminarUsuario = async (idUsuario, nombreUsuario) => {
    // Validar si el usuario está intentando eliminarse a sí mismo
    if (user && user.id_usuario === idUsuario) {
      showAlert('warning', 'Acción no permitida', 'No puedes eliminarte a ti mismo. Por favor, solicita a otro administrador que lo haga.');
      return;
    }

    showConfirm(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar al usuario "${nombreUsuario}"?\n\nEsta acción no se puede deshacer.`,
      async () => {
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
          
          showAlert('error', 'Error', errorMessage);
        }
      },
      null
    );
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
        
        const newId = formData.id_usuario;
        await usuarioService.create(formData);
        setLastAddedUserId(newId);
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
      
      showAlert('error', 'Error', errorMessage);
      // No cerrar el modal si hay error, para que el usuario pueda corregir
    }
  };

  // Función auxiliar para obtener el nombre de la carrera
  const getCarreraNombre = (idCarrera) => {
    if (!idCarrera) return 'N/A';
    const carrera = carreras.find(c => c.id_carrera === idCarrera);
    return carrera ? carrera.nombre_carrera : idCarrera;
  };

  const ejecutarSincronizacion = async () => {
    try {
      setSincronizando(true);
      setError(null);
      setSincronizacionLogs(['⏳ Iniciando sincronización...']);
      const resultado = await adminService.sincronizarBaseDatos(
        sincronizacionData.periodo,
        sincronizacionData.grupo || null,  // null = sincronizar todos
        sincronizacionData.limpiarDatos
      );
      
      // Mostrar logs si están disponibles
      if (resultado.logs && resultado.logs.length > 0) {
        setSincronizacionLogs(resultado.logs);
      }
      
      let mensaje = `${resultado.mensaje}!\n\n`;
      mensaje += `Periodo: ${resultado.periodo}\n`;
      mensaje += `Grupos sincronizados: ${resultado.grupo === 'TODOS' ? resultado.grupos_sincronizados : 1}\n`;
      
      if (resultado.grupos_fallidos > 0) {
        mensaje += `Grupos con errores: ${resultado.grupos_fallidos}\n`;
      }
      
      mensaje += `\nEstadísticas:\n`;
      mensaje += `- Carreras: ${resultado.estadisticas.carreras_insertadas} insertadas, ${resultado.estadisticas.carreras_actualizadas} actualizadas\n`;
      mensaje += `- Grupos: ${resultado.estadisticas.grupos_insertados} insertados, ${resultado.estadisticas.grupos_actualizados} actualizados\n`;
      mensaje += `- Aulas: ${resultado.estadisticas.aulas_insertadas} insertadas, ${resultado.estadisticas.aulas_actualizadas} actualizadas\n`;
      mensaje += `- Profesores: ${resultado.estadisticas.profesores_insertados} insertados, ${resultado.estadisticas.profesores_actualizados} actualizados\n`;
      mensaje += `- Materias: ${resultado.estadisticas.materias_insertadas} insertadas, ${resultado.estadisticas.materias_actualizadas} actualizadas\n`;
      mensaje += `- Periodos: ${resultado.estadisticas.periodos_insertados} insertados, ${resultado.estadisticas.periodos_actualizados} actualizados\n`;
      mensaje += `- Horarios: ${resultado.estadisticas.horarios_insertados} insertados, ${resultado.estadisticas.horarios_actualizados} actualizados\n\n`;
      mensaje += `Total insertado: ${resultado.total_insertado} registros\n`;
      mensaje += `Total actualizado: ${resultado.total_actualizado} registros\n`;
      mensaje += `Total operaciones: ${resultado.total_operaciones} registros`;
      
      // Mostrar mensaje final
      showAlert('success', 'Sincronización completada', mensaje);
      
      // No cerrar el modal automáticamente para que el usuario pueda ver los logs
      // setShowModalSincronizar(false);
      // Recargar datos si es necesario
      loadCarreras();
      loadProfesores();
    } catch (err) {
      console.error('Error sincronizando base de datos:', err);
      const errorMsg = `Error al sincronizar la base de datos: ${err.response?.data?.detail || err.message || 'Error desconocido'}`;
      setError(errorMsg);
      setSincronizacionLogs(prev => [...prev, `ERROR: ${errorMsg}`]);
    } finally {
      setSincronizando(false);
    }
  };

  const handleSincronizarBaseDatos = async () => {
    if (!sincronizacionData.periodo) {
      showAlert('warning', 'Periodo requerido', 'Por favor, selecciona el periodo académico.');
      return;
    }
    
    // Validar que el periodo esté en la lista de permitidos
    if (!periodosPermitidos.includes(sincronizacionData.periodo)) {
      showAlert('warning', 'Periodo no permitido', `Solo se permiten los siguientes periodos: ${periodosPermitidos.join(', ')}`);
      return;
    }

    const sincronizarTodos = !sincronizacionData.grupo || sincronizacionData.grupo.trim() === '';
    
    if (sincronizarTodos) {
      showConfirm(
        'Confirmar sincronización',
        'Se sincronizarán TODAS las carreras y TODOS los grupos.\n\nEsto puede tomar varios minutos dependiendo de la cantidad de datos.\n\n¿Deseas continuar?',
        () => {
          if (sincronizacionData.limpiarDatos) {
            showConfirm(
              'ADVERTENCIA CRÍTICA',
              'Esto borrará TODOS los datos de carreras, grupos, aulas, profesores, materias y horarios.\n\nLos usuarios NO se eliminarán.\n\n¿Estás completamente seguro de continuar?',
              () => ejecutarSincronizacion(),
              null
            );
          } else {
            ejecutarSincronizacion();
          }
        },
        null
      );
      return;
    }

    if (sincronizacionData.limpiarDatos) {
      showConfirm(
        'ADVERTENCIA CRÍTICA',
        'Esto borrará TODOS los datos de carreras, grupos, aulas, profesores, materias y horarios.\n\nLos usuarios NO se eliminarán.\n\n¿Estás completamente seguro de continuar?',
        () => ejecutarSincronizacion(),
        null
      );
      return;
    }

    ejecutarSincronizacion();
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="admin-usuarios-container">
        <div className="content-area">
          <div className="usuarios-section">
            <div className="section-header">
              <h2 className="section-title">Usuarios del Sistema</h2>
              <div className="header-actions">
                <button className="agregar-btn" onClick={handleAgregarUsuario}>
                  <PlusIcon style={{ fontSize: '1.1rem' }} />
                  Agregar Usuario
                </button>
                <button className="sincronizar-btn" onClick={() => setShowModalSincronizar(true)}>
                  <RefreshIcon style={{ fontSize: '1.1rem' }} />
                  Actualizar Base de Datos
                </button>
              </div>
            </div>

            {error && (
              <div style={{ 
                background: '#F3F4F6', 
                color: '#6B7280', 
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
                        <th>No. de trabajador</th>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Información</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosOrdenados.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                            No hay usuarios registrados
                          </td>
                        </tr>
                      ) : (
                        usuariosOrdenados.map((usuario) => (
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
                              <div className="acciones-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button 
                                  className="editar-btn"
                                  onClick={() => handleEditarUsuario(usuario)}
                                  title="Editar usuario"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <EditIcon style={{fontSize: '16px'}}/>
                                  <span>Editar</span>
                                </button>
                                <button 
                                  className="eliminar-btn"
                                  onClick={() => handleEliminarUsuario(usuario.id_usuario, usuario.nombre_usuario)}
                                  disabled={user && user.id_usuario === usuario.id_usuario}
                                  title={user && user.id_usuario === usuario.id_usuario ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                                  style={{
                                    opacity: (user && user.id_usuario === usuario.id_usuario) ? 0.5 : 1,
                                    cursor: (user && user.id_usuario === usuario.id_usuario) ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <TrashIcon style={{fontSize: '16px'}}/>
                                  <span>Eliminar</span>
                                </button>
                                <button 
                                  onClick={() => handleVerCredenciales(usuario)}
                                  disabled={reseteandoContraseña}
                                  title="Compartir credenciales"
                                  style={{
                                    backgroundColor: reseteandoContraseña ? '#9CA3AF' : '#3B82F6',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    cursor: reseteandoContraseña ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '36px',
                                    height: '36px',
                                    transition: 'all 0.2s ease',
                                    opacity: reseteandoContraseña ? 0.6 : 1
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!reseteandoContraseña) {
                                      e.target.style.backgroundColor = '#2563EB';
                                      e.target.style.transform = 'scale(1.05)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!reseteandoContraseña) {
                                      e.target.style.backgroundColor = '#3B82F6';
                                      e.target.style.transform = 'scale(1)';
                                    }
                                  }}
                                >
                                  <ShareIcon style={{fontSize: '18px'}}/>
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
                <p className="stat-number">{usuarios.filter(u => u.is_active).length}</p>
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
                  <label>Buscar por Nombre del Maestro</label>
                  <div className="searchable-select-wrap">
                    <input
                      type="text"
                      value={busquedaNombre}
                      onChange={(e) => {
                        const v = e.target.value;
                        setBusquedaNombre(v);
                        if (!v.trim()) limpiarSeleccionProfesor();
                        else if (profesorSeleccionado && v !== profesorSeleccionado.nombre_profesor) {
                          setProfesorSeleccionado(null);
                          setFormData(prev => ({ ...prev, id_usuario: '', nombre_usuario: '', contraseña: '' }));
                          setBusquedaMatricula('');
                        }
                      }}
                      onFocus={() => setFocusNombre(true)}
                      onBlur={() => setTimeout(() => setFocusNombre(false), 180)}
                      placeholder="Escribe para filtrar por nombre..."
                    />
                    {focusNombre && profesoresFiltradosPorNombre.length > 0 && (
                      <ul className="searchable-dropdown">
                        {profesoresFiltradosPorNombre.slice(0, 50).map((profesor) => (
                          <li
                            key={profesor.id_profesor}
                            onMouseDown={(e) => { e.preventDefault(); seleccionarProfesor(profesor); }}
                          >
                            {profesor.nombre_profesor}
                            <small>No. de trabajador: {profesor.id_profesor}</small>
                          </li>
                        ))}
                        {profesoresFiltradosPorNombre.length > 50 && (
                          <li style={{ color: '#9CA3AF', cursor: 'default', fontSize: '0.85rem' }}>
                            Escribe más para afinar ({(profesoresFiltradosPorNombre.length - 50)} más)
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Buscar por No. de trabajador</label>
                  <div className="searchable-select-wrap">
                    <input
                      type="text"
                      value={busquedaMatricula}
                      onChange={(e) => {
                        const v = e.target.value;
                        setBusquedaMatricula(v);
                        if (!v.trim()) limpiarSeleccionProfesor();
                        else if (profesorSeleccionado && v !== profesorSeleccionado.id_profesor) {
                          setProfesorSeleccionado(null);
                          setFormData(prev => ({ ...prev, id_usuario: '', nombre_usuario: '', contraseña: '' }));
                          setBusquedaNombre('');
                        }
                      }}
                      onFocus={() => setFocusMatricula(true)}
                      onBlur={() => setTimeout(() => setFocusMatricula(false), 180)}
                      placeholder="Escribe para filtrar por matrícula..."
                    />
                    {focusMatricula && profesoresFiltradosPorMatricula.length > 0 && (
                      <ul className="searchable-dropdown">
                        {profesoresFiltradosPorMatricula.slice(0, 50).map((profesor) => (
                          <li
                            key={profesor.id_profesor}
                            onMouseDown={(e) => { e.preventDefault(); seleccionarProfesor(profesor); }}
                          >
                            <strong>{profesor.id_profesor}</strong>
                            <small>{profesor.nombre_profesor}</small>
                          </li>
                        ))}
                        {profesoresFiltradosPorMatricula.length > 50 && (
                          <li style={{ color: '#9CA3AF', cursor: 'default', fontSize: '0.85rem' }}>
                            Escribe más para afinar ({(profesoresFiltradosPorMatricula.length - 50)} más)
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>No. de trabajador *</label>
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
                  <label>No. de trabajador</label>
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

      {/* Modal de sincronización */}
      {showModalSincronizar && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 className="modal-title">Actualizar Base de Datos</h3>
            <p style={{ marginBottom: '20px', color: '#6B7280' }}>
              Consulta la API externa de horarios y actualiza la base de datos con los datos más recientes.
            </p>
            
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Periodo Académico *:</label>
              <select
                value={sincronizacionData.periodo}
                onChange={(e) => setSincronizacionData({ ...sincronizacionData, periodo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: 'white'
                }}
              >
                {periodosPermitidos.map(periodo => (
                  <option key={periodo} value={periodo}>
                    {periodo}
                  </option>
                ))}
              </select>
              <small style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                Solo se permiten los periodos: {periodosPermitidos.join(', ')}
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Grupo Escolar (opcional):</label>
              <input
                type="text"
                value={sincronizacionData.grupo}
                onChange={(e) => setSincronizacionData({ ...sincronizacionData, grupo: e.target.value })}
                placeholder="Dejar vacío para sincronizar TODOS los grupos. Ej: 706 para un grupo específico"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #D1D5DB'
                }}
              />
              <small style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                Si dejas vacío, se sincronizarán automáticamente todas las carreras y todos los grupos del periodo.
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={sincronizacionData.limpiarDatos}
                  onChange={(e) => setSincronizacionData({ ...sincronizacionData, limpiarDatos: e.target.checked })}
                />
                <span>Borrar datos existentes antes de insertar</span>
              </label>
              <div style={{ marginLeft: '24px', marginTop: '8px' }}>
                <small style={{ color: '#6B7280', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  ADVERTENCIA: Si está marcado, se eliminarán TODOS los datos de:
                </small>
                <ul style={{ margin: '4px 0', paddingLeft: '20px', color: '#6B7280', fontSize: '0.9rem' }}>
                  <li>Carreras</li>
                  <li>Grupos</li>
                  <li>Aulas</li>
                  <li>Profesores</li>
                  <li>Materias</li>
                  <li>Horarios</li>
                  <li>Periodos</li>
                </ul>
                <small style={{ color: '#10B981', display: 'block', marginTop: '8px', fontWeight: '500' }}>
                  Los usuarios NO se eliminarán
                </small>
                <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#F3F4F6', borderRadius: '6px' }}>
                  <strong style={{ color: '#374151', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Cuándo usar:</strong>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px', color: '#6B7280', fontSize: '0.85rem' }}>
                    <li><strong>Marcar:</strong> Primera sincronización completa o cuando quieres reemplazar todos los datos</li>
                    <li><strong>No marcar:</strong> Actualización incremental o cuando solo quieres agregar/actualizar datos nuevos</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => {
                  setShowModalSincronizar(false);
                  setSincronizacionData({ periodo: '2526A', grupo: '', limpiarDatos: false });
                }}
                disabled={sincronizando}
              >
                Cancelar
              </button>
              <button 
                className="modal-confirm"
                onClick={handleSincronizarBaseDatos}
                disabled={sincronizando || !sincronizacionData.periodo || sincronizacionData.periodo.trim() === ''}
                style={{
                  backgroundColor: sincronizando || !sincronizacionData.periodo || sincronizacionData.periodo.trim() === '' ? '#9CA3AF' : '#3B82F6',
                  cursor: sincronizando || !sincronizacionData.periodo || sincronizacionData.periodo.trim() === '' ? 'not-allowed' : 'pointer'
                }}
              >
                {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver/copiar credenciales */}
      {showModalCredenciales && credencialesUsuario && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{ 
            maxWidth: '520px',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '0',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#3B82F6',
              color: '#fff',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShareIcon style={{ fontSize: '20px' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  Credenciales de Usuario
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                  {credencialesUsuario.nombre_usuario}
                </p>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              <div style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#6B7280', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Usuario (No. de trabajador)
                  </label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'stretch', 
                    gap: '8px' 
                  }}>
                    <input
                      type="text"
                      value={credencialesUsuario.id_usuario}
                      readOnly
                      onFocus={(e) => e.target.select()}
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#fff',
                        fontFamily: 'monospace',
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#111827',
                        cursor: 'text',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => handleCopiarCredenciales(credencialesUsuario.id_usuario)}
                      className="btn-copiar-credenciales"
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#2563EB',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        minWidth: '100px',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1D4ED8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563EB';
                      }}
                      title="Copiar usuario"
                    >
                      <CopyIcon style={{ fontSize: '16px' }} />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '0' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#6B7280', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Contraseña
                  </label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'stretch', 
                    gap: '8px' 
                  }}>
                    <input
                      type="text"
                      value={credencialesUsuario.contraseña}
                      readOnly
                      onFocus={(e) => e.target.select()}
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#fff',
                        fontFamily: 'monospace',
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#111827',
                        cursor: 'text',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => handleCopiarCredenciales(credencialesUsuario.contraseña)}
                      className="btn-copiar-credenciales"
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#2563EB',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        minWidth: '100px',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1D4ED8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563EB';
                      }}
                      title="Copiar contraseña"
                    >
                      <CopyIcon style={{ fontSize: '16px' }} />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Copiar todo */}
              <button
                onClick={() => handleCopiarCredenciales(`Usuario: ${credencialesUsuario.id_usuario}\nContraseña: ${credencialesUsuario.contraseña}`)}
                className="btn-copiar-todo"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#2563EB',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              >
                <CopyIcon style={{ fontSize: '18px' }} />
                <span>Copiar Usuario y Contraseña</span>
              </button>

              <p style={{
                marginTop: '16px',
                fontSize: '12px',
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: '1.5'
              }}>
              
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: '#F9FAFB'
            }}>
              <button 
                onClick={() => {
                  setShowModalCredenciales(false);
                  setCredencialesUsuario(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6B7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#4B5563';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6B7280';
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente de Alerta Personalizado */}
      {alertState.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '480px',
            width: '90%',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease'
          }}>
            {/* Header con color según tipo */}
            <div style={{
              backgroundColor: 
                alertState.type === 'success' ? '#10B981' :
                alertState.type === 'error' ? '#6B7280' :
                alertState.type === 'warning' ? '#F59E0B' :
                alertState.type === 'confirm' ? '#6366F1' :
                '#3B82F6',
              color: '#fff',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                {alertState.type === 'success' && 'OK'}
                {alertState.type === 'error' && 'X'}
                {alertState.type === 'warning' && '!'}
                {alertState.type === 'confirm' && '?'}
                {alertState.type === 'info' && 'i'}
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', flex: 1 }}>
                {alertState.title || 
                  (alertState.type === 'success' ? 'Éxito' :
                   alertState.type === 'error' ? 'Error' :
                   alertState.type === 'warning' ? 'Advertencia' :
                   alertState.type === 'confirm' ? 'Confirmar' :
                   'Información')}
              </h3>
            </div>

            {/* Contenido */}
            <div style={{ padding: '24px' }}>
              <div style={{
                color: '#374151',
                fontSize: '15px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
                marginBottom: alertState.type === 'confirm' ? '0' : '20px'
              }}>
                {alertState.message}
              </div>

              {/* Botones */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: alertState.type === 'confirm' ? 'flex-end' : 'flex-end'
              }}>
                {alertState.type === 'confirm' && alertState.onCancel && (
                  <button
                    onClick={alertState.onCancel}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      minWidth: '100px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#E5E7EB';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#F3F4F6';
                    }}
                  >
                    {alertState.cancelText}
                  </button>
                )}
                <button
                  onClick={alertState.onConfirm}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 
                      alertState.type === 'success' ? '#10B981' :
                      alertState.type === 'error' ? '#6B7280' :
                      alertState.type === 'warning' ? '#F59E0B' :
                      alertState.type === 'confirm' ? '#6366F1' :
                      '#3B82F6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    const colors = {
                      success: '#059669',
                      error: '#4B5563',
                      warning: '#D97706',
                      confirm: '#4F46E5',
                      info: '#2563EB'
                    };
                    e.target.style.backgroundColor = colors[alertState.type] || colors.info;
                  }}
                  onMouseLeave={(e) => {
                    const colors = {
                      success: '#10B981',
                      error: '#6B7280',
                      warning: '#F59E0B',
                      confirm: '#6366F1',
                      info: '#3B82F6'
                    };
                    e.target.style.backgroundColor = colors[alertState.type] || colors.info;
                  }}
                >
                  {alertState.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default AdminUsuarios;