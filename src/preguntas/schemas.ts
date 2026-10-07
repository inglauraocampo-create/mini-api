export const nuevaPreguntaSchema = {
  type: 'object',
  required: ['enunciado', 'opciones', 'respuestaCorrecta', 'dificultad'],
  properties: {
    enunciado: { type: 'string', minLength: 1 },
    opciones: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 4,
    },
    respuestaCorrecta: { type: 'integer', minimum: 0 },
    dificultad: { type: 'string', enum: ['facil', 'media', 'dificil'] },
  },
} as const;
