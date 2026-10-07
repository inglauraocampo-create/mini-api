import type { FastifyPluginAsync } from 'fastify';
import type { PreguntasRepo } from './repo.js';
import type { NuevaPregunta } from './types.js';

export type PreguntasRoutesOptions = { repo: PreguntasRepo };

const nuevaPreguntaSchema = {
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

export const preguntasRoutes: FastifyPluginAsync<
  PreguntasRoutesOptions
> = async (app, { repo }) => {
  app.get('/preguntas', async () => repo.list());

  app.post<{ Body: NuevaPregunta }>(
    '/preguntas',
    { schema: { body: nuevaPreguntaSchema } },
    async (request, reply) => {
      const nueva = request.body;

      if (nueva.respuestaCorrecta >= nueva.opciones.length) {
        return reply.code(400).send();
      }

      return reply.code(201).send(repo.create(nueva));
    },
  );
};
