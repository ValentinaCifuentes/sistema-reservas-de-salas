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
  if (!datos.horas || datos.horas <= 0) {
    return {
      exito: false,
      error: "La cantidad de horas es inválida",
    };
  }

  if (!datos.usuarioId || !datos.sala || !datos.fecha) {
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
  if (!usuarioId){
    return {
      exito: false,
      error: "Debe indicar un usuario para consultar sus reservas"
    };
  }

  const reservas = repository.buscarPorUsuario(usuarioId);
  return {exito: true, reservas};
}

module.exports = { crearReserva, consultarReservasPorUsuario };
