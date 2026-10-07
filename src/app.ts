import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from 'fastify';
import { createInMemoryRepo, type PreguntasRepo } from './preguntas/repo.js';
import { preguntasRoutes } from './preguntas/routes.js';

export type BuildAppOptions = FastifyServerOptions & { repo?: PreguntasRepo };

export function buildApp({
  repo = createInMemoryRepo(),
  ...fastifyOptions
}: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify(fastifyOptions);

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(preguntasRoutes, { repo });

  return app;
}
