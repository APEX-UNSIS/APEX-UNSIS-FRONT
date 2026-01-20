import api from '../auth/infrastructure/api';

class ProfesorService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todos los profesores
    getAll = async () => {
        const response = await this.api.get('/profesores/');
        return response.data;
    };

    // Obtener profesores activos
    getActivos = async () => {
        const response = await this.api.get('/profesores/activos');
        return response.data;
    };

    // Obtener un profesor por ID
    getById = async (idProfesor) => {
        const response = await this.api.get(`/profesores/${idProfesor}`);
        return response.data;
    };

    // Obtener profesores por carrera
    getByCarrera = async (idCarrera) => {
        const response = await this.api.get(`/profesores/carrera/${idCarrera}`);
        return response.data;
    };

    // Obtener sinodales (profesores con permisos sinodales) por carrera
    getSinodalesByCarrera = async (idCarrera) => {
        const response = await this.api.get(`/profesores/sinodales/carrera/${idCarrera}`);
        return response.data;
    };
}

export default new ProfesorService(api);
