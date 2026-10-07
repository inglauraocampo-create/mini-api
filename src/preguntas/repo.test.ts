import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from './repo.js';
import type { NuevaPregunta } from './types.js';

describe('createInMemoryRepo', () => {
  it('create asigna un id generado aunque el input traiga uno', () => {
    const repo = createInMemoryRepo();
    const input = {
      id: 'impuesto',
      enunciado: '¿Cuánto es 2 + 2?',
      opciones: ['3', '4'],
      respuestaCorrecta: 1,
      dificultad: 'facil',
    } as NuevaPregunta;

    const creada = repo.create(input);

    expect(creada.id).toEqual(expect.any(String));
    expect(creada.id).not.toBe('impuesto');
    expect(repo.list()).toEqual([creada]);
  });
});
