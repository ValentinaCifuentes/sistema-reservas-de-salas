const axios = require("axios");

const DEFAULT_BASE_URL =
  process.env.RESERVATIONS_SERVICE_URL || "http://localhost:3001";

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
  const url = baseUrl || DEFAULT_BASE_URL;
  const response = await axios.post(`${url}/reservas`, datos);
  return response.data;
}

module.exports = { crearReserva };
