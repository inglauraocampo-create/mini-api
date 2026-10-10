import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import type { PreguntasRepo } from './repo.js';
import { nuevaPreguntaSchema } from './schemas.js';
import type { NuevaPregunta } from './types.js';

export type PreguntasRoutesOptions = { repo: PreguntasRepo };

type ConId = { Params: { id: string } };

// Same body shape as Fastify's own validation errors.
const solicitudInvalida = (reply: FastifyReply, message: string) =>
  reply.code(400).send({ statusCode: 400, error: 'Bad Request', message });

const noEncontrada = (reply: FastifyReply) =>
  reply.code(404).send({
    statusCode: 404,
    error: 'Not Found',
    message: 'Pregunta no encontrada',
  });

export const preguntasRoutes: FastifyPluginAsync<
  PreguntasRoutesOptions
> = async (app, { repo }) => {
  app.get('/preguntas', async () => repo.list());

  app.get<ConId>('/preguntas/:id', async (request, reply) => {
    const pregunta = repo.getById(request.params.id);
    return pregunta ?? noEncontrada(reply);
  });

  app.delete<ConId>('/preguntas/:id', async (request, reply) => {
    if (!repo.delete(request.params.id)) return noEncontrada(reply);
    return reply.code(204).send();
  });

  app.post<{ Body: NuevaPregunta }>(
    '/preguntas',
    { schema: { body: nuevaPreguntaSchema } },
    async (request, reply) => {
      const nueva = request.body;

      if (nueva.respuestaCorrecta >= nueva.opciones.length) {
        return solicitudInvalida(
          reply,
          'respuestaCorrecta debe ser menor que opciones.length',
        );
      }

      return reply.code(201).send(repo.create(nueva));
    },
  );
};
