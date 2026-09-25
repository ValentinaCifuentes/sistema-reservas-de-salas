const http = require("http");
const { verificarReserva } = require("./reservationClient");

const PORT = process.env.PORT || 3003;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;

  // Health check
  if (req.method === "GET" && pathname === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }

  // Verificar reserva: GET /reservas/:id/verificar
  const matchVerificar = pathname.match(/^\/reservas\/([^/]+)\/verificar$/);
  if (req.method === "GET" && matchVerificar) {
    const reservaId = decodeURIComponent(matchVerificar[1]);
    try {
      const resultado = await verificarReserva(reservaId);
      return sendJson(res, 200, resultado);
    } catch (err) {
      const status = err.response ? err.response.status : 500;
      const data = err.response ? err.response.data : { error: err.message };
      return sendJson(res, status, data);
    }
  }

  sendJson(res, 404, { error: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`Servicio de Administración escuchando en puerto ${PORT}`);
});

function handleShutdown(signal) {
  console.log(`Recibida señal ${signal}, cerrando Servicio de Administración...`);
  server.close(() => {
    console.log("Servicio de Administración cerrado correctamente.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forzando cierre de Servicio de Administración por timeout.");
    process.exit(1);
  }, 5000).unref();
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

module.exports = server;

