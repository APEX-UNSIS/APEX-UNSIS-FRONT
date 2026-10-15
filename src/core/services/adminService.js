import api from '../auth/infrastructure/api';

class AdminService {
  constructor(api) {
    this.api = api;
  }

  // Sincronizar base de datos desde API externa
  sincronizarBaseDatos = async (periodo, grupo = null, limpiarDatos = false) => {
    const params = {
      periodo,
      limpiar_datos: limpiarDatos
    };
    
    // Solo agregar grupo si se especifica (null = sincronizar todos)
    if (grupo && grupo.trim() !== '') {
      params.grupo = grupo;
    }
    
    const response = await this.api.post('/admin/sincronizar-base-datos', null, { params });
    return response.data;
  };
}

export default new AdminService(api);
