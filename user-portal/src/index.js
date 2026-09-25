const http = require("http");
const { crearReserva, consultarReservas } = require("./reservationClient");

const PORT = process.env.PORT || 3002;

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

  // Consultar reservas
  if (req.method === "GET" && pathname === "/reservas") {
    const usuario = parsedUrl.searchParams.get("usuario") || undefined;
    try {
      const reservas = await consultarReservas(usuario);
      return sendJson(res, 200, reservas);
    } catch (err) {
      const status = err.response ? err.response.status : 500;
      const data = err.response ? err.response.data : { error: err.message };
      return sendJson(res, status, data);
    }
  }

  // Crear reserva
  if (req.method === "POST" && pathname === "/reservas") {
    let body = "";

    req.on("error", (err) => {
      console.error("Error en la solicitud:", err);
      sendJson(res, 400, { error: "Error al leer los datos de la solicitud" });
    });

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      let datos;
      try {
        datos = body ? JSON.parse(body) : {};
      } catch (err) {
        return sendJson(res, 400, { error: "JSON inválido en el cuerpo de la solicitud" });
      }

      try {
        const reserva = await crearReserva(datos);
        return sendJson(res, 201, reserva);
      } catch (err) {
        const status = err.response ? err.response.status : 500;
        const data = err.response ? err.response.data : { error: err.message };
        return sendJson(res, status, data);
      }
    });
    return;
  }

  sendJson(res, 404, { error: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`Portal de Usuario escuchando en puerto ${PORT}`);
});

function handleShutdown(signal) {
  console.log(`Recibida señal ${signal}, cerrando Portal de Usuario...`);
  server.close(() => {
    console.log("Portal de Usuario cerrado correctamente.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forzando cierre de Portal de Usuario por timeout.");
    process.exit(1);
  }, 5000).unref();
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

module.exports = server;

