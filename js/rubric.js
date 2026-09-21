export function axesAverage(scores = {}) {
  const vals = Object.values(scores);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + Number(b), 0) / vals.length;
}

export function ficheText(fields) {
  const result =
    fields.result ||
    [fields.chatgpt, fields.claude, fields.compare].filter(Boolean).join("\n---\n");
  const rows = [
    ["PROBLEMA", fields.problem],
    ["SOLUCIÓN", fields.solution],
    ["PROMPT", fields.prompt],
    ["RESULTADO", result],
    ["VALIDACIÓN", fields.validation],
    ["TIEMPO ANTES", fields.timeBefore],
    ["TIEMPO DESPUÉS", fields.timeAfter],
    ["AHORRO ESTIMADO", fields.savings],
    ["RIESGOS", fields.risks],
    ["CONTROL HUMANO", fields.humanControl || fields.process],
    ["GUION DE PRESENTACIÓN", fields.presentation],
  ];
  return rows.map(([k, v]) => `${k}\n${v || "—"}`).join("\n\n");
}
