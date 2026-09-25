const { crearReserva, consultarReservasPorUsuario, verificarReserva } = require("../src/reservationService");
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

  it("debe rechazar una reserva sin datos o con payload nulo", () => {
    const resultado = crearReserva(null);
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toBe("Faltan datos obligatorios para la reserva");
  });

  it("debe rechazar una reserva si horas no es un número", () => {
    const resultado = crearReserva({
      usuarioId: "U100",
      sala: "SALA-1",
      fecha: "2026-10-01",
      horas: "dos",
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.error).toBe("La cantidad de horas es inválida");
  });

  it("debe rechazar una reserva si falta sala o fecha", () => {
    const sinSala = crearReserva({
      usuarioId: "U100",
      fecha: "2026-10-01",
      horas: 2,
    });
    expect(sinSala.exito).toBe(false);
    expect(sinSala.error).toBe("Faltan datos obligatorios para la reserva");

    const sinFecha = crearReserva({
      usuarioId: "U100",
      sala: "SALA-1",
      horas: 2,
    });
    expect(sinFecha.exito).toBe(false);
    expect(sinFecha.error).toBe("Faltan datos obligatorios para la reserva");
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

describe("Servicio de Reservas - Consultar Reservas", () => {
  beforeEach(() => {
    repository.reset();
  });

  it("debe retornar las reservas de un usuario", () => {
    repository.crear({ usuarioId: "U100", sala: "SALA-1", fecha: "2026-10-01", horas: 2 });

    const resultado = consultarReservasPorUsuario("U100");

    expect(resultado.exito).toBe(true);
    expect(resultado.reservas.length).toBe(1);
  });

  it("debe retornar una lista vacía si el usuario no tiene reservas", () => {
    const resultado = consultarReservasPorUsuario("U200");

    expect(resultado.exito).toBe(true);
    expect(resultado.reservas).toEqual([]);
  });

  it("debe rechazar la consulta si no se indica usuario", () => {
    const resultado = consultarReservasPorUsuario(undefined);

    expect(resultado.exito).toBe(false);
    expect(resultado.error).toBe("Debe indicar un usuario para consultar sus reservas");
  });

  it("debe rechazar la consulta si el usuario es una cadena vacía o solo espacios", () => {
    const resultado = consultarReservasPorUsuario("   ");

    expect(resultado.exito).toBe(false);
    expect(resultado.error).toBe("Debe indicar un usuario para consultar sus reservas");
  });
});

describe("Servicio de Reservas - Verificar Reserva", () => {
  beforeEach(() => {
    repository.reset();
  });

  it("debe indicar que una reserva activa es válida", () => {
    repository.insertar({
      id: "R-1001",
      usuarioId: "U100",
      sala: "SALA-1",
      fecha: "2026-10-01",
      horas: 2,
      estado: "activa",
    });

    const resultado = verificarReserva("R-1001");
    expect(resultado.valida).toBe(true);
  });

  it("debe indicar que una reserva inexistente no es válida", () => {
    const resultado = verificarReserva("R-9999");
    expect(resultado.valida).toBe(false);
  });

  it("debe indicar no válida si el id es nulo o inválido", () => {
    expect(verificarReserva(null).valida).toBe(false);
    expect(verificarReserva("").valida).toBe(false);
  });
});

