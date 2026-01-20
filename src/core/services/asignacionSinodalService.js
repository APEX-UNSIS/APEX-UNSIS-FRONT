import api from '../auth/infrastructure/api';

class AsignacionSinodalService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todas las asignaciones
    getAll = async () => {
        const response = await this.api.get('/asignaciones-sinodales/');
        return response.data;
    };

    // Obtener asignaciones por solicitud (id_horario)
    getBySolicitud = async (idHorario) => {
        const response = await this.api.get(`/asignaciones-sinodales/solicitud/${idHorario}`);
        return response.data;
    };

    // Obtener asignaciones por profesor
    getByProfesor = async (idProfesor) => {
        const response = await this.api.get(`/asignaciones-sinodales/profesor/${idProfesor}`);
        return response.data;
    };

    // Crear una asignación
    create = async (asignacionData) => {
        const response = await this.api.post('/asignaciones-sinodales/', asignacionData);
        return response.data;
    };

    // Actualizar una asignación
    update = async (idExamenSinodal, asignacionData) => {
        const response = await this.api.put(`/asignaciones-sinodales/${idExamenSinodal}`, asignacionData);
        return response.data;
    };

    // Eliminar una asignación
    delete = async (idExamenSinodal) => {
        const response = await this.api.delete(`/asignaciones-sinodales/${idExamenSinodal}`);
        return response.data;
    };
}

export default new AsignacionSinodalService(api);
