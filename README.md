# Sistema de Reservas de Salas Universitarias

Este proyecto implementa un sistema distribuido para la reserva de salas académicas por parte de estudiantes y docentes, validando la comunicación y compatibilidad entre microservicios mediante **pruebas de contrato orientadas por el consumidor (Consumer-Driven Contracts)** utilizando [Pact](https://docs.pact.io/).

---

## 🏛️ Arquitectura del Sistema

El sistema está compuesto por **tres servicios independientes**:

```
                              ┌────────────────────────┐
                              │     Portal Usuario     │
                              │  (Consumidor / :3002)  │
                              └───────────┬────────────┘
                                          │ Contrato 2: Consultar reservas
                                          ▼
┌────────────────────────┐    Contrato 1: Crear reserva    ┌────────────────────────┐
│  App / Portal Cliente  ├────────────────────────────────►│  Servicio de Reservas  │
│      (Consumidor)      │                                 │  (PROVEEDOR / :3001)   │
└────────────────────────┘                                 └───────────▲────────────┘
                                                                       │
                                          ┌────────────────────────────┴┐
                                          │   Servicio Administración   │
                                          │    (Consumidor / :3003)     │
                                          └─────────────────────────────┘
                                            Contrato 3: Verificar reserva
```

### Servicios

| Servicio | Directorio | Rol Pact | Puerto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Servicio de Reservas** | `reservations/` | **Proveedor (Provider)** | `3001` | Almacena y gestiona reservas, procesa creaciones, consultas por usuario y verificaciones de estado. |
| **Portal de Usuario** | `user-portal/` | **Consumidor (Consumer)** | `3002` | Permite a los usuarios consultar sus reservas activas e históricas. |
| **Servicio de Administración** | `admin/` | **Consumidor (Consumer)** | `3003` | Permite a los administradores comprobar si una reserva específica existe y se encuentra activa. |

---

## 📋 Funcionalidades del Sistema

### 1. Crear una Reserva (`POST /reservas`)
- **Parámetros de entrada**: `usuarioId`, `sala`, `fecha`, `horas`.
- **Reglas de negocio**:
  - Si `horas > 0`, se registra la reserva, se le asigna un identificador único (ej. `R-1001`) y el estado `activa`. Respuesta: `201 Created`.
  - Si `horas <= 0`, la solicitud es rechazada informando que la cantidad de horas es inválida. Respuesta: `400 Bad Request`.

### 2. Consultar Reservas de un Usuario (`GET /reservas?usuario={usuarioId}`)
- Si el usuario posee reservas activas (ej. `U100`), se retorna la lista con los detalles de cada reserva (`200 OK`).
- Si el usuario no registra reservas (ej. `U200`), se retorna una lista vacía `[]` de forma exitosa (`200 OK`), sin considerarlo un error.

### 3. Verificar una Reserva (`GET /reservas/{id}/verificar`)
- Si la reserva existe y está activa (ej. `R-1001`), se responde que la reserva es válida (`valida: true`).
- Si la reserva no existe o no se encuentra activa, se responde que la reserva no es válida (`valida: false`).

---

## 🤝 Pruebas de Contrato (Pact)

Las pruebas de contrato se definen desde la perspectiva de los consumidores y se generan automáticamente en la carpeta `./pacts`.

### Contratos a implementar:

1. **Contrato 1 (Creación de Reserva $\rightarrow$ Servicio de Reservas)**:
   - **Caso Válido**: Creación con horas válidas ($> 0$), respuesta con ID y estado activo.
   - **Caso Inválido**: Creación con 0 horas o negativo, rechazo con mensaje de error.

2. **Contrato 2 (Portal de Usuario $\rightarrow$ Servicio de Reservas)**:
   - **Caso Usuario con Reservas**: Usuario `U100` recibe arreglo con reservas activas.
   - **Caso Usuario sin Reservas**: Usuario `U200` recibe arreglo vacío `[]`.

3. **Contrato 3 (Servicio de Administración $\rightarrow$ Servicio de Reservas)**:
   - **Caso Reserva Existente**: Reserva `R-1001` confirmada como válida.
   - **Caso Reserva Inexistente**: Reserva desconocida identificada como no válida.

### Preparación de Estados del Proveedor (Provider States)
El Servicio de Reservas implementa un endpoint de soporte de estados para garantizar la reproducibilidad de las pruebas:
- `el usuario U100 posee una reserva activa`
- `el usuario U200 no posee ninguna reserva`
- `la reserva R-1001 existe y se encuentra activa`
- `una determinada reserva no existe`
- `el sistema esta preparado para crear una nueva reserva valida`

---

## 📁 Estructura del Repositorio

```text
sistema-reservas-de-salas/
├── README.md                     # Documentación general del proyecto
├── docker-compose.yml            # Orquestación completa de los 3 servicios
├── pacts/                        # Directorio donde se generan los contratos Pact
├── reservations/                 # Servicio de Reservas (Proveedor)
│   ├── Dockerfile                # Imagen Docker del servicio
│   ├── package.json
│   └── src/
├── user-portal/                  # Portal de Usuario (Consumidor)
│   ├── Dockerfile                # Imagen Docker del servicio
│   ├── package.json
│   └── tests/contract/           # Pruebas Pact del consumidor
└── admin/                        # Servicio de Administración (Consumidor)
    ├── Dockerfile                # Imagen Docker del servicio
    ├── package.json
    └── tests/contract/           # Pruebas Pact del consumidor
```

---

## 🚀 Despliegue con Docker

Para compilar y levantar todos los servicios juntos en segundo plano:

```bash
docker compose up -d --build
```

Para ver los logs de los servicios:
```bash
docker compose logs -f
```

Para detener los servicios:
```bash
docker compose down
```

También es posible levantar o reconstruir un servicio específico desde la raíz:
```bash
docker compose up -d --build reservations
docker compose up -d --build user-portal
docker compose up -d --build admin
```

---

## 🧪 Ejecución del Flujo de Pruebas de Contrato

### 1. Generar contratos Pact (Lado Consumidores)
Ejecutar las suites de pruebas en los servicios consumidores para generar los archivos en `./pacts`:
```bash
# Portal de Usuario
cd user-portal && npm test

# Servicio de Administración
cd ../admin && npm test
```

### 2. Verificar contratos contra el Proveedor Real
Con los contratos generados en `./pacts` y el Servicio de Reservas activo:
```bash
cd reservations
npm run test:pact
```
