/**
 * INTERFACES DE MAPA
 *
 * Este archivo define los tipos de datos básicos
 * relacionados con el mapa y la ubicación del usuario.
 */

// ============================================
// TIPOS BÁSICOS
// ============================================

/**
 * UserLocation: Ubicación del usuario
 *
 * Representa las coordenadas del usuario actual.
 * Puede ser undefined si no se ha obtenido la ubicación.
 *
 * Ejemplo:
 * [40.4168, -3.7038] // Madrid, España
 */
export type UserLocation = [number, number] | undefined;
