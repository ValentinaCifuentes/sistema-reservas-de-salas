const http = require("http");
const url = require("url");
const { verificarReserva } = require("./reservationClient");

const PORT = process.env.PORT || 3003;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  res.setHeader("Content-Type", "application/json");

  // Health check
  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: "ok" }));
  }

  // Verificar reserva: GET /reservas/:id/verificar
  const matchVerificar = pathname.match(/^\/reservas\/([^/]+)\/verificar$/);
  if (req.method === "GET" && matchVerificar) {
    const reservaId = matchVerificar[1];
    try {
      const resultado = await verificarReserva(reservaId);
      res.writeHead(200);
      return res.end(JSON.stringify(resultado));
    } catch (err) {
      const status = err.response ? err.response.status : 500;
      res.writeHead(status);
      return res.end(
        JSON.stringify(err.response ? err.response.data : { error: err.message })
      );
    }
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

server.listen(PORT, () => {
  console.log(`Servicio de Administración escuchando en puerto ${PORT}`);
});

module.exports = server;
