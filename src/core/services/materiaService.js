import api from '../auth/infrastructure/api';

class MateriaService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todas las materias
    getAll = async () => {
        const response = await this.api.get('/materias/');
        return response.data;
    };

    // Obtener materias por carrera con filtros opcionales
    getByCarrera = async (idCarrera, filters = {}) => {
        const params = new URLSearchParams();
        if (filters.id_periodo) params.append('id_periodo', filters.id_periodo);
        if (filters.id_grupo) params.append('id_grupo', filters.id_grupo);
        const queryString = params.toString();
        const url = `/materias/carrera/${idCarrera}${queryString ? '?' + queryString : ''}`;
        const response = await this.api.get(url);
        return response.data;
    };

    // Actualizar una materia
    update = async (idMateria, data) => {
        const response = await this.api.put(`/materias/${idMateria}`, data);
        return response.data;
    };

    // Obtener una materia por ID
    getById = async (idMateria) => {
        const response = await this.api.get(`/materias/${idMateria}`);
        return response.data;
    };
}

export default new MateriaService(api);
