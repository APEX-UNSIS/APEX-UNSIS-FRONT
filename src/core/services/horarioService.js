import api from '../auth/infrastructure/api';

class HorarioService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todos los horarios
    getAll = async () => {
        const response = await this.api.get('/horarios/');
        return response.data;
    };

    // Obtener horarios por carrera
    getByCarrera = async (idCarrera) => {
        const response = await this.api.get(`/horarios/carrera/${idCarrera}`);
        return response.data;
    };

    // Obtener horarios por grupo
    getByGrupo = async (idGrupo) => {
        const response = await this.api.get(`/horarios/grupo/${idGrupo}`);
        return response.data;
    };

    // Obtener un horario por ID
    getById = async (idHorario) => {
        const response = await this.api.get(`/horarios/${idHorario}`);
        return response.data;
    };
}

export default new HorarioService(api);
