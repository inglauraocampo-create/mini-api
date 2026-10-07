import type { FastifyPluginAsync } from 'fastify';
import type { PreguntasRepo } from './repo.js';

export type PreguntasRoutesOptions = { repo: PreguntasRepo };

export const preguntasRoutes: FastifyPluginAsync<
  PreguntasRoutesOptions
> = async (app, { repo }) => {
  app.get('/preguntas', async () => repo.list());
};
