import { publicUrl } from "./paths.js";

async function getJson(path) {
  const res = await fetch(publicUrl(path));
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
}

let cache = null;

export async function loadAll() {
  if (cache) return cache;
  const course = await getJson("content/course.json");
  const badges = await getJson("content/badges.json");
  const comparator = await getJson("content/comparator-cases.json");
  const library = await getJson("content/prompt-library.json");
  const instructor = await getJson("content/instructor-notes.json");
  const quizzesData = await getJson("content/quizzes.json");
  const agentsData = await getJson("content/agents.json");
  const tasksData = await getJson("content/tasks.json");
  const freeAccounts = await getJson("content/free-accounts.json");
  const promptManual = await getJson("content/prompt-manual.json");
  const roster = await getJson("content/students.json");
  const activities = await getJson("content/activities.json");
  const schedule = await getJson("content/schedule.json");
  const modules = {};
  for (const m of course.modules) {
    modules[m.id] = await getJson(`content/modules/${m.id}.json`);
  }
  cache = {
    course,
    badges,
    comparator,
    library,
    instructor,
    modules,
    quizzes: quizzesData.quizzes,
    agents: agentsData.agents,
    tasks: tasksData.items,
    tasksIntro: tasksData.intro,
    freeAccounts,
    promptManual,
    roster,
    activities,
    schedule,
  };
  return cache;
}

export function allChallenges(data) {
  const list = [];
  for (const m of data.course.modules) {
    const full = data.modules[m.id];
    for (const ch of full.challenges || []) {
      list.push({ ...ch, moduleId: m.id, moduleTitle: m.title });
    }
  }
  return list;
}
