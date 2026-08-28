// Motor de puntaje tipo Kahoot.
// Puntos por respuesta correcta = base * (0.5 + 0.5 * fraccionDeTiempoRestante) + bono por racha.
// Una respuesta incorrecta o agotar el tiempo da 0 puntos y rompe la racha.

export const BASE_POINTS = 1000;
export const STREAK_STEP = 100;
export const STREAK_MAX = 500;

export function scoreAnswer({ correct, msRemaining, msTotal, streak }) {
  if (!correct) {
    return { points: 0, streak: 0, correct: false };
  }
  const frac = Math.max(0, Math.min(1, msTotal > 0 ? msRemaining / msTotal : 0));
  const speed = Math.round(BASE_POINTS * (0.5 + 0.5 * frac));
  const newStreak = streak + 1;
  const bonus = Math.min((newStreak - 1) * STREAK_STEP, STREAK_MAX);
  return { points: speed + bonus, streak: newStreak, correct: true };
}

export function maxScore(quiz) {
  // Cota superior teorica: todas correctas al instante con racha creciente.
  let total = 0;
  for (let i = 0; i < quiz.questions.length; i++) {
    const streak = i + 1;
    const bonus = Math.min((streak - 1) * STREAK_STEP, STREAK_MAX);
    total += BASE_POINTS + bonus;
  }
  return total;
}

export function rank(percent) {
  if (percent >= 90) return { label: "Maestro", icon: "🏆", tone: "ok" };
  if (percent >= 70) return { label: "Avanzado", icon: "🚀", tone: "ok" };
  if (percent >= 50) return { label: "En camino", icon: "💪", tone: "warn" };
  return { label: "A repasar", icon: "📚", tone: "hard" };
}
