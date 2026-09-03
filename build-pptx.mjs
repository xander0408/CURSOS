// Genera una presentacion .pptx extensa para alumnos de nivel basico.
// Con narrativa, analogias y diseno (portada, separadores de seccion, cierres).
// Sin dependencias externas: empaqueta un ZIP "stored" valido para PowerPoint.
import { writeFileSync, readFileSync } from "fs";
import { crc32 as zcrc } from "zlib";

// Marca Magnatic
const TEAL = "16C6AD";
const PURPLE = "610A8B";
const GOLD = "FFD700";
const DARK = "0B1220";
const CARD = "162033";
const WHITE = "FFFFFF";
const MUTED = "9AA8C2";

// Tipos de slide:
//  cover     : portada
//  section   : separador de seccion (numero grande + titulo)
//  bullets    : titulo + vinetas
//  analogy    : titulo + frase de analogia grande + apoyo
//  two        : titulo + dos columnas (izq/der con encabezado)
//  quote      : frase central grande
//  steps      : titulo + lista numerada
//  closing   : cierre
const slides = [
  { kind: "cover", title: "AI Business Lab", subtitle: "Inteligencia Artificial Aplicada al Negocio",
    foot: "16 horas · 2 viernes · cuentas gratuitas", brand: "Magnatic · Think Evolution" },

  { kind: "section", num: "A", title: "Cronograma del curso" },

  { kind: "steps", title: "Viernes 1 (8 horas)", steps: [
      "Apertura y conocernos (20 min): login, ChatGPT y Claude en otra pestana.",
      "Historia de la IA + retos + quiz (incluye ML, deep learning y pioneros).",
      "Fundamentos, como hablar con la IA, prompts y Word.",
      "Cierre: exportar avance y caso de practica (datos ficticios).",
    ] },

  { kind: "steps", title: "Viernes 2 (8 horas)", steps: [
      "Excel (validar numeros) y PowerPoint (estructura, no cifras inventadas).",
      "Analisis, productividad y comparador ChatGPT vs Claude.",
      "Proyecto final: copiar el prompt de tu caso, pegar, verificar, ficha.",
      "Cierre y constancia.",
    ] },

  { kind: "talk", title: "Ronda: conocernos (5 min)", prompt: "Nombre, cargo y UNA tarea que te quita tiempo esta semana.",
    hint: "Sin datos de clientes, montos reales ni nombres de terceros. El instructor conecta con tu caso de practica (ficticio)." },

  { kind: "bullets", title: "Para quien es este curso", lead: "Gerencias que usan correo, Word y Excel.",
    bullets: [
      "No necesitas programar.",
      "Trabajamos con cuentas GRATIS de ChatGPT y Claude.",
      "El laboratorio web ordena la practica; la IA vive en otra pestana.",
      "Los casos son inventados (Planta Norte). No uses datos internos.",
    ] },

  { kind: "section", num: "0", title: "Historia de la IA" },

  { kind: "talk", title: "Antes de fechas: tu imagen", prompt: "Cuando oyes inteligencia artificial, que ves?",
    hint: "Robot, pelicula, Excel magico, ChatGPT. Todas valen. Luego las aterrizamos." },

  { kind: "photo", title: "Linea de tiempo (referencia visual)", image: "ppt-assets/timeline.png" },

  { kind: "bullets", title: "Nacimiento del campo", lead: "No empezo en 2022.",
    bullets: [
      "1950 — Alan Turing: el juego de imitacion (comportamiento).",
      "1956 — Dartmouth: John McCarthy nombra inteligencia artificial.",
      "Tambien: Minsky, Shannon, Newell, Simon, Samuel, Weizenbaum (ELIZA).",
      "Luego inviernos: se prometio demasiado y se corto inversion.",
    ] },

  { kind: "photo", title: "Pioneros (referencia de aula)", image: "ppt-assets/pioneros.png" },

  { kind: "photo", title: "Machine learning vs deep learning", image: "ppt-assets/ml-dl.png" },

  { kind: "two", title: "Tres capas, tres usos",
    leftH: "ML y deep learning", left: ["ML: aprende de ejemplos (fraude, pronostico).", "Deep learning: redes profundas (vision, voz).", "Hinton, LeCun, Bengio; 2012 ImageNet."],
    rightH: "IA generativa", right: ["2017 transformers (Vaswani y equipo).", "2022 chats masivos (ChatGPT, luego Claude y otros).", "Genera texto; no firma ni es tu ERP."] },

  { kind: "photo", title: "Mapa de herramientas actuales", image: "ppt-assets/ias-actuales.png" },

  { kind: "bullets", title: "Que existe hoy (cambia de nombre, no de idea)",
    bullets: [
      "Chats: ChatGPT, Claude, Gemini, Copilot, Grok, Perplexity y similares.",
      "Modelos abiertos: Llama, Mistral y variantes que una empresa puede hospedar.",
      "IA clasica en el negocio: vision de linea, scoring, pronosticos.",
      "Este curso practica dos: ChatGPT Free y Claude Free. El resto se nombra para no confundirlos con el laboratorio.",
    ] },

  { kind: "section", num: "H", title: "Chatbots y versiones" },

  { kind: "bullets", title: "Principales chatbots (mapa, no ranking)",
    lead: "Todos proponen texto. Ninguno firma tu correo.",
    bullets: [
      "ChatGPT (OpenAI): el mas usado en oficina; en clase, cuenta Free.",
      "Claude (Anthropic): util para comparar un entregable; cupo Free limitado.",
      "Gemini (Google): vive cerca de Gmail y Drive si la empresa lo activa.",
      "Copilot (Microsoft): vive cerca de Word, Excel y Teams si hay licencia.",
      "Grok, Perplexity y otros: mismos habitos (contexto, iterar, verificar).",
    ] },

  { kind: "two", title: "ChatGPT: que hay (brujula, no contrato)",
    leftH: "Free (este curso)", left: ["Chat de texto con el modelo gratuito del dia (el que veas en pantalla).", "Archivos e imagenes: tope. No es plan empresa.", "Sirve para volumen de practica: correos, estructuras, iterar."],
    rightH: "Plus / Team / Enterprise", right: ["Plus: mas capacidad y, a veces, un modelo mas capaz. Se paga.", "Team y Enterprise: admin, facturacion y politicas. No las usamos en aula.", "Si tu empresa ya tiene uno, igual: no pegues datos reales aqui."] },

  { kind: "two", title: "Claude: que hay (brujula, no contrato)",
    leftH: "Free (este curso)", left: ["Cupo de creditos (~cada 5 horas). Textos largos gastan mas.", "Sirve para COMPARAR un entregable, no para 80 vueltas.", "Si se acaba: mismo prompt en ChatGPT y sigues."],
    rightH: "Pro / Team / Enterprise", right: ["Pro: mas cupo. Se paga. No es requisito del curso.", "Team y Enterprise: uso de empresa. No las usamos en aula.", "Familia de modelos (Haiku / Sonnet / Opus): mas capaz suele gastar mas."] },

  { kind: "quote", quote: "La IA propone. Tu decides y verificas." },

  { kind: "section", num: "1", title: "Cuentas gratis: hasta donde llegan" },

  { kind: "two", title: "ChatGPT Free vs Claude Free (ago 2026)",
    leftH: "ChatGPT Free", left: ["Texto de chat en el modelo gratuito del dia.", "Archivos e imagenes SI tienen tope.", "No es plan empresa. Gana lo que ves en pantalla."],
    rightH: "Claude Free", right: ["Cupo de creditos cada 5 horas aproximadamente.", "Textos largos y modelos grandes gastan mas.", "Usa Claude para COMPARAR, no para 80 iteraciones." ] },

  { kind: "bullets", title: "Plan de aula si se acaba el cupo", lead: "Nadie se queda parado.",
    bullets: [
      "Sigue en ChatGPT Free con el mismo prompt.",
      "Anota: «Claude pendiente al reiniciar creditos».",
      "No subas Excel pesados ni imagenes si no hace falta.",
      "Nunca pegues contratos, nomina, claves o clientes reales.",
    ] },

  { kind: "section", num: "2", title: "Que es (y que no es) la IA" },

  { kind: "two", title: "Software tradicional vs inteligencia artificial",
    leftH: "Software tradicional", left: ["Reglas que alguien programo.", "Misma entrada, misma salida (si no hay error).", "Ej.: formula de Excel, ERP, un formulario.", "Si el caso no estaba previsto, se detiene o pide a un humano."],
    rightH: "Inteligencia artificial", right: ["Aprende patrones de ejemplos o de texto.", "La misma pregunta puede salir con otra redaccion.", "Ej.: ChatGPT, detector de fraude, vision de linea.", "Puede sonar segura e inventar. Por eso se verifica."] },

  { kind: "steps", title: "Niveles de inteligencia artificial", steps: [
      "Estrecha (la de hoy): una familia de tareas. Un chat, un pronostico, una camara. No cubre todo tu cargo.",
      "General (AGI): nivel humano en casi cualquier trabajo intelectual. No es lo que tienes en Free. No lo prometas en un informe.",
      "Superinteligencia: mas capaz que las personas en casi todo. Es hipotesis, no producto de este aula.",
      "Aqui usamos IA estrecha generativa: texto. Tu decides y verificas.",
    ] },

  { kind: "steps", title: "Cuatro pasos para usar la IA", steps: [
      "Encarga: di la tarea (correo, minuta, estructura de PPT).",
      "Contextualiza: hechos anonimos, tono y formato. Sin nomina ni contratos reales.",
      "Itera: el primer texto es borrador. Pide mas corto, mas formal, sin promesas.",
      "Verifica y aplica: cifras y compromisos los confirma una persona. Luego envias o descartas.",
    ] },

  { kind: "steps", title: "El loop de la IA (se repite)", steps: [
      "Pides con contexto.",
      "La IA propone un borrador.",
      "Tu lees y marcas lo dudoso.",
      "Ajustas el pedido (o el texto a mano) y vuelves a pedir, o cierras.",
      "Verificar no es un extra: es el ultimo giro del loop, siempre.",
    ] },

  { kind: "talk", title: "Puente a A.C.T.I.V.A.", prompt: "Los 4 pasos son el recorte de gerencia. El laboratorio usa seis letras: Analizar, Contextualizar, Transformar, Iterar, Verificar, Aplicar.",
    hint: "Transformar = pedir el borrador. Verificar y Aplicar = tu criterio y tu firma." },

  { kind: "analogy", title: "En palabras simples",
    big: "La IA generativa predice la siguiente palabra.",
    support: "Como cuando tu telefono te sugiere la proxima palabra al escribir, pero mucho mas potente: puede redactar correos, resumir textos y proponer ideas." },

  { kind: "two", title: "Dos tipos de IA",
    leftH: "IA tradicional", left: ["Da una etiqueta o un numero.", "Ej.: detectar fraude, un pronostico.", "Responde: si/no, alto/bajo."],
    rightH: "IA generativa", right: ["Crea texto, tablas e ideas nuevas.", "Ej.: ChatGPT y Claude.", "Responde: un borrador, un resumen."] },

  { kind: "bullets", title: "Que puede hacer por ti", lead: "Suele ayudar mucho con:",
    bullets: [
      "Redactar borradores de correos e informes.",
      "Resumir textos largos que tu le das.",
      "Cambiar el tono: mas formal, mas cercano.",
      "Ordenar ideas y proponer estructuras.",
      "Explicar un concepto en simple.",
    ] },

  { kind: "bullets", title: "Que NO debe hacer sola", lead: "No la uses como fuente unica para:",
    bullets: [
      "Cifras legales, precios o datos oficiales.",
      "Decisiones sensibles (contratar, despedir).",
      "Datos personales de terceros.",
      "Secretos o informacion confidencial de la empresa.",
    ] },

  { kind: "section", num: "3", title: "Sus limites: alucinaciones" },

  { kind: "analogy", title: "El riesgo numero uno",
    big: "A veces inventa con total seguridad.",
    support: "Se llama 'alucinacion': la IA puede darte una ley, una cifra o una cita que suena perfecta... y es falsa. Por eso SIEMPRE se verifica." },

  { kind: "bullets", title: "Como protegerte", lead: "Tres habitos de oro:",
    bullets: [
      "Verifica cifras y datos con una fuente humana o documento oficial.",
      "No pegues datos confidenciales: anonimiza el caso.",
      "Tu eres la persona responsable del resultado final.",
    ] },

  { kind: "quote", quote: "La IA propone. Tu decides y verificas." },

  { kind: "photo", title: "Humano al final", image: "ppt-assets/verificar.png" },

  { kind: "section", num: "G", title: "Agentes (contexto rapido)" },

  { kind: "photo", title: "De que esta hecho un agente", image: "ppt-assets/agentes.png" },

  { kind: "two", title: "Para el alumno (sin volverse ingeniero)",
    leftH: "Que es", left: ["Un agente = rol + objetivo + reglas + (a veces) herramientas.", "Aqui: tutores del laboratorio (Nova, Atlas, Spark...).", "No sustituyen a ChatGPT ni a Claude."],
    rightH: "Como se componen", right: ["Skill: en que es bueno (ej. verificar cifras).", "Limite: no datos internos, no firmar, no inventar leyes.", "Humano: siempre aplica y responde."] },

  { kind: "talk", title: "30 segundos", prompt: "Un agente no es magia: es un encargo con limites. Igual que tu prompt de 5 piezas.",
    hint: "En el portal cada tutor muestra su skill y una recomendacion del momento." },

  { kind: "section", num: "4", title: "Como hablar con la IA" },

  { kind: "analogy", title: "El secreto no es un truco",
    big: "Es darle CONTEXTO.",
    support: "Igual que a un empleado nuevo: si no le cuentas la situacion, el objetivo y el tono, te dara algo generico. Cuanto mejor le explicas, mejor responde." },

  { kind: "bullets", title: "Una conversacion, no un boton", lead: "El primer resultado es un borrador:",
    bullets: [
      "Leelo con ojo critico.",
      "Pide ajustes: 'mas corto', 'mas formal', 'agrega un ejemplo'.",
      "Corrige errores y pide otra version.",
      "Recien entonces, usalo (tras revisarlo).",
    ] },

  { kind: "section", num: "5", title: "El framework de 5 piezas" },

  { kind: "photo", title: "Las 5 piezas de un pedido", image: "ppt-assets/cinco-piezas.png" },

  { kind: "two", title: "La diferencia se nota",
    leftH: "Pedido pobre", left: ["\"Hazme un correo para el cliente\"", "Resultado: generico, sirve de poco."],
    rightH: "Pedido con las 5 piezas", right: ["Rol + contexto + objetivo + formato + limites", "Resultado: util y casi listo para enviar."] },

  { kind: "talk", title: "Tu turno (2 min): dicta las 5 piezas", prompt: "En voz alta, con tu vecino: un correo de retraso SIN datos reales. Dile las 5 piezas.",
    hint: "Cliente Alfa, Planta Norte, 3 dias. Prohibido montos y nombres de personas." },

  { kind: "section", num: "M", title: "Metodologia A.C.T.I.V.A." },

  { kind: "photo", title: "A.C.T.I.V.A. en un vistazo", image: "ppt-assets/activa.png" },

  { kind: "talk", title: "Reto en sala: ordena los 6 pasos", prompt: "Sin mirar el portal: escriban A-C-T-I-V-A en un papel. Luego confirmen en el reto de flechas.",
    hint: "Si las flechas no mueven, recarga con Ctrl+F5. Hay que pulsar Continuar en cada leccion para abrir el siguiente modulo." },

  { kind: "section", num: "C", title: "Casos de aula (Planta Norte)" },

  { kind: "two", title: "Caso 1 — Queja de cliente industrial",
    leftH: "Situacion (ficticia)", left: ["Cliente Alfa: retraso de 3 dias.", "Hay 10% en proxima compra; no hay reembolso.", "No conoces la causa raiz todavia."],
    rightH: "Que hace el alumno", right: ["Copia el prompt del Comparador o del Manual.", "Misma letra en ChatGPT y en Claude.", "Marca en rojo lo que un humano debe autorizar."] },

  { kind: "talk", title: "Practica 8 minutos", prompt: "Mitad de la sala: ChatGPT. Mitad: Claude. Luego 60 segundos: que NO se debe enviar tal cual?",
    hint: "Fechas inventadas, tono de plantilla, el 10% si no esta aprobado, nombres reales." },

  { kind: "two", title: "Caso 2 — Minuta de patio (45 min)",
    leftH: "Notas sucias", left: ["Fila de camiones 2 h.", "Lote retenido por humedad.", "Radio extra el jueves: no se sabe quien paga."],
    rightH: "Criterio", right: ["Decision vs 'se hablo'.", "Responsable = cargo, no persona.", "Si falta dato: «no especificado»."] },

  { kind: "talk", title: "Levanten la mano", prompt: "Quien convirtio un 'se hablo' en un acuerdo cerrado? Eso es el error caro.",
    hint: "Claude suele marcar el hueco. ChatGPT suele dejar el acta 'bonita'. Ninguno es el jefe de patio." },

  { kind: "two", title: "Caso 3 — Excel de juguete",
    leftH: "Encargo", left: ["A = cantidad, B = precio, C = A*B.", "6 filas inventadas.", "Comprobar 3 celdas a mano."],
    rightH: "Participacion", right: ["Un voluntario dicta la formula.", "Otro busca una celda con texto.", "Nadie pega el libro real de la empresa."] },

  { kind: "two", title: "Caso 4 — Ocho minutos a comite",
    leftH: "6 diapositivas", left: ["Hechos / huecos / pedido al comite.", "[CIFRA OFICIAL] donde va un numero.", "Maximo 3 vinetas por slide."],
    rightH: "En sala", right: ["Parejas: una arma estructura, otra el guion.", "3 minutos. Luego 1 pareja presenta 60 s.", "El resto caza una cifra inventada."] },

  { kind: "section", num: "6", title: "IA en tu dia a dia" },

  { kind: "two", title: "Word y Excel",
    leftH: "IA + Word", left: ["Borradores de correos e informes.", "Cambiar el tono del texto.", "Tu revisas datos y confidencialidad."],
    rightH: "IA + Excel", right: ["Explica y crea formulas.", "Detecta errores en formulas.", "SIEMPRE validas el numero."] },

  { kind: "two", title: "PowerPoint y Analisis",
    leftH: "IA + PowerPoint", left: ["De ideas sueltas a una estructura.", "Storytelling y guion del expositor.", "Tu pones los datos reales."],
    rightH: "Analisis e investigacion", right: ["Resume y compara documentos.", "Detecta riesgos y puntos clave.", "Pide fuentes y verificalas."] },

  { kind: "bullets", title: "Productividad diaria", lead: "Tareas repetitivas ideales para la IA:",
    bullets: [
      "Correos profesionales con el tono correcto.",
      "Minutas y seguimiento de acuerdos.",
      "Agendas y planes de trabajo.",
      "Ordenar una decision: pros, contras y riesgos.",
    ] },

  { kind: "section", num: "7", title: "El laboratorio" },

  { kind: "bullets", title: "Tu entorno de practica", lead: "Dentro del laboratorio tienes:",
    bullets: [
      "Ruta: Conocernos, cuentas gratis, Historia y modulos en orden.",
      "Quiz: repaso estilo concurso, contra el reloj.",
      "Prompt Lab: construye y guarda tus prompts.",
      "Comparador: mismo prompt en ChatGPT vs Claude.",
      "Proyecto final: 12 pasos hasta tu ficha.",
    ] },

  { kind: "analogy", title: "ChatGPT vs Claude",
    big: "No hay un ganador universal.",
    support: "ChatGPT suele ir mas directo. Claude suele marcar huecos. Tu eliges en cada caso." },

  { kind: "photo", title: "Mismo prompt, distinta utilidad", image: "ppt-assets/comparar.png" },

  { kind: "two", title: "Que observar (objetivo, no hinchada)",
    leftH: "ChatGPT, en la practica de oficina", left: ["Asunto + cuerpo listos.", "Listas y tablas rapidas.", "Riesgo: plantilla y promesas de mas."],
    rightH: "Claude, en la practica de oficina", right: ["Preguntas de aclaracion.", "«No especificado» en vez de inventar.", "Riesgo: texto largo para un correo corto."] },

  { kind: "talk", title: "Votacion en sala", prompt: "Este caso de queja: quien envia el de ChatGPT? Quien el de Claude? Quien mezcla ambos?",
    hint: "No hay nota. Hay criterio. Guardan la eleccion en el Comparador con un por que de negocio." },

  { kind: "section", num: "8", title: "Tu proyecto final" },

  { kind: "steps", title: "De un problema real a una solucion", steps: [
      "Elige una tarea de tu trabajo que te quita tiempo.",
      "Diseña el prompt con las 5 piezas.",
      "Pruebalo en ChatGPT y en Claude.",
      "Compara, refina y VERIFICA el resultado.",
      "Genera tu ficha con el tiempo que ahorras.",
    ] },

  { kind: "bullets", title: "Como trabajaremos estos 2 viernes", lead: "16 horas: menos teoria suelta, mas casos.",
    bullets: [
      "Viernes 1: conocernos, cuentas, historia, A.C.T.I.V.A., prompts, Word, misiones marcables.",
      "Viernes 2: Excel con chequeo, PPT a comite, comparador con ejemplos reales, proyecto.",
      "Cada bloque: 1 caso Planta Norte + tu cargo (anonimo) + quiz o actividad.",
      "El cronograma detallado lo maneja solo el instructor; tu sigues Ruta y Actividades.",
    ] },

  { kind: "bullets", title: "Reglas del laboratorio", lead: "Para trabajar seguros:",
    bullets: [
      "No pegues datos personales, contraseñas ni contratos reales.",
      "Anonimiza: usa casos equivalentes.",
      "Verifica antes de usar cualquier resultado.",
      "Pregunta cuando tengas dudas: para eso estamos.",
    ] },

  { kind: "talk", title: "Cierre del dia (90 segundos)", prompt: "Dile a tu vecino: que NO vas a pegar nunca en ChatGPT o Claude.",
    hint: "Nomina, contratos, claves, clientes identificables, recetas o precios oficiales no publicados." },

  { kind: "talk", title: "Compromiso (escribir en el chat interno o en papel)", prompt: "Una tarea de tu semana que haras con las 5 piezas el lunes.",
    hint: "Sin datos internos. Si no se te ocurre, usa el caso Alfa / patio / Excel de juguete." },

  { kind: "quote", quote: "Empezamos. La IA no te reemplaza: te potencia." },

  { kind: "closing", title: "A trabajar", subtitle: "Bienvenidos al AI Business Lab", brand: "Magnatic · Think Evolution" },
];

