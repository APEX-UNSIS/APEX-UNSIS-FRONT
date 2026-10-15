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

    // Enviar calendario a Servicios Escolares
    enviar = async (idPeriodo, idEvaluacion) => {
        const response = await this.api.post('/calendario/enviar', null, {
            params: {
                id_periodo: idPeriodo,
                id_evaluacion: idEvaluacion
            }
        });
        return response.data;
    };

    // Obtener calendarios para Servicios Escolares
    obtenerParaServicios = async (estado = null) => {
        const params = estado ? { estado } : {};
        const response = await this.api.get('/calendario/servicios-escolares', { params });
        return response.data;
    };

    // Aprobar calendario (Servicios Escolares)
    aprobar = async (idCarrera, idPeriodo, idEvaluacion) => {
        const response = await this.api.post('/calendario/aprobar-masivo', null, {
            params: {
                id_carrera: idCarrera,
                id_periodo: idPeriodo,
                id_evaluacion: idEvaluacion
            }
        });
        return response.data;
    };

    // Rechazar calendario (Servicios Escolares)
    rechazar = async (idCarrera, idPeriodo, idEvaluacion, motivoRechazo) => {
        const response = await this.api.post('/calendario/rechazar-masivo', {
            id_carrera: idCarrera,
            id_periodo: idPeriodo,
            id_evaluacion: idEvaluacion,
            motivo_rechazo: motivoRechazo
        });
        return response.data;
    };
}

export default new CalendarioService(api);
