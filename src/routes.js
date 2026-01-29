/**
 * Constantes de rutas centralizadas
 * Evita conflictos y facilita el mantenimiento
 */

export const ROUTES = {
  // Rutas públicas
  LOGIN: '/',
  HOME: '/dashboard',
  
  // Rutas de Jefe de Carrera
  GENERAR_CALENDARIO: '/generar-calendario',
  VER_CALENDARIO: '/ver-calendario',
  VER_CALENDARIO_SERVICIOS: '/ver-calendario-servicios',
  MODIFICAR_CALENDARIO: '/modificar-calendario',
  GESTION_SINODALES: '/gestion',
  
  // Rutas de Administrador
  ADMIN_USUARIOS: '/admin-usuarios',
  
  // Rutas de Servicios Escolares
  SERVICIOS_ESCOLARES: '/servicios-escolares',
  
  // Ruta de error
  NOT_FOUND: '/404',
};

/**
 * Configuración de rutas por rol
 */
import { HomeIcon, UsersIcon, CalendarIcon, EyeIcon, EditIcon, GraduateIcon, CheckIcon } from './icons';

export const ROUTES_BY_ROLE = {
  admin: [
    { path: ROUTES.HOME, label: 'Inicio', icon: HomeIcon },
    { path: ROUTES.ADMIN_USUARIOS, label: 'Gestión de Usuarios', icon: UsersIcon },
  ],
  jefe: [
    { path: ROUTES.HOME, label: 'Inicio', icon: HomeIcon },
    { path: ROUTES.GENERAR_CALENDARIO, label: 'Calendario de Examenes', icon: CalendarIcon },
    { path: ROUTES.VER_CALENDARIO, label: 'Ver Calendarios', icon: EyeIcon },
    { path: ROUTES.MODIFICAR_CALENDARIO, label: 'Modificar Calendario', icon: EditIcon },
    { path: ROUTES.GESTION_SINODALES, label: 'Gestión', icon: GraduateIcon },
  ],
  servicios: [
    { path: ROUTES.HOME, label: 'Inicio', icon: HomeIcon },
    { path: ROUTES.SERVICIOS_ESCOLARES, label: 'Validar Calendarios', icon: CheckIcon },
    { path: ROUTES.VER_CALENDARIO_SERVICIOS, label: 'Ver Calendario (Servicios)', icon: EyeIcon },
  ],
};

/**
 * Obtiene las rutas permitidas para un rol específico
 */
export const getRoutesByRole = (rol) => {
  return ROUTES_BY_ROLE[rol] || ROUTES_BY_ROLE.admin;
};
