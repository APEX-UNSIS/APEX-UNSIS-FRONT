import api from '../auth/infrastructure/api';

class AulaService {
    constructor(api) {
        this.api = api;
    }

    getAll = async (skip = 0, limit = 2000) => {
        const response = await this.api.get('/aulas/', { params: { skip, limit } });
        return response.data;
    };

    getDisponibles = async (capacidadMinima = null, skip = 0, limit = 200) => {
        const params = { skip, limit };
        if (capacidadMinima != null) params.capacidad_minima = capacidadMinima;
        const response = await this.api.get('/aulas/disponibles', { params });
        return response.data;
    };
}

export default new AulaService(api);
