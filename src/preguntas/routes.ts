import type { FastifyPluginAsync } from 'fastify';
import type { PreguntasRepo } from './repo.js';
import { nuevaPreguntaSchema } from './schemas.js';
import type { NuevaPregunta } from './types.js';

export type PreguntasRoutesOptions = { repo: PreguntasRepo };

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
