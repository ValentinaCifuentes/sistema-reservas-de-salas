# Sistema de Reservas de Salas Universitarias

Este proyecto implementa un sistema distribuido para la reserva de salas académicas por parte de estudiantes y docentes, validando la comunicación y compatibilidad entre microservicios mediante **pruebas de contrato orientadas por el consumidor (Consumer-Driven Contracts)** utilizando [Pact](https://docs.pact.io/).

---

## 🏛️ Arquitectura del Sistema

El sistema está compuesto por **tres microservicios independientes**:

```
                              ┌────────────────────────┐
                              │     Portal Usuario     │
                              │  (Consumidor / :3002)  │
                              └───────────┬────────────┘
                                          │ Contrato 2: Consultar reservas
                                          ▼
┌────────────────────────┐    Contrato 1: Crear reserva    ┌────────────────────────┐
│  Portal / App Usuario  ├────────────────────────────────►│  Servicio de Reservas  │
│      (Consumidor)      │                                 │  (PROVEEDOR / :3001)   │
└────────────────────────┘                                 └───────────▲────────────┘
                                                                       │
                                          ┌────────────────────────────┴┐
                                          │   Servicio Administración   │
                                          │    (Consumidor / :3003)     │
                                          └─────────────────────────────┘
                                            Contrato 3: Verificar reserva
```

### Microservicios y Roles

| Servicio | Directorio | Rol Pact | Puerto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Servicio de Reservas** | `reservations/` | **Proveedor (Provider)** | `3001` | Servicio central. Almacena y gestiona las reservas, procesa creaciones, consultas por usuario y verificaciones de estado. |
| **Portal de Usuario** | `user-portal/` | **Consumidor (Consumer)** | `3002` | Permite a los usuarios crear nuevas reservas y consultar sus reservas registradas. |
| **Servicio de Administración** | `admin/` | **Consumidor (Consumer)** | `3003` | Permite a administradores comprobar si una reserva específica existe y se encuentra activa. |

---

## 📋 Funcionalidades del Sistema

### 1. Crear una Reserva (`POST /reservas`)
- **Parámetros de entrada**: `usuarioId`, `sala`, `fecha`, `horas`.
- **Reglas de negocio**:
  - Si `horas > 0`: Se registra la reserva, se le asigna un identificador único (ej. `R-1001`) y el estado `activa`. Retorna código `201 Created`.
  - Si `horas <= 0`: La solicitud es rechazada informando que la cantidad de horas es inválida. Retorna código `400 Bad Request`.

### 2. Consultar Reservas de un Usuario (`GET /reservas?usuario={usuarioId}`)
- Si el usuario posee reservas activas (ej. `U100`), se retorna la lista con los detalles de cada reserva con código `200 OK`.
- Si el usuario no registra reservas (ej. `U200`), se retorna una lista vacía `[]` con código `200 OK` (no se considera un error).

### 3. Verificar una Reserva (`GET /reservas/{id}/verificar`)
- Si la reserva existe y está activa (ej. `R-1001`), se responde que la reserva es válida (`{"valida": true}`).
- Si la reserva no existe o se encuentra inactiva (ej. `R-9999`), se responde que la reserva no es válida (`{"valida": false}`).

---

## 🚀 Cómo Levantar el Sistema

El sistema se encuentra completamente contenerizado mediante **Docker Compose**, lo que permite iniciar los tres servicios con sus respectivas dependencias y configuraciones de red.

### 1. Iniciar todos los servicios
Desde la raíz del repositorio, ejecutar:
```bash
docker compose up -d --build
```

Esto compilará las imágenes de cada servicio y los levantará en segundo plano:
- **Servicio de Reservas**: Disponible en `http://localhost:3001`
- **Portal de Usuario**: Disponible en `http://localhost:3002`
- **Servicio de Administración**: Disponible en `http://localhost:3003`

### 2. Comprobar el estado y verificar endpoints
Para revisar que los contenedores estén corriendo normalmente:
```bash
docker compose ps
```

También es posible comprobar el estado de salud (_healthcheck_) de cada servicio:
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```
Todos responderán `{"status":"ok"}`.

### 3. Monitorear logs de los servicios
```bash
docker compose logs -f
```

### 4. Detener los servicios
```bash
docker compose down
```

---

## 🧪 Pruebas de Contrato (Pact)

En el enfoque **Consumer-Driven Contracts (CDC)**, los servicios consumidores definen las expectativas de la API (rutas, cabeceras, payloads y respuestas esperadas) mediante pruebas automatizadas.

### Contratos Definidos en el Sistema:

1. **Contrato 1 (Portal de Usuario $\rightarrow$ Servicio de Reservas)**:
   - **Caso Válido**: Creación con horas válidas ($> 0$), respuesta `201 Created` con identificador generado y estado `activa`.
   - **Caso Inválido**: Creación con 0 horas o negativo, rechazo con `400 Bad Request` y mensaje de error descriptivo.

2. **Contrato 2 (Portal de Usuario $\rightarrow$ Servicio de Reservas)**:
   - **Caso Usuario con Reservas**: Usuario `U100` recibe arreglo con sus reservas activas (`200 OK`).
   - **Caso Usuario sin Reservas**: Usuario `U200` recibe un arreglo vacío `[]` (`200 OK`).

3. **Contrato 3 (Servicio de Administración $\rightarrow$ Servicio de Reservas)**:
   - **Caso Reserva Existente**: Reserva `R-1001` confirmada como válida (`valida: true`, `200 OK`).
   - **Caso Reserva Inexistente**: Identificador desconocido evaluado como no válido (`valida: false`, `200 OK`).

---

## 📝 Cómo Ejecutar las Pruebas de los Consumidores y Generar los Contratos Pact

Las pruebas de los consumidores se ejecutan contra un **Mock Server** generado automáticamente por Pact. Durante su ejecución exitosa, Pact **genera automáticamente los contratos en formato JSON** en el directorio `./pacts/`.

> ⚠️ **Importante**: Los archivos de contrato dentro de `./pacts/` **nunca deben editarse a mano**. Son generados y versionados de manera determinista a partir del código de pruebas de los consumidores.

Existen dos formas de ejecutar estas pruebas:

### Opción A: Con los contenedores Docker levantados (`docker compose exec`)
Si el sistema ya fue iniciado con `docker compose up -d`, se pueden disparar las pruebas directamente dentro de los contenedores en ejecución:

```bash
# 1. Ejecutar pruebas en Portal de Usuario (genera contratos 1 y 2)
docker compose exec user-portal npm test

# 2. Ejecutar pruebas en Servicio de Administración (genera contrato 3)
docker compose exec admin npm test
```

### Opción B: En el entorno local de desarrollo
```bash
# 1. Portal de Usuario (genera contratos 1 y 2)
cd user-portal
npm test

# 2. Servicio de Administración (genera contrato 3)
cd ../admin
npm test
```

Ambas opciones ejecutarán Jest y generarán los archivos de contrato en:
- `./pacts/PortalUsuario-ServicioReservas.json`
- `./pacts/ServicioAdministracion-ServicioReservas.json`

---

## 🔍 Cómo Verificar el Servicio de Reservas (Proveedor)

Una vez que los contratos han sido generados por los consumidores en `./pacts/`, el **Servicio de Reservas (Proveedor)** debe validar que su implementación real cumple estrictamente con todas las expectativas pactadas.

### 1. Preparación de Estados del Proveedor (*Provider States*)
Para garantizar pruebas reproducibles y deterministas, el archivo de verificación del proveedor (`reservations/tests/contract/provider.pact.test.js`) configura *state handlers* que inicializan los datos requeridos en memoria antes de cada interacción:
- `el sistema esta preparado para crear una nueva reserva valida`: Reinicia el repositorio para recibir una nueva reserva.
- `el usuario U100 posee una reserva activa`: Inicializa una reserva activa asociada al usuario `U100`.
- `el usuario U200 no posee ninguna reserva`: Asegura que el usuario `U200` no cuente con reservas previas.
- `la reserva R-1001 existe y se encuentra activa`: Registra la reserva `R-1001` con estado `activa`.
- `una determinada reserva no existe`: Limpia el repositorio asegurando que el identificador consultado no exista.

### 2. Ejecutar la verificación del Proveedor

#### Con el contenedor Docker levantado:
```bash
docker compose exec reservations npm run test:pact
```

#### O en el entorno local:
```bash
cd reservations
npm run test:pact   # Solo verificación de contratos Pact
npm test            # Tests unitarios + contratos Pact
```

Pact levantará el servicio real de Express, reproducirá cada petición definida en los archivos JSON de `./pacts`, ejecutará los *state handlers* correspondientes y validará los códigos de estado, encabezados y payloads de respuesta. Se mostrará un reporte detallado con las 6 interacciones verificadas exitosamente.

---

## ⚠️ Principales Dificultades Encontradas durante el Desarrollo

Durante la realización e integración del sistema se presentaron los siguientes desafíos técnicos:

1. **Inversión de perspectiva con Consumer-Driven Contracts (CDC)**:
   - *Dificultad*: A diferencia de las pruebas de integración tradicionales donde el proveedor expone su API y los consumidores se adaptan, en Pact el consumidor impone los requisitos sobre qué datos y formatos necesita.
   - *Solución*: Se diseñaron primero los contratos desde las necesidades reales de `user-portal` y `admin`, definiendo las interacciones exactas antes de implementar o ajustar los endpoints finales en el proveedor.

2. **Gestión determinista de los Estados del Proveedor (*Provider States*)**:
   - *Dificultad*: El proveedor debe responder fielmente ante casos específicos (ej. usuario con reservas vs. sin reservas, reserva existente vs. inexistente). Si las pruebas dependen de una base de datos con estado mutable acumulado, las pruebas fallan o se vuelven intermitentes (*flaky tests*).
   - *Solución*: Se implementaron funciones de reinicio e inserción controlada (`reset`, `insertar`) en `reservationRepository.js` acopladas a los `stateHandlers` en `provider.pact.test.js`, garantizando un estado limpio y aislado por cada interacción evaluada.

3. **Uso adecuado de Matchers flexibles vs. Valores exactos**:
   - *Dificultad*: Acoplar las pruebas a valores rígidos (como IDs autoincrementales exactos) provoca fallos si la lógica del proveedor genera identificadores dinámicos (ej. `R-1001`, `R-1002`).
   - *Solución*: Se emplearon los matchers de Pact (`MatchersV3` como `regex("R-\\d+", "R-1001")`, `like(...)` y `eachLike(...)`), permitiendo verificar la estructura y tipos de datos esperados sin restringir valores no esenciales.

4. **Orquestación de microservicios y contenedorización con Docker**:
   - *Dificultad*: En microservicios distribuidos, los contenedores consumidores requieren conocer la URL del proveedor según el entorno (`localhost` en pruebas locales vs. `http://reservations:3001` dentro de la red Docker bridge). Además, los contenedores fallaban si no disponían de un servidor HTTP activo como punto de entrada (`src/index.js`).
   - *Solución*: Se crearon servidores HTTP dedicados en cada consumidor (`src/index.js`) con soporte de variables de entorno (`RESERVATIONS_SERVICE_URL`, `PORT`), y se añadieron archivos `.dockerignore` para evitar que las carpetas `node_modules` locales del host interfirieran con el build de los contenedores Alpine.

5. **Dependencias y binarios nativos de Pact**:
   - *Dificultad*: Pact utiliza un motor subyacente de alto rendimiento escrito en Rust (`pact-core`), el cual descarga binarios nativos para la arquitectura del sistema operativo.
   - *Solución*: Se unificó el entorno de desarrollo y ejecución de pruebas dentro de contenedores basados en Node 20 / Linux con glibc y compatibilidad de herramientas para garantizar una ejecución fluida de los mock servers y del verificador.

---

## 📁 Estructura del Repositorio

```text
sistema-reservas-de-salas/
├── README.md                     # Documentación completa del proyecto
├── docker-compose.yml            # Orquestación de los 3 microservicios
├── .dockerignore                 # Exclusión de archivos para construcción Docker
├── pacts/                        # Contratos generados automáticamente por Pact
│   ├── PortalUsuario-ServicioReservas.json
│   └── ServicioAdministracion-ServicioReservas.json
├── reservations/                 # Servicio de Reservas (Proveedor)
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js              # Arranque del servidor HTTP (puerto 3001)
│   │   ├── app.js                # Definición de rutas y middleware Express
│   │   ├── reservationService.js # Lógica de negocio y validaciones
│   │   └── reservationRepository.js # Almacenamiento en memoria con soporte de estados
│   └── tests/
│       ├── reservationService.test.js # Pruebas unitarias
│       └── contract/
│           └── provider.pact.test.js  # Verificación Pact del Proveedor
├── user-portal/                  # Portal de Usuario (Consumidor)
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js              # Servidor HTTP para despliegue Docker (puerto 3002)
│   │   └── reservationClient.js  # Cliente HTTP hacia el Servicio de Reservas
│   └── tests/contract/
│       ├── crearReserva.pact.test.js     # Contrato 1: Crear Reserva
│       └── consultarReserva.pact.test.js # Contrato 2: Consultar Reservas
└── admin/                        # Servicio de Administración (Consumidor)
    ├── Dockerfile
    ├── package.json
    ├── src/
    │   ├── index.js              # Servidor HTTP para despliegue Docker (puerto 3003)
    │   └── reservationClient.js  # Cliente HTTP hacia el Servicio de Reservas
    └── tests/contract/
        └── verificarReserva.pact.test.js # Contrato 3: Verificar Reserva
```
