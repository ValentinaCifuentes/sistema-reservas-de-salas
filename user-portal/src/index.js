const http = require("http");
const url = require("url");
const { crearReserva, consultarReservas } = require("./reservationClient");

const PORT = process.env.PORT || 3002;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  res.setHeader("Content-Type", "application/json");

  // Health check
  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: "ok" }));
  }

  // Consultar reservas
  if (req.method === "GET" && pathname === "/reservas") {
    try {
      const reservas = await consultarReservas(query.usuario);
      res.writeHead(200);
      return res.end(JSON.stringify(reservas));
    } catch (err) {
      const status = err.response ? err.response.status : 500;
      res.writeHead(status);
      return res.end(
        JSON.stringify(err.response ? err.response.data : { error: err.message })
      );
    }
  }

  // Crear reserva
  if (req.method === "POST" && pathname === "/reservas") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const datos = body ? JSON.parse(body) : {};
        const reserva = await crearReserva(datos);
        res.writeHead(201);
        return res.end(JSON.stringify(reserva));
      } catch (err) {
        const status = err.response ? err.response.status : 500;
        res.writeHead(status);
        return res.end(
          JSON.stringify(err.response ? err.response.data : { error: err.message })
        );
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

server.listen(PORT, () => {
  console.log(`Portal de Usuario escuchando en puerto ${PORT}`);
});

module.exports = server;
