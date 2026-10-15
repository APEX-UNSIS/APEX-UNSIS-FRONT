import api from '../auth/infrastructure/api';

class UsuarioService {
    constructor(api) {
        this.api = api;
    }

    // Obtener todos los usuarios
    getAll = async () => {
        const response = await this.api.get('/usuarios/');
        return response.data;
    };

    // Obtener un usuario por ID
    getById = async (idUsuario) => {
        const response = await this.api.get(`/usuarios/${idUsuario}`);
        return response.data;
    };

    // Crear un nuevo usuario
    create = async (usuarioData) => {
        const response = await this.api.post('/usuarios/', usuarioData);
        return response.data;
    };

    // Actualizar un usuario
    update = async (idUsuario, usuarioData) => {
        const response = await this.api.put(`/usuarios/${idUsuario}`, usuarioData);
        return response.data;
    };

    // Eliminar un usuario
    delete = async (idUsuario) => {
        const response = await this.api.delete(`/usuarios/${idUsuario}`);
        return response.data;
    };

    // Obtener usuarios por rol
    getByRol = async (rol) => {
        const response = await this.api.get(`/usuarios/rol/${rol}`);
        return response.data;
    };

    // Resetear contraseña de un usuario
    resetPassword = async (idUsuario, nuevaContraseña = null) => {
        const params = nuevaContraseña ? { nueva_contraseña: nuevaContraseña } : {};
        const response = await this.api.post(`/usuarios/${idUsuario}/reset-password`, null, { params });
        return response.data;
    };
}

export default new UsuarioService(api);
