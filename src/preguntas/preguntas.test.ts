import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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

const listar = (app: FastifyInstance) =>
  app.inject({ method: 'GET', url: '/preguntas' });

const crear = (app: FastifyInstance, payload: object) =>
  app.inject({ method: 'POST', url: '/preguntas', payload });

const obtener = (app: FastifyInstance, id: string) =>
  app.inject({ method: 'GET', url: `/preguntas/${id}` });

describe('GET /preguntas', () => {
  let app: FastifyInstance;

  afterEach(async () => {
    await app.close();
  });

  it('con repo vacío responde 200 y []', async () => {
    app = buildApp({ repo: createInMemoryRepo() });

    const res = await listar(app);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('con repo sembrado responde 200 y sus preguntas', async () => {
    app = buildApp({ repo: createInMemoryRepo(preguntas) });

    const res = await listar(app);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(preguntas);
  });
});

describe('GET /preguntas/:id', () => {
  let app: FastifyInstance;

  afterEach(async () => {
    await app.close();
  });

  it('con un id sembrado responde 200 y esa pregunta', async () => {
    app = buildApp({ repo: createInMemoryRepo(preguntas) });

    const res = await obtener(app, 'p2');

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(preguntas[1]);
  });

  it('con el id de una pregunta creada responde 200 y esa pregunta', async () => {
    app = buildApp({ repo: createInMemoryRepo() });
    const creada = (
      await crear(app, {
        enunciado: '¿Cuál es la capital de Francia?',
        opciones: ['París', 'Roma'],
        respuestaCorrecta: 0,
        dificultad: 'facil',
      })
    ).json();

    const res = await obtener(app, creada.id);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(creada);
  });

  it('con un id inexistente responde 404', async () => {
    app = buildApp({ repo: createInMemoryRepo(preguntas) });

    const res = await obtener(app, 'no-existe');

    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toEqual(
      expect.stringMatching(/^application\/json/),
    );
    expect(res.json()).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      message: expect.any(String),
    });
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

  beforeEach(() => {
    app = buildApp({ repo: createInMemoryRepo() });
  });

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
    const res = await crear(app, payload);

    expect(res.statusCode).toBe(201);
    const creada = res.json();
    expect(creada).toEqual({ id: expect.any(String), ...payload });

    const lista = await listar(app);
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
      caso: 'respuestaCorrecta no entera',
      payload: { ...base, respuestaCorrecta: 0.5 },
    },
    {
      caso: 'dificultad inválida',
      payload: { ...base, dificultad: 'imposible' },
    },
    { caso: 'id en el body', payload: { ...base, id: 'impuesto' } },
    { caso: 'propiedad extra', payload: { ...base, extra: 'no permitida' } },
  ])('con $caso responde 400 y no crea nada', async ({ payload }) => {
    const res = await crear(app, payload);

    expect(res.statusCode).toBe(400);
    expect(res.headers['content-type']).toEqual(
      expect.stringMatching(/^application\/json/),
    );
    expect(res.json()).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.any(String),
    });

    const lista = await listar(app);
    expect(lista.json()).toEqual([]);
  });
});
