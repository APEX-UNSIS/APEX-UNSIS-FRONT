import api from '../auth/infrastructure/api';

class CalendarioService {
    constructor(api) {
        this.api = api;
    }

    // Generar calendario de exámenes
    generar = async (fechaInicio, idEvaluacion, diasInhabiles = []) => {
        const response = await this.api.post('/calendario/generar', {
            fecha_inicio: fechaInicio,
            id_evaluacion: idEvaluacion,
            dias_inhabiles: diasInhabiles
        });
        return response.data;
    };

    // Verificar si existe un calendario
    verificar = async () => {
        const response = await this.api.get('/calendario/verificar');
        return response.data;
    };

    // Obtener calendario de la carrera
    obtener = async () => {
        const response = await this.api.get('/calendario/obtener');
        return response.data;
    };
}

export default new CalendarioService(api);
