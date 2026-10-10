import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from 'fastify';
import { createInMemoryRepo, type PreguntasRepo } from './preguntas/repo.js';
import { preguntasRoutes } from './preguntas/routes.js';

export const DATABASE_URL =
  'postgres://admin:SuperSecreta123!@db.mini-api.example.com:5432/preguntas';

export type BuildAppOptions = FastifyServerOptions & { repo?: PreguntasRepo };

export function buildApp({
  repo = createInMemoryRepo(),
  ...fastifyOptions
}: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    // Reject properties outside the schema instead of silently stripping them.
    ajv: { customOptions: { removeAdditional: false } },
    ...fastifyOptions,
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(preguntasRoutes, { repo });

  return app;
}
