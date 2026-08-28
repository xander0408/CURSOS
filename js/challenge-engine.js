function normalize(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function evaluate(challenge, payload) {
  const type = challenge.type;
  if (type === "mcq") {
    const ok = payload.selected === challenge.correctIndex;
    return { ok, score: ok ? 100 : 0, reveal: true };
  }
  if (type === "tf") {
    const ok = payload.selected === challenge.correct;
    return { ok, score: ok ? 100 : 0, reveal: true };
  }
  if (type === "order") {
    const ok = JSON.stringify(payload.order) === JSON.stringify(challenge.correctOrder);
    return { ok, score: ok ? 100 : 0, reveal: true };
  }
  if (type === "fill") {
    const answers = challenge.accepted || [challenge.correctAnswer];
    const ok = answers.some((a) => normalize(a) === normalize(payload.text));
    return { ok, score: ok ? 100 : 0, reveal: true };
  }
  if (type === "detect-error") {
    const picked = new Set(payload.selectedIds || []);
    const right = new Set(challenge.errorIds || []);
    let hits = 0;
    right.forEach((id) => {
      if (picked.has(id)) hits += 1;
    });
    const extra = [...picked].filter((id) => !right.has(id)).length;
    const score = Math.max(0, Math.round(((hits - extra * 0.5) / Math.max(right.size, 1)) * 100));
    const ok = hits === right.size && extra === 0;
    return { ok, score, reveal: true };
  }
  if (type === "prompt-build" || type === "case" || type === "evaluate-ai" || type === "compare") {
    const filled = payload.complete ? 100 : 70;
    return { ok: true, score: filled, reveal: true, criterion: true };
  }
  return { ok: false, score: 0, reveal: true };
}

export function xpFor(challenge, result, attemptsBefore) {
  const base = challenge.xp || 10;
  if (result.criterion) return attemptsBefore === 0 ? base : Math.round(base * 0.7);
  if (!result.ok) return 0;
  if (attemptsBefore === 0) return base;
  return Math.round(base * 0.6);
}

export function assemblePrompt(parts) {
  const { role, context, objective, format, constraints } = parts;
  return [
    role ? `Rol: ${role}` : "",
    context ? `Contexto: ${context}` : "",
    objective ? `Objetivo: ${objective}` : "",
    format ? `Formato: ${format}` : "",
    constraints ? `Restricciones: ${constraints}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
