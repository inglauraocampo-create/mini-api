import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { createInMemoryRepo } from './repo.js';
import type { Pregunta } from './types.js';

const preguntas: Pregunta[] = [
  {
    id: 'p1',
    enunciado: '¿Cuánto es 2 + 2?',
    opciones: ['3', '4'],
    respuestaCorrecta: 1,
    dificultad: 'facil',
  },
  {
    id: 'p2',
    enunciado: '¿Qué palabra clave declara una constante en TypeScript?',
    opciones: ['var', 'let', 'const', 'static'],
    respuestaCorrecta: 2,
    dificultad: 'media',
  },
];

describe('GET /preguntas', () => {
  let app: FastifyInstance;

  afterEach(async () => {
    await app.close();
  });

  it('con repo vacío responde 200 y []', async () => {
    app = buildApp({ repo: createInMemoryRepo() });

    const res = await app.inject({ method: 'GET', url: '/preguntas' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('con repo sembrado responde 200 y sus preguntas', async () => {
    app = buildApp({ repo: createInMemoryRepo(preguntas) });

    const res = await app.inject({ method: 'GET', url: '/preguntas' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(preguntas);
  });
});
