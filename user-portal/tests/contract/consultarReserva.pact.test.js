const { PactV4, MatchersV3 } = require("@pact-foundation/pact");
const { eachLike, like } = MatchersV3;
const path = require("path");
const { consultarReservas } = require("../../src/reservationClient");

const provider = new PactV4({
  consumer: "PortalUsuario",
  provider: "ServicioReservas",
  dir: path.resolve(__dirname, "../../../pacts"),
});

describe("Contrato 2: Consultar Reservas de Usuario", () => {
  // Caso 1: usuario con reservas
  it("debe retornar las reservas de un usuario con reservas activas", async () => {
    await provider
      .addInteraction()
      .given("el usuario U100 posee una reserva activa")
      .uponReceiving("una solicitud de reservas para U100")
      .withRequest("GET", "/reservas", (builder) => {
        builder.query({ usuario: "U100" });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(
          eachLike({
            id: like("R-1001"),
            usuarioId: "U100",
            sala: like("SALA-1"),
            fecha: like("2026-10-01"),
            horas: like(2),
            estado: "activa",
          })
        );
      })
      .executeTest(async (mockServer) => {
        const reservas = await consultarReservas("U100", mockServer.url);
        expect(reservas.length).toBeGreaterThan(0);
        expect(reservas[0].usuarioId).toBe("U100");
        expect(reservas[0].estado).toBe("activa");
      });
  });

  // Caso 2: usuario sin reservas
  it("debe retornar una lista vacía para un usuario sin reservas", async () => {
    await provider
      .addInteraction()
      .given("el usuario U200 no posee ninguna reserva")
      .uponReceiving("una solicitud de reservas para U200")
      .withRequest("GET", "/reservas", (builder) => {
        builder.query({ usuario: "U200" });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody([]);
      })
      .executeTest(async (mockServer) => {
        const reservas = await consultarReservas("U200", mockServer.url);
        expect(reservas).toEqual([]);
      });
  });
});