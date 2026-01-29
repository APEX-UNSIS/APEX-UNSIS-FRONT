import api from '../auth/infrastructure/api';

class GrupoService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todos los grupos
    getAll = async () => {
        const response = await this.api.get('/grupos/');
        return response.data;
    };

    // Obtener grupos por carrera
    getByCarrera = async (idCarrera) => {
        const response = await this.api.get(`/grupos/carrera/${idCarrera}`);
        return response.data;
    };

    // Obtener un grupo por ID
    getById = async (idGrupo) => {
        const response = await this.api.get(`/grupos/${idGrupo}`);
        return response.data;
    };
}

export default new GrupoService(api);
