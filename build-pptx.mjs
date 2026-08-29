// Genera una presentacion .pptx (Open XML) para los alumnos, sin dependencias externas.
// Empaqueta un ZIP "stored" (sin compresion) valido para PowerPoint.
import { writeFileSync } from "fs";
import { crc32 as zcrc } from "zlib";

// ---------- Contenido de las diapositivas (orientado al alumno) ----------
const TEAL = "16C6AD";
const PURPLE = "610A8B";
const DARK = "0B1220";
const WHITE = "FFFFFF";
const MUTED = "9AA8C2";

// Cada slide: { title, bullets:[], kind }
const slides = [
  {
    kind: "cover",
    title: "AI Business Lab",
    subtitle: "Inteligencia Artificial Aplicada al Negocio",
    foot: "MagnaTic · Think Evolution   |   ChatGPT y Claude (versiones gratuitas)",
  },
  {
    title: "Bienvenido al laboratorio",
    bullets: [
      "16 horas — 2 viernes de 8 horas.",
      "Aprenderas a usar la IA como asistente de trabajo real.",
      "No vienes a memorizar prompts: vienes a pensar con la IA.",
      "Regla de oro: la IA propone, TU decides y verificas.",
    ],
  },
  {
    title: "Que necesitas para empezar",
    bullets: [
      "Cuenta gratuita de ChatGPT (chat.openai.com).",
      "Cuenta gratuita de Claude (claude.ai).",
      "Computadora con navegador actualizado e internet.",
      "Office o Google (Word/Excel/PowerPoint) para practicar.",
      "Un problema real de tu trabajo para el proyecto final.",
    ],
  },
  {
    title: "Que es la IA generativa",
    bullets: [
      "Genera texto, tablas e ideas nuevas a partir de patrones.",
      "ChatGPT y Claude son modelos de lenguaje.",
      "Solo conoce lo que TU escribes en la conversacion.",
      "No es una fuente oficial ni un sistema de registro.",
    ],
  },
  {
    title: "Limites y alucinaciones",
    bullets: [
      "Una 'alucinacion' es contenido que suena real pero es falso.",
      "Puede inventar cifras, citas, leyes y fechas.",
      "El estilo seguro NO garantiza datos correctos.",
      "Toda cifra que sostenga una decision necesita fuente humana.",
    ],
  },
  {
    title: "Privacidad y uso responsable",
    bullets: [
      "No pegues datos confidenciales ni personales reales.",
      "Anonimiza o inventa un caso equivalente.",
      "Revisa sesgos antes de usar un resultado.",
      "Una persona es siempre la responsable final.",
    ],
  },
  {
    title: "Metodologia A.C.T.I.V.A.",
    bullets: [
      "Analizar — entender el problema de negocio.",
      "Contextualizar — dar datos suficientes y permitidos.",
      "Transformar — convertirlo en una solicitud clara.",
      "Iterar — pedir ajustes, no aceptar el primer borrador.",
      "Verificar — comprobar hechos y riesgos.",
      "Aplicar — usar el resultado con responsable humano.",
    ],
  },
  {
    title: "El framework del prompt (5 piezas)",
    bullets: [
      "ROL — quien debe ser la IA.",
      "CONTEXTO — la situacion, sin datos sensibles.",
      "OBJETIVO — que debe lograr exactamente.",
      "FORMATO — como debe verse el resultado.",
      "RESTRICCIONES — que NO debe hacer.",
    ],
  },
  {
    title: "El curso: 9 modulos",
    bullets: [
      "1. Fundamentos de IA generativa.",
      "2. Como hablar con una IA.",
      "3. Ingenieria de prompts.",
      "4. IA + Microsoft Word.",
      "5. IA + Microsoft Excel.",
      "6. IA + Microsoft PowerPoint.",
      "7. Analisis e investigacion.",
      "8. Productividad diaria.",
      "9. Proyecto final.",
    ],
  },
  {
    title: "Viernes 1",
    bullets: [
      "Modulo 1 — Fundamentos de IA generativa.",
      "Modulo 2 — Como hablar con una IA.",
      "Modulo 3 — Ingenieria de prompts (el corazon del curso).",
      "Modulo 4 — IA + Word.",
    ],
  },
  {
    title: "Viernes 2",
    bullets: [
      "Modulo 5 — IA + Excel (siempre validar los numeros).",
      "Modulo 6 — IA + PowerPoint.",
      "Modulo 7 — Analisis e investigacion.",
      "Modulo 8 — Productividad diaria.",
      "Modulo 9 — Proyecto final.",
    ],
  },
  {
    title: "Herramientas del laboratorio",
    bullets: [
      "Modulos — lecciones y retos con explicacion.",
      "Quiz — repaso estilo concurso, contra el reloj.",
      "Prompt Lab — construye y guarda tus prompts.",
      "Comparador — mismo prompt en ChatGPT vs Claude.",
      "Biblioteca — plantillas reutilizables.",
      "Proyecto final — 12 pasos hasta tu ficha.",
    ],
  },
  {
    title: "Comparador: ChatGPT vs Claude",
    bullets: [
      "Usa el MISMO prompt en ambas herramientas.",
      "Puntua cada resultado por utilidad, no por marca.",
      "No hay un ganador universal.",
      "Eliges cual te sirve mas en CADA caso.",
    ],
  },
  {
    title: "Proyecto final",
    bullets: [
      "Elige un problema real de tu trabajo.",
      "Disena el prompt y pruebalo en ChatGPT y Claude.",
      "Compara, refina y VERIFICA el resultado.",
      "Genera tu ficha: problema, solucion y tiempo ahorrado.",
    ],
  },
  {
    title: "Tu progreso se guarda en tu navegador",
    bullets: [
      "El avance vive en el navegador de tu equipo.",
      "Exporta tu avance si vas a cambiar de computadora.",
      "Impórtalo en el otro equipo para continuar.",
      "Insignias y puntos miden tu recorrido, no tu criterio.",
    ],
  },
  {
    kind: "cover",
    title: "A trabajar",
    subtitle: "La IA propone. Tu decides y verificas.",
    foot: "MagnaTic · Think Evolution",
  },
];

