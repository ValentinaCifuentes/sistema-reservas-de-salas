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

module.exports = { reset, crear };
