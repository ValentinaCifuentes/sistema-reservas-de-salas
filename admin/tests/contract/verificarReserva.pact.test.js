const { PactV4, MatchersV3 } = require("@pact-foundation/pact");
const path = require("path");
const { verificarReserva } = require("../../src/reservationClient");

const provider = new PactV4({
  consumer: "ServicioAdministracion",
  provider: "ServicioReservas",
  dir: path.resolve(__dirname, "../../../pacts"),
});

describe("Contrato 3: Verificar Reserva", () => {
  // Caso 1: Reserva existente y activa
  it("debe indicar que la reserva R-1001 es válida", async () => {
    await provider
      .addInteraction()
      .given("la reserva R-1001 existe y se encuentra activa")
      .uponReceiving("una solicitud para verificar la reserva R-1001")
      .withRequest("GET", "/reservas/R-1001/verificar")
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          valida: true,
        });
      })
      .executeTest(async (mockServer) => {
        const resultado = await verificarReserva("R-1001", mockServer.url);

        expect(resultado.valida).toBe(true);
      });
  });

  // Caso 2: Reserva inexistente
  it("debe indicar que una reserva inexistente no es válida", async () => {
    await provider
      .addInteraction()
      .given("una determinada reserva no existe")
      .uponReceiving("una solicitud para verificar una reserva inexistente")
      .withRequest("GET", "/reservas/R-9999/verificar")
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          valida: false,
        });
      })
      .executeTest(async (mockServer) => {
        const resultado = await verificarReserva("R-9999", mockServer.url);

        expect(resultado.valida).toBe(false);
      });
  });
});
