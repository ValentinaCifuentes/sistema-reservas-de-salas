const { PactV4, MatchersV3 } = require("@pact-foundation/pact");
const { like, regex } = MatchersV3;
const path = require("path");
const { crearReserva } = require("../../src/reservationClient");

const provider = new PactV4({
  consumer: "PortalUsuario",
  provider: "ServicioReservas",
  dir: path.resolve(__dirname, "../../../pacts"),
});

describe("Contrato 1: Crear Reserva", () => {
  // Caso 1: Reserva válida
  it("debe crear una reserva cuando las horas son válidas", async () => {
    await provider
      .addInteraction()
      .given("el sistema esta preparado para crear una nueva reserva valida")
      .uponReceiving("una solicitud para crear una reserva válida")
      .withRequest("POST", "/reservas", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          usuarioId: "U100",
          sala: "SALA-1",
          fecha: "2026-10-01",
          horas: 2,
        });
      })
      .willRespondWith(201, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          id: regex("R-\\d+", "R-1001"),
          usuarioId: "U100",
          sala: "SALA-1",
          fecha: "2026-10-01",
          horas: 2,
          estado: "activa",
        });
      })
      .executeTest(async (mockServer) => {
        const reserva = await crearReserva(
          {
            usuarioId: "U100",
            sala: "SALA-1",
            fecha: "2026-10-01",
            horas: 2,
          },
          mockServer.url
        );

        expect(reserva.id).toMatch(/^R-\d+$/);
        expect(reserva.usuarioId).toBe("U100");
        expect(reserva.sala).toBe("SALA-1");
        expect(reserva.estado).toBe("activa");
      });
  });

  // Caso 2: Reserva inválida (0 horas)
  it("debe rechazar una reserva cuando las horas son 0", async () => {
    await provider
      .addInteraction()
      .given("el sistema esta preparado para crear una nueva reserva valida")
      .uponReceiving("una solicitud para crear una reserva con horas inválidas")
      .withRequest("POST", "/reservas", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          usuarioId: "U100",
          sala: "SALA-1",
          fecha: "2026-10-01",
          horas: 0,
        });
      })
      .willRespondWith(400, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          error: like("La cantidad de horas es inválida"),
        });
      })
      .executeTest(async (mockServer) => {
        let thrownError;
        try {
          await crearReserva(
            {
              usuarioId: "U100",
              sala: "SALA-1",
              fecha: "2026-10-01",
              horas: 0,
            },
            mockServer.url
          );
        } catch (error) {
          thrownError = error;
        }

        expect(thrownError).toBeDefined();
        expect(thrownError.response?.status).toBe(400);
        expect(thrownError.response?.data?.error).toBe(
          "La cantidad de horas es inválida"
        );
      });
  });
});

