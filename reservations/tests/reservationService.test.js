const { crearReserva } = require("../src/reservationService");
const repository = require("../src/reservationRepository");

describe("Servicio de Reservas - Crear Reserva", () => {
  beforeEach(() => {
    repository.reset();
  });

  it("debe crear una reserva válida con id y estado activa", () => {
    const resultado = crearReserva({
      usuarioId: "U100",
      sala: "SALA-1",
      fecha: "2026-10-01",
      horas: 2,
    });

    expect(resultado.exito).toBe(true);
    expect(resultado.reserva).toBeDefined();
    expect(resultado.reserva.id).toMatch(/^R-\d+$/);
    expect(resultado.reserva.usuarioId).toBe("U100");
    expect(resultado.reserva.sala).toBe("SALA-1");
    expect(resultado.reserva.fecha).toBe("2026-10-01");
    expect(resultado.reserva.horas).toBe(2);
    expect(resultado.reserva.estado).toBe("activa");
  });

  it("debe rechazar una reserva con 0 horas", () => {
    const resultado = crearReserva({
      usuarioId: "U100",
      sala: "SALA-1",
      fecha: "2026-10-01",
      horas: 0,
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.error).toBe("La cantidad de horas es inválida");
  });

  it("debe rechazar una reserva con horas negativas", () => {
    const resultado = crearReserva({
      usuarioId: "U100",
      sala: "SALA-1",
      fecha: "2026-10-01",
      horas: -3,
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.error).toBe("La cantidad de horas es inválida");
  });

  it("debe rechazar una reserva sin usuarioId", () => {
    const resultado = crearReserva({
      sala: "SALA-1",
      fecha: "2026-10-01",
      horas: 2,
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.error).toBe("Faltan datos obligatorios para la reserva");
  });

  it("debe generar ids únicos para cada reserva", () => {
    const r1 = crearReserva({
      usuarioId: "U100",
      sala: "SALA-1",
      fecha: "2026-10-01",
      horas: 1,
    });
    const r2 = crearReserva({
      usuarioId: "U100",
      sala: "SALA-2",
      fecha: "2026-10-02",
      horas: 3,
    });

    expect(r1.reserva.id).not.toBe(r2.reserva.id);
  });
});
