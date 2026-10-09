## Prompt

Dame hipotesis ordenadas por probabilidad 

```
✓ src/preguntas/repo.test.ts (1 test) 3ms
 ✓ src/app.test.ts (1 test) 106ms
 ❯ src/preguntas/preguntas.test.ts (14 tests | 2 failed) 208ms
     ✓ con repo vacío responde 200 y [] 106ms
     ✓ con repo sembrado responde 200 y sus preguntas 11ms
     ✓ con '2 opciones y respuestaCorrecta 0' responde 201 y la pregunta creada 11ms
     ✓ con '4 opciones y respuestaCorrecta 3' responde 201 y la pregunta creada 8ms
     ✓ con 'enunciado vacío' responde 400 y no crea nada 8ms
     ✓ con 'enunciado ausente' responde 400 y no crea nada 7ms
     ✓ con '1 opción' responde 400 y no crea nada 8ms
     ✓ con '5 opciones' responde 400 y no crea nada 6ms
     ✓ con 'respuestaCorrecta igual a opciones.le…' responde 400 y no crea nada 7ms
     ✓ con 'respuestaCorrecta negativa' responde 400 y no crea nada 8ms
     ✓ con 'respuestaCorrecta no entera' responde 400 y no crea nada 6ms
     ✓ con 'dificultad inválida' responde 400 y no crea nada 6ms
     × con 'id en el body' responde 400 y no crea nada 10ms
     × con 'propiedad extra' responde 400 y no crea nada 6ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/preguntas/preguntas.test.ts > POST /preguntas > con 'id en el body' responde 400 y no crea nada
 FAIL  src/preguntas/preguntas.test.ts > POST /preguntas > con 'propiedad extra' responde 400 y no crea nada
AssertionError: expected 201 to be 400 // Object.is equality

- Expected
+ Received

- 400
+ 201

 ❯ src/preguntas/preguntas.test.ts:135:28
    133|     });
    134|
    135|     expect(res.statusCode).toBe(400);
       |                            ^
    136|     expect(res.headers['content-type']).toEqual(
    137|       expect.stringMatching(/^application\/json/),
```

## Respuesta

Los dos fallos tienen la misma causa: el schema no rechaza las propiedades extra, sino que las elimina antes de que el handler las vea. La hipótesis 1 ya está confirmada.

**1. Ajv de Fastify elimina las propiedades extra en vez de rechazarlas.** Muy probable, y confirmada.
- **Evidencia:** las opciones por defecto de Ajv en Fastify (`@fastify/ajv-compiler@4.0.6`, `lib/default-ajv-options.js:8`) incluyen `removeAdditional: true`. Con esa opción, `additionalProperties: false` borra los campos extra y la validación pasa. Como [app.ts](src/app.ts) no configura `ajv`, se usa ese valor por defecto.
- **Por qué cuadra con el síntoma:** el body llega al handler sin `id` ni `extra`, cumple todas las reglas y se crea la pregunta. Eso explica el `201` y por qué fallan exactamente los dos casos de propiedades extra, mientras los demás inválidos pasan.
- **Arreglo:** `ajv: { customOptions: { removeAdditional: false } }` en `buildApp`.

**2. Al schema le falta `additionalProperties: false`.** Descartada.
- [schemas.ts:3](src/preguntas/schemas.ts:3) lo tiene.
- Aunque faltara, el resultado sería el mismo `201`, y además el `id` y el `extra` quedarían guardados en el repo.

**3. El schema no se está aplicando a la ruta.** Muy improbable.
- Si no se aplicara, los casos inválidos del schema (`enunciado` vacío, 1 opción, `dificultad` inválida, etc.) también responderían `201`, y en tu salida todos pasan con `400`.

**4. El test está mal armado: el payload no lleva el campo extra, o el `it.each` no recibe la fila.** Muy improbable.
- Los nombres `'id en el body'` y `'propiedad extra'` aparecen en la salida, así que las filas sí se ejecutan.
- El payload se arma con un spread directo (`{ ...base, id: 'impuesto' }`).
- `inject` serializa el objeto a JSON sin quitar campos.

**5. Hay una opción de Ajv en conflicto en otra parte, por ejemplo un `ajv` que llega por `fastifyOptions` en los tests.** Muy improbable.
- Los tests llaman a `buildApp({ repo })` sin opciones de Fastify.
- No hay ninguna referencia a `ajv` en `app.ts`.

Esta es la fase roja esperada: el `201` en vez del `400` es justo lo que la fase verde tiene que corregir, con el cambio de la hipótesis 1.
