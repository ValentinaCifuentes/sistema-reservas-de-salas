const repository = require("./reservationRepository");

/**
 * Servicio de negocio para reservas.
 * Contiene las reglas de validación y orquesta el repositorio.
 */

/**
 * Crea una nueva reserva validando las reglas de negocio.
 * @param {Object} datos - { usuarioId, sala, fecha, horas }
 * @returns {Object} { exito: boolean, reserva?, error? }
 */
function crearReserva(datos) {
  if (!datos || typeof datos !== "object") {
    return {
      exito: false,
      error: "Faltan datos obligatorios para la reserva",
    };
  }

  if (typeof datos.horas !== "number" || Number.isNaN(datos.horas) || datos.horas <= 0) {
    return {
      exito: false,
      error: "La cantidad de horas es inválida",
    };
  }

  if (
    !datos.usuarioId ||
    typeof datos.usuarioId !== "string" ||
    !datos.usuarioId.trim() ||
    !datos.sala ||
    !datos.fecha
  ) {
    return {
      exito: false,
      error: "Faltan datos obligatorios para la reserva",
    };
  }

  const reserva = repository.crear(datos);
  return { exito: true, reserva };
}

/**
 * Consulta las reservas de un usuario.
 * @param {string} usuarioId
 * @returns {Object} { exito: boolean, reservas?, error? }
 */
function consultarReservasPorUsuario(usuarioId) {
  if (!usuarioId || typeof usuarioId !== "string" || !usuarioId.trim()) {
    return {
      exito: false,
      error: "Debe indicar un usuario para consultar sus reservas",
    };
  }

  const reservas = repository.buscarPorUsuario(usuarioId.trim());
  return { exito: true, reservas };
}

/**
 * Verifica si una reserva existe y está activa.
 * @param {string} id - Identificador de la reserva (ej. R-1001).
 * @returns {Object} { valida: boolean }
 */
function verificarReserva(id) {
  if (!id || typeof id !== "string") {
    return { valida: false };
  }

  const reserva = repository.obtenerPorId(id.trim());

  if (reserva && reserva.estado === "activa") {
    return { valida: true };
  }

  return { valida: false };
}

module.exports = { crearReserva, consultarReservasPorUsuario, verificarReserva };

