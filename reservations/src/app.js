const express = require("express");
const { crearReserva, consultarReservasPorUsuario, verificarReserva } = require("./reservationService");

const app = express();
app.use(express.json());

// Health check para Docker
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/**
 * POST /reservas - Crear una nueva reserva.
 *
 * Body esperado: { usuarioId, sala, fecha, horas }
 *
 * Respuestas:
 *  201 - Reserva creada exitosamente (retorna la reserva con id y estado).
 *  400 - Datos inválidos (ej. horas <= 0).
 */
app.post("/reservas", (req, res) => {
  const { usuarioId, sala, fecha, horas } = req.body;

  const resultado = crearReserva({ usuarioId, sala, fecha, horas });

  if (!resultado.exito) {
    return res.status(400).json({ error: resultado.error });
  }

  return res.status(201).json(resultado.reserva);
});

/**
 * GET /reservas?usuario={usuarioId} - Consultar reservas de un usuario.
 *
 * Respuestas:
 *  200 - Lista de reservas (puede ser vacía []).
 *  400 - Falta el parámetro usuario.
 */
app.get("/reservas", (req, res) => {
  const { usuario } = req.query;

  const resultado = consultarReservasPorUsuario(usuario);

  if (!resultado.exito) {
    return res.status(400).json({ error: resultado.error });
  }

  return res.status(200).json(resultado.reservas);
});

/**
 * GET /reservas/:id/verificar - Verificar si una reserva existe y está activa.
 *
 * Respuestas:
 *  200 - { valida: true/false }
 */
app.get("/reservas/:id/verificar", (req, res) => {
  const { id } = req.params;
  const resultado = verificarReserva(id);
  return res.status(200).json(resultado);
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo centralizado de errores (ej. JSON malformado)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "JSON inválido en el cuerpo de la solicitud" });
  }
  console.error("Error no controlado:", err);
  return res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;

