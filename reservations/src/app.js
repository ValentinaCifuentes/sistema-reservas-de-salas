const express = require("express");
const { crearReserva } = require("./reservationService");

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

module.exports = app;