// ---------- Utilidades XML ----------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const EMU = 914400;
const W = Math.round(13.333 * EMU);
const H = Math.round(7.5 * EMU);

function runXml(r) {
  const props = [`sz="${(r.sz || 18) * 100}"`];
  if (r.b) props.push('b="1"');
  if (r.i) props.push('i="1"');
  const color = r.color || WHITE;
  return `<a:r><a:rPr lang="es-ES" ${props.join(" ")}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>${esc(r.text)}</a:t></a:r>`;
}
function paraXml(r) {
  const align = r.align ? ` algn="${r.align}"` : "";
  const bu = r.bullet ? '<a:buFont typeface="Arial"/><a:buChar char="&#8226;"/>'
    : (r.num ? `<a:buFont typeface="+mj-lt"/><a:buAutoNum type="arabicPeriod"/>` : "<a:buNone/>");
  const marL = (r.bullet || r.num) ? ' marL="342900" indent="-342900"' : "";
  const spc = r.spcAfter != null ? `<a:spcAft><a:spcPts val="${r.spcAfter}"/></a:spcAft>` : "";
  return `<a:p><a:pPr${marL}${align}>${spc}${bu}</a:pPr>${runXml(r)}</a:p>`;
}
function sp(id, name, xIn, yIn, wIn, hIn, runs, { anchor = "t", fill = null, geom = "rect", round = false } = {}) {
  const x = Math.round(xIn * EMU), y = Math.round(yIn * EMU);
  const w = Math.round(wIn * EMU), h = Math.round(hIn * EMU);
  const body = runs.map(paraXml).join("");
  const fillXml = fill ? `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>` : "";
  const prst = round ? "roundRect" : geom;
  const ln = fill ? '<a:ln><a:noFill/></a:ln>' : "";
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="${prst}"><a:avLst/></a:prstGeom>${fillXml}${ln}</p:spPr><p:txBody><a:bodyPr wrap="square" anchor="${anchor}"><a:normAutofit/></a:bodyPr><a:lstStyle/>${body}</p:txBody></p:sp>`;
}
function picXml(id, rId, xIn, yIn, wIn, hIn) {
  const x = Math.round(xIn * EMU), y = Math.round(yIn * EMU);
  const w = Math.round(wIn * EMU), h = Math.round(hIn * EMU);
  return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="Picture ${id}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
}

function shapesFor(s) {
  const out = [];
  let id = 2;
  const bar = () => { out.push(sp(id++, "bar", 0, 0, 13.333, 0.22, [{ text: "" }], { fill: TEAL })); };
  const footer = (t) => out.push(sp(id++, "ft", 0.6, 7.0, 12.1, 0.4, [{ text: t || "AI Business Lab · Magnatic", sz: 10, color: MUTED }]));

  if (s.kind === "cover" || s.kind === "closing") {
    out.push(sp(id++, "brandtop", 0, 0.7, 13.333, 0.5, [{ text: s.brand || "Magnatic · Think Evolution", sz: 14, b: 1, color: TEAL, align: "ctr" }]));
    out.push(sp(id++, "title", 0.8, 2.6, 11.7, 1.7, [{ text: s.title, sz: s.kind === "cover" ? 60 : 50, b: 1, color: WHITE, align: "ctr" }]));
    out.push(sp(id++, "sub", 0.8, 4.4, 11.7, 1.2, [{ text: s.subtitle || "", sz: 24, color: TEAL, align: "ctr" }]));
    if (s.foot) out.push(sp(id++, "foot", 0.8, 6.4, 11.7, 0.6, [{ text: s.foot, sz: 14, color: MUTED, align: "ctr" }]));
    // Barras decorativas
    out.push(sp(id++, "d1", 0, 6.9, 13.333, 0.12, [{ text: "" }], { fill: PURPLE }));
    out.push(sp(id++, "d2", 0, 7.02, 13.333, 0.06, [{ text: "" }], { fill: GOLD }));
    return out.join("");
  }

  if (s.kind === "section") {
    out.push(sp(id++, "secbg", 0, 2.2, 13.333, 3.1, [{ text: "" }], { fill: PURPLE }));
    out.push(sp(id++, "num", 0.9, 2.35, 3, 2.8, [{ text: s.num, sz: 130, b: 1, color: GOLD, align: "l" }], { anchor: "ctr" }));
    out.push(sp(id++, "sect", 3.8, 2.35, 8.7, 2.8, [{ text: s.title, sz: 40, b: 1, color: WHITE, align: "l" }], { anchor: "ctr" }));
    footer();
    return out.join("");
  }

  if (s.kind === "quote") {
    out.push(sp(id++, "q", 1.2, 2.6, 10.9, 2.3, [{ text: "\u201C" + s.quote + "\u201D", sz: 40, b: 1, color: TEAL, align: "ctr" }], { anchor: "ctr" }));
    out.push(sp(id++, "d", 5.4, 5.2, 2.5, 0.08, [{ text: "" }], { fill: GOLD }));
    footer();
    return out.join("");
  }

  // Slides con barra superior + titulo
  bar();
  out.push(sp(id++, "title", 0.7, 0.5, 12, 1.0, [{ text: s.title, sz: 32, b: 1, color: WHITE }]));

  if (s.kind === "photo") {
    out.push(picXml(id++, "rId2", 0.75, 1.55, 11.8, 5.15));
    footer();
    return out.join("");
  }

  if (s.kind === "bullets") {
    if (s.lead) out.push(sp(id++, "lead", 0.7, 1.55, 12, 0.6, [{ text: s.lead, sz: 20, i: 1, color: TEAL }]));
    const runs = s.bullets.map((b) => ({ text: b, sz: 20, color: WHITE, bullet: true, spcAfter: 600 }));
    out.push(sp(id++, "body", 0.9, 2.25, 11.5, 4.4, runs));
  } else if (s.kind === "analogy") {
    out.push(sp(id++, "big", 0.9, 1.9, 11.5, 2.0, [{ text: s.big, sz: 34, b: 1, color: GOLD }], { anchor: "ctr" }));
    out.push(sp(id++, "sup", 0.9, 4.1, 11.5, 2.4, [{ text: s.support, sz: 20, color: WHITE }]));
  } else if (s.kind === "steps") {
    const runs = s.steps.map((t) => ({ text: t, sz: 20, color: WHITE, num: true, spcAfter: 700 }));
    out.push(sp(id++, "body", 0.9, 1.9, 11.5, 4.7, runs));
  } else if (s.kind === "two") {
    out.push(sp(id++, "lc", 0.7, 1.8, 5.85, 4.7, [], { fill: CARD, round: true }));
    out.push(sp(id++, "rc", 6.8, 1.8, 5.85, 4.7, [], { fill: CARD, round: true }));
    out.push(sp(id++, "lh", 1.0, 2.05, 5.3, 0.7, [{ text: s.leftH, sz: 22, b: 1, color: TEAL }]));
    out.push(sp(id++, "rh", 7.1, 2.05, 5.3, 0.7, [{ text: s.rightH, sz: 22, b: 1, color: GOLD }]));
    out.push(sp(id++, "lb", 1.0, 2.85, 5.3, 3.4, s.left.map((t) => ({ text: t, sz: 17, color: WHITE, bullet: true, spcAfter: 500 }))));
    out.push(sp(id++, "rb", 7.1, 2.85, 5.3, 3.4, s.right.map((t) => ({ text: t, sz: 17, color: WHITE, bullet: true, spcAfter: 500 }))));
  } else if (s.kind === "talk") {
    out.push(sp(id++, "pr", 0.8, 1.8, 11.7, 2.6, [{ text: s.prompt, sz: 28, b: 1, color: GOLD, align: "ctr" }], { anchor: "ctr" }));
    out.push(sp(id++, "hi", 0.9, 4.6, 11.5, 1.8, [{ text: s.hint || "", sz: 18, color: WHITE, align: "ctr" }]));
  } else if (s.kind === "timeline") {
    const runs = (s.items || []).map((t) => ({ text: t, sz: 16, color: WHITE, bullet: true, spcAfter: 280 }));
    out.push(sp(id++, "body", 0.8, 1.7, 11.7, 5.0, runs));
  }
  footer();
  return out.join("");
}

function slideXml(s) {
  const bg = `<p:bg><p:bgPr><a:solidFill><a:srgbClr val="${DARK}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>`;
  const trans = `<p:transition spd="med" advClick="1"><p:fade/></p:transition>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>${bg}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapesFor(s)}</p:spTree></p:cSld>${trans}</p:sld>`;
}

