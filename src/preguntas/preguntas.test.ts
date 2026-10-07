import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { createInMemoryRepo } from './repo.js';
import type { NuevaPregunta, Pregunta } from './types.js';

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

describe('POST /preguntas', () => {
  let app: FastifyInstance;

  const base: NuevaPregunta = {
    enunciado: '¿Cuál es la capital de Francia?',
    opciones: ['París', 'Roma'],
    respuestaCorrecta: 0,
    dificultad: 'facil',
  };

  function sinCampo(campo: keyof NuevaPregunta): Partial<NuevaPregunta> {
    const copia: Partial<NuevaPregunta> = { ...base };
    delete copia[campo];
    return copia;
  }

  afterEach(async () => {
    await app.close();
  });

  it.each([
    { caso: '2 opciones y respuestaCorrecta 0', payload: base },
    {
      caso: '4 opciones y respuestaCorrecta 3',
      payload: {
        ...base,
        opciones: ['París', 'Roma', 'Madrid', 'Berlín'],
        respuestaCorrecta: 3,
      },
    },
  ])('con $caso responde 201 y la pregunta creada', async ({ payload }) => {
    app = buildApp({ repo: createInMemoryRepo() });

    const res = await app.inject({
      method: 'POST',
      url: '/preguntas',
      payload,
    });

    expect(res.statusCode).toBe(201);
    const creada = res.json();
    expect(creada).toEqual({ id: expect.any(String), ...payload });

    const lista = await app.inject({ method: 'GET', url: '/preguntas' });
    expect(lista.json()).toEqual([creada]);
  });

  it.each([
    { caso: 'enunciado vacío', payload: { ...base, enunciado: '' } },
    { caso: 'enunciado ausente', payload: sinCampo('enunciado') },
    { caso: '1 opción', payload: { ...base, opciones: ['París'] } },
    {
      caso: '5 opciones',
      payload: {
        ...base,
        opciones: ['París', 'Roma', 'Madrid', 'Berlín', 'Lisboa'],
      },
    },
    {
      caso: 'respuestaCorrecta igual a opciones.length',
      payload: { ...base, respuestaCorrecta: base.opciones.length },
    },
    {
      caso: 'respuestaCorrecta negativa',
      payload: { ...base, respuestaCorrecta: -1 },
    },
    {
      caso: 'dificultad inválida',
      payload: { ...base, dificultad: 'imposible' },
    },
  ])('con $caso responde 400 y no crea nada', async ({ payload }) => {
    app = buildApp({ repo: createInMemoryRepo() });

    const res = await app.inject({
      method: 'POST',
      url: '/preguntas',
      payload,
    });

    expect(res.statusCode).toBe(400);

    const lista = await app.inject({ method: 'GET', url: '/preguntas' });
    expect(lista.json()).toEqual([]);
  });
});
