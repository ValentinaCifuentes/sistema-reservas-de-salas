const app = require("./app");

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Servicio de Reservas escuchando en puerto ${PORT}`);
});

function handleShutdown(signal) {
  console.log(`Recibida señal ${signal}, cerrando servidor de reservas...`);
  server.close(() => {
    console.log("Servidor de reservas cerrado correctamente.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forzando cierre de servidor de reservas por timeout.");
    process.exit(1);
  }, 5000).unref();
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

module.exports = server;

