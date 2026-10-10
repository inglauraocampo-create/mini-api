import { randomUUID } from 'node:crypto';
import type { NuevaPregunta, Pregunta } from './types.js';

export interface PreguntasRepo {
  list(): Pregunta[];
  getById(id: string): Pregunta | undefined;
  create(input: NuevaPregunta): Pregunta;
  delete(id: string): boolean;
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
    delete: (id) => {
      const indice = preguntas.findIndex((pregunta) => pregunta.id === id);
      if (indice === -1) return false;
      preguntas.splice(indice, 1);
      return true;
    },
  };
}
