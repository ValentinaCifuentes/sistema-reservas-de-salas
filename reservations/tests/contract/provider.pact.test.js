const { Verifier } = require("@pact-foundation/pact");
const path = require("path");
const app = require("../../src/app");
const repository = require("../../src/reservationRepository");

describe("Verificación del Proveedor - Servicio de Reservas", () => {
  let server;
  const PORT = 3010;
  const PROVIDER_URL = `http://localhost:${PORT}`;

  beforeAll((done) => {
    server = app.listen(PORT, () => done());
  });

  afterAll((done) => {
    server.close(() => done());
  });

  it("debe cumplir los contratos de los consumidores", async () => {
    const options = {
      provider: "ServicioReservas",
      providerBaseUrl: PROVIDER_URL,
      pactUrls: [
        path.resolve(
          __dirname,
          "../../../pacts/PortalUsuario-ServicioReservas.json"
        ),
      ],
      stateHandlers: {
        "el sistema esta preparado para crear una nueva reserva valida": () => {
          repository.reset();
          return Promise.resolve();
        },
        "el usuario U100 posee una reserva activa": () => {
          repository.reset();
          repository.crear({
            usuarioId: "U100",
            sala: "SALA-1",
            fecha: "2026-10-01",
            horas: 2,
          });
          return Promise.resolve();
        },
        "el usuario U200 no posee ninguna reserva": () => {
          repository.reset();
          return Promise.resolve();
        },
      },
    };

    await new Verifier(options).verifyProvider();
  });
});
