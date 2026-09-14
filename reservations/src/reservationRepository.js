/**
 * Repositorio en memoria para las reservas.
 */

let reservas = {};
let nextId = 1001;

/**
 * Reinicia el repositorio (para pruebas).
 */
function reset() {
  reservas = {};
  nextId = 1001;
}

/**
 * Crea una nueva reserva y la almacena.
 * @param {Object} datos - { usuarioId, sala, fecha, horas }
 * @returns {Object} La reserva creada con id y estado.
 */
function crear(datos) {
  const id = `R-${nextId++}`;
  const reserva = {
    id,
    usuarioId: datos.usuarioId,
    sala: datos.sala,
    fecha: datos.fecha,
    horas: datos.horas,
    estado: "activa",
  };
  reservas[id] = reserva;
  return reserva;
}

/**
 * Retorna todas las reservas de un usuario determinado.
 * @param {string} usuarioId
 * @returns {Array} Lista de reservas (vacía si no tiene ninguna).
 */
function buscarPorUsuario(usuarioId) {
  return Object.values(reservas).filter((r) => r.usuarioId === usuarioId);
}

/**
 * Busca una reserva por su identificador.
 * @param {string} id - Identificador de la reserva (ej. R-1001).
 * @returns {Object|undefined} La reserva encontrada o undefined.
 */
function obtenerPorId(id) {
  return reservas[id];
}

/**
 * Inserta una reserva directamente (para preparar estados de prueba).
 * @param {Object} reserva - Reserva completa con id, estado, etc.
 */
function insertar(reserva) {
  reservas[reserva.id] = reserva;
}

module.exports = { reset, crear, buscarPorUsuario, obtenerPorId, insertar };
