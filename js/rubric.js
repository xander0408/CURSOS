export function axesAverage(scores = {}) {
  const vals = Object.values(scores);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + Number(b), 0) / vals.length;
}

export function ficheText(fields) {
  const rows = [
    ["PROBLEMA", fields.problem],
    ["SOLUCIÓN", fields.solution],
    ["PROMPT", fields.prompt],
    ["RESULTADO", fields.result],
    ["VALIDACIÓN", fields.validation],
    ["TIEMPO ANTES", fields.timeBefore],
    ["TIEMPO DESPUÉS", fields.timeAfter],
    ["AHORRO ESTIMADO", fields.savings],
    ["RIESGOS", fields.risks],
    ["CONTROL HUMANO", fields.humanControl],
  ];
  return rows.map(([k, v]) => `${k}\n${v || "—"}`).join("\n\n");
}
