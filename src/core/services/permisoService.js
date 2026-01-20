import api from '../auth/infrastructure/api';

class PermisoService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todos los permisos
    getAll = async () => {
        const response = await this.api.get('/permisos/');
        return response.data;
    };

    // Obtener permisos por profesor
    getByProfesor = async (idProfesor) => {
        const response = await this.api.get(`/permisos/profesor/${idProfesor}`);
        return response.data;
    };

    // Obtener permisos por materia
    getByMateria = async (idMateria) => {
        const response = await this.api.get(`/permisos/materia/${idMateria}`);
        return response.data;
    };

    // Crear un permiso
    create = async (permisoData) => {
        const response = await this.api.post('/permisos/', permisoData);
        return response.data;
    };

    // Eliminar un permiso
    delete = async (idRegla) => {
        const response = await this.api.delete(`/permisos/${idRegla}`);
        return response.data;
    };
}

export default new PermisoService(api);