// ---------- Utilidades XML ----------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const EMU = 914400; // 1 pulgada
const W = Math.round(13.333 * EMU); // 16:9
const H = Math.round(7.5 * EMU);

function textBody(title, bullets, subtitle, foot, kind) {
  const shapes = [];
  let id = 2;

  if (kind === "cover") {
    // Titulo grande centrado
    shapes.push(shapeText(id++, "Titulo", 0.8, 2.4, 11.7, 1.6, [
      { text: title, sz: 54, b: 1, color: TEAL, align: "ctr" },
    ]));
    shapes.push(shapeText(id++, "Sub", 0.8, 4.0, 11.7, 1.2, [
      { text: subtitle || "", sz: 26, color: WHITE, align: "ctr" },
    ]));
    if (foot) {
      shapes.push(shapeText(id++, "Foot", 0.8, 6.6, 11.7, 0.6, [
        { text: foot, sz: 13, color: MUTED, align: "ctr" },
      ]));
    }
    return shapes.join("");
  }

  // Barra de titulo
  shapes.push(shapeRect(id++, 0, 0, 13.333, 1.35, PURPLE));
  shapes.push(shapeText(id++, "Titulo", 0.7, 0.28, 12, 0.9, [
    { text: title, sz: 30, b: 1, color: WHITE, align: "l" },
  ]));
  // Vinetas
  const paras = (bullets || []).map((b) => ({ text: b, sz: 20, color: WHITE, bullet: true }));
  shapes.push(shapeText(id++, "Cuerpo", 0.9, 1.7, 11.5, 5.3, paras));
  // Pie de marca
  shapes.push(shapeText(id++, "Pie", 0.7, 6.95, 12, 0.4, [
    { text: "AI Business Lab · MagnaTic", sz: 11, color: MUTED, align: "l" },
  ]));
  return shapes.join("");
}

function runXml(r) {
  const props = [`sz="${(r.sz || 18) * 100}"`];
  if (r.b) props.push('b="1"');
  const color = r.color || WHITE;
  return `<a:r><a:rPr lang="es-ES" ${props.join(" ")}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>${esc(r.text)}</a:t></a:r>`;
}

function paraXml(r) {
  const align = r.align ? ` algn="${r.align}"` : "";
  const bu = r.bullet
    ? '<a:buFont typeface="Arial"/><a:buChar char="&#8226;"/>'
    : "<a:buNone/>";
  const marL = r.bullet ? ' marL="285750" indent="-285750"' : "";
  return `<a:p><a:pPr${marL}${align}>${bu}</a:pPr>${runXml(r)}</a:p>`;
}

