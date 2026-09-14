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

module.exports = { reset, crear, buscarPorUsuario };