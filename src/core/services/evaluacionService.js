import api from '../auth/infrastructure/api';

class EvaluacionService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todos los tipos de evaluación
    getAll = async () => {
        const response = await this.api.get('/evaluaciones/');
        return response.data;
    };

    // Obtener un tipo de evaluación por ID
    getById = async (idEvaluacion) => {
        const response = await this.api.get(`/evaluaciones/${idEvaluacion}`);
        return response.data;
    };
}

export default new EvaluacionService(api);
