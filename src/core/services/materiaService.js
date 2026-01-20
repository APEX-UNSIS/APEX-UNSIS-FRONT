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

    // Obtener materias por carrera
    getByCarrera = async (idCarrera) => {
        const response = await this.api.get(`/materias/carrera/${idCarrera}`);
        return response.data;
    };

    // Obtener una materia por ID
    getById = async (idMateria) => {
        const response = await this.api.get(`/materias/${idMateria}`);
        return response.data;
    };
}

export default new MateriaService(api);
