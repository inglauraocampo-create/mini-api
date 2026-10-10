import { randomUUID } from 'node:crypto';
import type { NuevaPregunta, Pregunta } from './types.js';

export interface PreguntasRepo {
  list(): Pregunta[];
  getById(id: string): Pregunta | undefined;
  create(input: NuevaPregunta): Pregunta;
}

export function createInMemoryRepo(seed: Pregunta[] = []): PreguntasRepo {
  const preguntas = [...seed];

  return {
    list: () => [...preguntas],
    getById: (id) => preguntas.find((pregunta) => pregunta.id === id),
    create: (input) => {
      const pregunta = { ...input, id: randomUUID() };
      preguntas.push(pregunta);
      return pregunta;
    },
  };
}
