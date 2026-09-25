const axios = require("axios");

const DEFAULT_BASE_URL =
  (process.env.RESERVATIONS_SERVICE_URL || "http://localhost:3001").replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Cliente HTTP para comunicarse con el Servicio de Reservas.
 */

/**
 * Solicita la creación de una reserva al Servicio de Reservas.
 * @param {Object} datos - { usuarioId, sala, fecha, horas }
 * @param {string} [baseUrl] - URL base del servicio (opcional, para testing).
 * @returns {Promise<Object>} Respuesta del servicio.
 */
async function crearReserva(datos, baseUrl) {
  const url = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const response = await axios.post(`${url}/reservas`, datos, {
    timeout: DEFAULT_TIMEOUT_MS,
  });
  return response.data;
}

/**
 * Consulta las reservas de un usuario en el Servicio de Reservas.
 * @param {string} usuarioId
 * @param {string} [baseUrl]
 * @returns {Promise<Array>} Lista de reservas.
 */
async function consultarReservas(usuarioId, baseUrl) {
  const url = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const response = await axios.get(`${url}/reservas`, {
    params: { usuario: usuarioId },
    timeout: DEFAULT_TIMEOUT_MS,
  });
  return response.data;
}

module.exports = { crearReserva, consultarReservas };



