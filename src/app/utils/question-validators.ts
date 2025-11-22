import { Question } from '../models/quiz';

export const MAX_LEN = 255;

export function validateQuestion(q: Question): string[] {
  const errors: string[] = [];
  if (!q) return errors;

  if (!q.text || !q.text.trim()) errors.push('Question text is required.');
  else if (String(q.text).trim().length > MAX_LEN)
    errors.push(`Question text must be at most ${MAX_LEN} characters.`);

  const filledOptions = Array.isArray(q.options)
    ? q.options.map((o) => (o ? String(o).trim() : '')).filter((o) => o.length > 0)
    : [];

  if (filledOptions.length < 2) {
    errors.push('Each question must have at least 2 non-empty options.');
    return errors;
  }

  // validate option lengths
  const rawOptions = Array.isArray(q.options) ? q.options : [];
  rawOptions.forEach((opt, i) => {
    const len = opt ? String(opt).trim().length : 0;
    if (len > MAX_LEN) errors.push(`Option ${i + 1} must be at most ${MAX_LEN} characters.`);
  });

  const correct = q.correctAnswer ? String(q.correctAnswer).trim() : '';
  if (!correct || !filledOptions.includes(correct))
    errors.push('A correct option must be selected from the non-empty options.');

  return errors;
}
