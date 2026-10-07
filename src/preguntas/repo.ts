import { randomUUID } from 'node:crypto';
import type { NuevaPregunta, Pregunta } from './types.js';

export interface PreguntasRepo {
  list(): Pregunta[];
  create(input: NuevaPregunta): Pregunta;
}

export function createInMemoryRepo(seed: Pregunta[] = []): PreguntasRepo {
  const preguntas = [...seed];

  return {
    list: () => [...preguntas],
    create: (input) => {
      const pregunta = { id: randomUUID(), ...input };
      preguntas.push(pregunta);
      return pregunta;
    },
  };
}
