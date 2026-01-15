# Endpoints faltantes sugeridos (basado en `src/services/mockData.ts`)

Este documento lista endpoints que no aparecen en la especificación OpenAPI descargada o que son convenientes de exponer en el backend para cubrir las operaciones implementadas en los mocks (o usadas por la app). Para cada endpoint incluyo: método, path, breve descripción, request body (si aplica) y ejemplo de response JSON. Añade estas rutas en el servicio backend `admin` para que el frontend pueda consumirlos.

---

## 1) Paradas temporales (ParadaTemporal)

Contexto: en `mockData.ts` las paradas temporales están almacenadas dentro de cada `Ruta` en `ruta.paradasTemporales`. La aplicación necesita crear paradas temporales y aprobar/rechazarlas.

Endpoints sugeridos:

- POST /api/rutas/{rutaId}/paradas-temporales
  - Descripción: Crear una nueva parada temporal para una ruta concreta.
  - Path params: `rutaId` (string)
  - Request body (application/json):
    ```json
    {
      "estudianteId": "string",
      "direccion": "string",
      "lat": 4.7123,
      "lng": -74.0612,
      "motivo": "string",
      "creadoPor": "Nombre de quien crea",
      "rolCreador": "conductor | coordinador"
    }
    ```
  - Response 201 Created (application/json) ejemplo:
    ```json
    {
      "success": true,
      "data": {
        "id": "pt-123",
        "estudianteId": "1",
        "direccion": "Calle 123 # 45-67",
        "lat": 4.7123,
        "lng": -74.0612,
        "motivo": "Cambio temporal de domicilio",
        "creadoPor": "María Pérez",
        "rolCreador": "coordinador",
        "createdAt": "2026-01-15T12:34:56Z",
        "expiraAt": "2026-01-16T12:34:56Z",
        "estado": "pendiente"
      }
    }
    ```

- GET /api/rutas/{rutaId}/paradas-temporales
  - Descripción: Listar paradas temporales de una ruta.
  - Response 200:
    ```json
    {
      "success": true,
      "data": []
    }
    ```

- PUT /api/rutas/{rutaId}/paradas-temporales/{paradaId}/approve
  - Descripción: Aprobar una parada temporal. Marcará `estado = 'aprobada'` y actualizará `aprobadoPor` y `fechaAprobacion`. Opcionalmente actualizar la dirección del estudiante y añadirlo a la ruta si no está.
  - Request body:
    ```json
    { "aprobadoPor": "Nombre del aprobador" }
    ```
  - Response 200:
    ```json
    { "success": true, "data": { "approved": true } }
    ```

- PUT /api/rutas/{rutaId}/paradas-temporales/{paradaId}/reject
  - Descripción: Rechazar una parada temporal. Marcará `estado = 'rechazada'` y guardará `aprobadoPor` y `fechaAprobacion`.
  - Request body:
    ```json
    { "aprobadoPor": "Nombre del revisor", "comentario": "Opcional" }
    ```
  - Response 200:
    ```json
    { "success": true, "data": { "rejected": true } }
    ```

Notas de backend:
- Debe validar que la ruta y el estudiante existen.
- Calcular `expiraAt` como `createdAt + 24h` automáticamente.
- Emitir eventos/notifications si la parada requiere notificar al conductor y a los padres.

---

## 2) Posiciones en tiempo real (realtime positions)

Contexto: la UI cuenta con un simulador GPS y un endpoint opcional para obtener posiciones en tiempo real por ruta.

Endpoints sugeridos:

- GET /api/realtime/positions
  - Descripción: Devuelve posiciones actuales (lat/lng/heading/speed/lastUpdate/progress) indexadas por `rutaId`.
  - Response 200 (application/json) ejemplo:
    ```json
    {
      "success": true,
      "data": {
        "ruta-1": { "lat": 4.7110, "lng": -74.0721, "heading": 45, "speed": 35, "lastUpdate": "2 min ago", "progress": 25 },
        "ruta-2": { "lat": 4.6520, "lng": -74.0640, "heading": 120, "speed": 28, "lastUpdate": "1 min ago", "progress": 60 }
      }
    }
    ```

Notas de backend:
- Idealmente este endpoint será alimentado por un servicio de telemetría o MQTT que envíe posiciones; en ausencia de esto, el backend puede exponer posiciones guardadas/estimadas o integrar con el simulador para pruebas.

---

## 3) Aprobación de novedades (si se desea un endpoint separado)

La spec ya expone `PUT /api/novedades/{id}` que puede usarse para aprobar/rechazar una novedad. Opcionalmente proporcionar endpoints más explícitos:

- PUT /api/novedades/{id}/approve
  - Body: `{ "aprobadoPor": "Admin Name", "comentario": "..." }`
  - Response: `{ "success": true, "data": { "estadoAprobacion": "aprobada" } }`

- PUT /api/novedades/{id}/reject
  - Body: `{ "aprobadoPor": "Admin Name", "comentario": "..." }`

---

## 4) Endpoints "CRUD" confirmados en la spec

Estos ya están presentes según la especificación OpenAPI detectada:
- /api/buses (GET, POST, GET/{id}, PUT/{id}, DELETE/{id})
- /api/conductores
- /api/coordinadores
- /api/sedes
- /api/pasajeros (estudiantes)
- /api/rutas
- /api/novedades
- /api/historial-rutas

---

## Cómo implementar en el backend

- Añadir las rutas anteriores en el microservicio admin.
- Respetar los esquemas listados en `src/services/mockData.ts` (ej.: `ParadaTemporal`, `Novedad`, `HistorialRuta`, etc.).
- Implementar validación (existencia de `rutaId`, `estudianteId`) y seguridad (roles: coordinador/administrador para aprobar).
- Añadir tests unitarios (happy path + errores comunes: ruta no encontrada, parada no encontrada, estudiante no encontrado, intento de aprobar ya caducado).

---

Si quieres, puedo:
- Generar un fragmento OpenAPI (YAML) para cada endpoint nuevo listo para pegar en el backend.
- Añadir métodos frontend `apiClient.createParadaTemporal`, `apiClient.approveParadaTemporal`, `apiClient.rejectParadaTemporal` y fallbacks (si quieres que lo haga ahora lo implemento).

Dime si quieres que genere las entradas OpenAPI automáticamente o que implemente los métodos cliente y fallbacks (recomendado para integración completa).
