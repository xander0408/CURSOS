import { assemblePrompt } from "./challenge-engine.js";

export function officeCaseById(data, id) {
  return (data.officeCases?.cases || []).find((c) => c.id === id) || null;
}

export function officeCasePatch(c) {
  if (!c) return {};
  const framework = {
    role: c.framework.role,
    context: c.framework.context,
    objective: c.framework.objective,
    format: c.framework.format,
    constraints: c.framework.restrictions,
  };
  return {
    officeCaseId: c.id,
    officeCaseTitle: `Caso ${c.n} · ${c.title}`,
    audience: c.audience,
    problem: c.problem,
    currentTask: c.currentTask,
    timeBefore: c.timeBefore,
    framework,
    prompt: assemblePrompt(framework),
    risks: c.risks,
    process: c.process,
    presentation: c.presentation,
  };
}
