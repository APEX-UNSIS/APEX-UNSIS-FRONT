import api from '../auth/infrastructure/api';

class PeriodoService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todos los periodos
    getAll = async () => {
        const response = await this.api.get('/periodos/');
        return response.data;
    };

    // Obtener un periodo por ID
    getById = async (idPeriodo) => {
        const response = await this.api.get(`/periodos/${idPeriodo}`);
        return response.data;
    };
}

export default new PeriodoService(api);
