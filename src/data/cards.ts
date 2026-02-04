import type { Card } from '../types';

export const INITIAL_CARDS: Card[] = [
  {
    id: '1',
    word: 'TELEFONE',
    forbiddenWords: ['LIGAR', 'CELULAR', 'FALAR', 'APARELHO', 'DISCAR'],
    difficulty: 'easy'
  },
  {
    id: '2',
    word: 'BOLA',
    forbiddenWords: ['FUTEBOL', 'REDONDA', 'CHUTAR', 'ESPORTE', 'JOGO'],
    difficulty: 'easy'
  },
  {
    id: '3',
    word: 'ESCOLA',
    forbiddenWords: ['ESTUDAR', 'PROFESSOR', 'ALUNO', 'AULA', 'COLÉGIO'],
    difficulty: 'easy'
  },
  {
    id: '4',
    word: 'PRAIA',
    forbiddenWords: ['MAR', 'AREIA', 'SOL', 'VERÃO', 'ONDAS'],
    difficulty: 'easy'
  },
  {
    id: '5',
    word: 'COMPUTADOR',
    forbiddenWords: ['INTERNET', 'TELA', 'TECLADO', 'MOUSE', 'PC'],
    difficulty: 'medium'
  },
  // Add more cards as needed
];
