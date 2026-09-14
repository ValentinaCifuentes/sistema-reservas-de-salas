const axios = require("axios");

const DEFAULT_BASE_URL =
  process.env.RESERVATIONS_SERVICE_URL || "http://localhost:3001";

/**
 * Cliente HTTP para comunicarse con el Servicio de Reservas
 * desde el Servicio de Administración.
 */

/**
 * Verifica si una reserva existe y está activa.
 * @param {string} reservaId - Identificador de la reserva (ej. R-1001).
 * @param {string} [baseUrl] - URL base del servicio (opcional, para testing).
 * @returns {Promise<Object>} { valida: boolean }
 */
async function verificarReserva(reservaId, baseUrl) {
  const url = baseUrl || DEFAULT_BASE_URL;
  const response = await axios.get(`${url}/reservas/${reservaId}/verificar`);
  return response.data;
}

module.exports = { verificarReserva };
