export type Pregunta = {
  id: string;
  enunciado: string;
  opciones: string[]; // 2 a 4
  respuestaCorrecta: number; // índice dentro de opciones
  dificultad: 'facil' | 'media' | 'dificil';
};