// ---------- Estructura del paquete ----------
const files = {};
files["[Content_Types].xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${slides.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")}</Types>`;
files["_rels/.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`;
const sldIdList = slides.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("");
files["ppt/presentation.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${sldIdList}</p:sldIdLst><p:sldSz cx="${W}" cy="${H}" type="screen16x9"/><p:notesSz cx="${H}" cy="${W}"/></p:presentation>`;
const presRels = [
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`,
  ...slides.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`),
  `<Relationship Id="rId${slides.length + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>`,
].join("");
files["ppt/_rels/presentation.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${presRels}</Relationships>`;
files["ppt/theme/theme1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Magnatic"><a:themeElements><a:clrScheme name="Magnatic"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="0B1220"/></a:dk2><a:lt2><a:srgbClr val="F1F1F1"/></a:lt2><a:accent1><a:srgbClr val="16C6AD"/></a:accent1><a:accent2><a:srgbClr val="610A8B"/></a:accent2><a:accent3><a:srgbClr val="FFD700"/></a:accent3><a:accent4><a:srgbClr val="79B8FF"/></a:accent4><a:accent5><a:srgbClr val="7EE787"/></a:accent5><a:accent6><a:srgbClr val="F07178"/></a:accent6><a:hlink><a:srgbClr val="16C6AD"/></a:hlink><a:folHlink><a:srgbClr val="610A8B"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Segoe UI"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Segoe UI"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
files["ppt/slideMasters/slideMaster1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="0B1220"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`;
files["ppt/slideMasters/_rels/slideMaster1.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`;
files["ppt/slideLayouts/slideLayout1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
files["ppt/slideLayouts/_rels/slideLayout1.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`;
slides.forEach((s, i) => {
  files[`ppt/slides/slide${i + 1}.xml`] = slideXml(s);
  const imgRel = s.image
    ? `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/img${i + 1}.png"/>`
    : "";
  files[`ppt/slides/_rels/slide${i + 1}.xml.rels`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>${imgRel}</Relationships>`;
  if (s.image) files[`ppt/media/img${i + 1}.png`] = readFileSync(s.image);
});

// ---------- Mini ZIP (store) ----------
function makeZip(fileMap) {
  const chunks = [], central = [];
  let offset = 0; const time = 0, date = 0x21;
  for (const [name, content] of Object.entries(fileMap)) {
    const nameBuf = Buffer.from(name, "utf8");
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    const crc = zcrc(data) >>> 0; const size = data.length;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); local.writeUInt16LE(time, 10); local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(size, 18); local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, data);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0, 8); cen.writeUInt16LE(0, 10); cen.writeUInt16LE(time, 12); cen.writeUInt16LE(date, 14);
    cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(size, 20); cen.writeUInt32LE(size, 24);
    cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt16LE(0, 30); cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34); cen.writeUInt16LE(0, 36); cen.writeUInt32LE(0, 38); cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);
    offset += local.length + nameBuf.length + data.length;
  }
  const centralStart = offset; let centralSize = 0; for (const c of central) centralSize += c.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  const count = Object.keys(fileMap).length;
  end.writeUInt16LE(count, 8); end.writeUInt16LE(count, 10);
  end.writeUInt32LE(centralSize, 12); end.writeUInt32LE(centralStart, 16); end.writeUInt16LE(0, 20);
  return Buffer.concat([...chunks, ...central, end]);
}

const zip = makeZip(files);
writeFileSync("AI-Business-Lab-Presentacion.pptx", zip);
console.log("PPTX generado: " + zip.length + " bytes, " + slides.length + " diapositivas");
