import type { Pregunta } from './types.js';

export interface PreguntasRepo {
  list(): Pregunta[];
}

export function createInMemoryRepo(seed: Pregunta[] = []): PreguntasRepo {
  const preguntas = [...seed];

  return {
    list: () => [...preguntas],
  };
}