function shapeText(id, name, xIn, yIn, wIn, hIn, runs) {
  const x = Math.round(xIn * EMU), y = Math.round(yIn * EMU);
  const w = Math.round(wIn * EMU), h = Math.round(hIn * EMU);
  const body = runs.map(paraXml).join("");
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr wrap="square" anchor="t"/><a:lstStyle/>${body}</p:txBody></p:sp>`;
}

function shapeRect(id, xIn, yIn, wIn, hIn, color) {
  const x = Math.round(xIn * EMU), y = Math.round(yIn * EMU);
  const w = Math.round(wIn * EMU), h = Math.round(hIn * EMU);
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Rect"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>`;
}

function slideXml(s) {
  const bg = `<p:bg><p:bgPr><a:solidFill><a:srgbClr val="${DARK}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>`;
  const shapes = textBody(s.title, s.bullets, s.subtitle, s.foot, s.kind);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>${bg}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapes}</p:spTree></p:cSld><p:clrMapOvr><a:overrideClrMapping bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/></p:clrMapOvr></p:sld>`;
}

// ---------- Estructura minima del paquete ----------
const files = {};

files["[Content_Types].xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${slides.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")}</Types>`;

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

// Theme minimo
files["ppt/theme/theme1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="MagnaTic"><a:themeElements><a:clrScheme name="MagnaTic"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="0B1220"/></a:dk2><a:lt2><a:srgbClr val="F1F1F1"/></a:lt2><a:accent1><a:srgbClr val="16C6AD"/></a:accent1><a:accent2><a:srgbClr val="610A8B"/></a:accent2><a:accent3><a:srgbClr val="FFD700"/></a:accent3><a:accent4><a:srgbClr val="79B8FF"/></a:accent4><a:accent5><a:srgbClr val="7EE787"/></a:accent5><a:accent6><a:srgbClr val="F07178"/></a:accent6><a:hlink><a:srgbClr val="16C6AD"/></a:hlink><a:folHlink><a:srgbClr val="610A8B"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Segoe UI"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Segoe UI"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;

// Slide master + layout minimos
files["ppt/slideMasters/slideMaster1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="0B1220"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`;
files["ppt/slideMasters/_rels/slideMaster1.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`;

files["ppt/slideLayouts/slideLayout1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:overrideClrMapping bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/></p:clrMapOvr></p:sldLayout>`;
files["ppt/slideLayouts/_rels/slideLayout1.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`;

// Slides + rels
slides.forEach((s, i) => {
  files[`ppt/slides/slide${i + 1}.xml`] = slideXml(s);
  files[`ppt/slides/_rels/slide${i + 1}.xml.rels`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`;
});

// ---------- Mini ZIP (metodo store, sin compresion) ----------
function dosTime() {
  return { time: 0, date: 0x21 }; // 1980-01-01
}
function makeZip(fileMap) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const { time, date } = dosTime();

  for (const [name, content] of Object.entries(fileMap)) {
    const nameBuf = Buffer.from(name, "utf8");
    const data = Buffer.from(content, "utf8");
    const crc = zcrc(data) >>> 0;
    const size = data.length;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); // store
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    chunks.push(local, nameBuf, data);

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0, 8);
    cen.writeUInt16LE(0, 10);
    cen.writeUInt16LE(time, 12);
    cen.writeUInt16LE(date, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(size, 20);
    cen.writeUInt32LE(size, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt16LE(0, 30);
    cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34);
    cen.writeUInt16LE(0, 36);
    cen.writeUInt32LE(0, 38);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);

    offset += local.length + nameBuf.length + data.length;
  }

  const centralStart = offset;
  let centralSize = 0;
  for (const c of central) centralSize += c.length;

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  const count = Object.keys(fileMap).length;
  end.writeUInt16LE(count, 8);
  end.writeUInt16LE(count, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralStart, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...chunks, ...central, end]);
}

const zip = makeZip(files);
writeFileSync("AI-Business-Lab-Presentacion.pptx", zip);
console.log("PPTX generado: " + zip.length + " bytes, " + slides.length + " diapositivas");
