import api from '../auth/infrastructure/api';

class CarreraService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todas las carreras
    getAll = async () => {
        const response = await this.api.get('/carreras/');
        return response.data;
    };

    // Obtener una carrera por ID
    getById = async (idCarrera) => {
        const response = await this.api.get(`/carreras/${idCarrera}`);
        return response.data;
    };
}

export default new CarreraService(api);
