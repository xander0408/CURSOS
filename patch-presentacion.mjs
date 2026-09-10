/**
 * Parchea AI-Business-Lab-Presentacion.pptx sin reescribir el texto existente:
 * logo Magnatic en lugar del avatar, paleta magna-tic.com, slides de casos al final.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { crc32 as zcrc } from "zlib";

const ROOT = process.cwd();
const SRC = join(ROOT, "AI-Business-Lab-Presentacion.pptx");
const WORK = join(ROOT, "pptx-work");
const LOGO = join(ROOT, "avatares", "magnatic-perfil-vertical.png");

const CASES = [
  {
    file: "ppt-assets/caso-prompt.png",
    kicker: "CASO · PROMPT",
    title: "Cinco piezas, un pedido",
    bullets: [
      "Rol, contexto, objetivo, formato y restricciones.",
      "El mismo texto en ChatGPT y en Claude.",
      "Si falta un dato, se marca [COMPLETAR], no se inventa.",
    ],
  },
  {
    file: "ppt-assets/caso-correo.png",
    kicker: "CASO · WORD / CORREO",
    title: "Cliente Alfa: retraso de 3 días",
    bullets: [
      "Borrador de correo con 10% en la próxima compra.",
      "Sin causa inventada ni fecha de llegada.",
      "Un humano marca en rojo lo que se puede enviar.",
    ],
  },
  {
    file: "ppt-assets/caso-minuta.png",
    kicker: "CASO · MINUTA",
    title: "Reunión de patio, 45 minutos",
    bullets: [
      "Notas sucias: fila de camiones, lote húmedo, radio extra.",
      "Separar decisiones de lo que solo «se habló».",
      "Si no hay responsable: no especificado.",
    ],
  },
  {
    file: "ppt-assets/caso-excel.png",
    kicker: "CASO · EXCEL",
    title: "Cantidad × precio, 6 filas",
    bullets: [
      "Pedir la fórmula y cómo copiarla hacia abajo.",
      "Comprobar 3 celdas a mano.",
      "La IA no vio el archivo: el número lo valida operaciones.",
    ],
  },
  {
    file: "ppt-assets/caso-ppt.png",
    kicker: "CASO · POWERPOINT",
    title: "Ocho minutos ante comité",
    bullets: [
      "Estructura de 6 diapositivas y una línea de guion.",
      "Cifras solo como [CIFRA OFICIAL].",
      "Descartar 2 ideas flojas antes de armar el PPT.",
    ],
  },
  {
    file: "ppt-assets/caso-verificar.png",
    kicker: "CASO · VERIFICAR",
    title: "La norma que no existe",
    bullets: [
      "Pedido trampa: ISO 99887-Z, artículo 4.",
      "Si suena segura y no existe: alucinación.",
      "Nada se envía sin fuente humana.",
    ],
  },
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function makeZip(fileMap) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const time = 0;
  const date = 0x21;
  for (const [name, content] of Object.entries(fileMap)) {
    const nameBuf = Buffer.from(name.replace(/\\/g, "/"), "utf8");
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    const crc = zcrc(data) >>> 0;
    const size = data.length;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    chunks.push(local, nameBuf, data);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(size, 20);
    cen.writeUInt32LE(size, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);
    offset += 30 + nameBuf.length + size;
  }
  const centralStart = offset;
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  const n = Object.keys(fileMap).length;
  end.writeUInt16LE(n, 8);
  end.writeUInt16LE(n, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(centralStart, 16);
  return Buffer.concat([...chunks, centralBuf, end]);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function bulletsXml(items) {
  return items
    .map(
      (t) => `<a:p><a:pPr algn="l"><a:lnSpc><a:spcPct val="130000"/></a:lnSpc><a:spcAft><a:spcPts val="500"/></a:spcAft></a:pPr>
<a:r><a:rPr sz="1300" b="1"><a:solidFill><a:srgbClr val="16C6AD"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>•</a:t></a:r>
<a:r><a:rPr sz="1300"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>  ${esc(t)}</a:t></a:r></a:p>`
    )
    .join("");
}

function caseSlideXml({ kicker, title, bullets, page, total }) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
<p:sp><p:nvSpPr><p:cNvPr id="2" name="bg"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12191695" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="1A0F2E"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="3" name="bar"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12191695" cy="54864"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="16C6AD"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>
<p:pic><p:nvPicPr><p:cNvPr id="4" name="logo" descr="Magnatic"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId3"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="411480" y="164592"/><a:ext cx="640080" cy="365760"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>
<p:sp><p:nvSpPr><p:cNvPr id="5" name="kicker"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="1143000" y="256032"/><a:ext cx="10058400" cy="274320"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr sz="1100" b="1"><a:solidFill><a:srgbClr val="16C6AD"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>${esc(kicker)}</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="6" name="title"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="502920" y="548640"/><a:ext cx="11125200" cy="548640"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr sz="2600" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>${esc(title)}</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="7" name="card"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="457200" y="1280160"/><a:ext cx="5669280" cy="4663440"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 5000"/></a:avLst></a:prstGeom><a:solidFill><a:srgbClr val="221536"/></a:solidFill><a:ln w="9525"><a:solidFill><a:srgbClr val="610A8B"/></a:solidFill></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="8" name="bullets"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="1463040"/><a:ext cx="5212080" cy="4297680"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${bulletsXml(bullets)}</p:txBody></p:sp>
<p:pic><p:nvPicPr><p:cNvPr id="9" name="caso" descr="${esc(title)}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId4"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="6309360" y="1280160"/><a:ext cx="5303520" cy="4663440"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>
<p:sp><p:nvSpPr><p:cNvPr id="10" name="foot"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="457200" y="6492240"/><a:ext cx="8229600" cy="274320"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr sz="900"><a:solidFill><a:srgbClr val="B8C2D5"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>AI Business Lab · Magnatic · magna-tic.com</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="11" name="page"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="10515600" y="6492240"/><a:ext cx="1371600" cy="274320"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:pPr algn="r"/><a:r><a:rPr sz="900"><a:solidFill><a:srgbClr val="B8C2D5"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>${page} / ${total}</a:t></a:r></a:p></p:txBody></p:sp>
</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}

function sectionSlideXml(page, total) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
<p:sp><p:nvSpPr><p:cNvPr id="2" name="bg"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12191695" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="1A0F2E"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="3" name="bar"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12191695" cy="54864"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="610A8B"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="4" name="num"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="914400" y="1828800"/><a:ext cx="3657600" cy="1828800"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr sz="7200" b="1"><a:solidFill><a:srgbClr val="16C6AD"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>10</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="5" name="tit"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="4572000" y="2286000"/><a:ext cx="6858000" cy="1371600"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr sz="3600" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>Casos de uso</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="6" name="sub"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="4572000" y="3657600"/><a:ext cx="6858000" cy="914400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr sz="1600"><a:solidFill><a:srgbClr val="B8C2D5"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>Mismo pedido en ChatGPT y Claude. Casos de práctica: Planta Central, Cliente Alfa, Lote Norte.</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:nvSpPr><p:cNvPr id="7" name="foot"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="457200" y="6492240"/><a:ext cx="9601200" cy="274320"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr sz="900"><a:solidFill><a:srgbClr val="B8C2D5"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>AI Business Lab · Magnatic · ${page} / ${total}</a:t></a:r></a:p></p:txBody></p:sp>
</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}

if (existsSync(WORK)) rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
execSync(`tar -xf "${SRC}" -C "${WORK}"`, { stdio: "inherit" });

copyFileSync(LOGO, join(WORK, "ppt/media/image2.png"));

const themePath = join(WORK, "ppt/theme/theme1.xml");
let theme = readFileSync(themePath, "utf8");
theme = theme
  .replace('<a:srgbClr val="1F497D"/>', '<a:srgbClr val="1A0F2E"/>')
  .replace('<a:srgbClr val="EEECE1"/>', '<a:srgbClr val="E8EEF9"/>')
  .replace('<a:srgbClr val="4F81BD"/>', '<a:srgbClr val="16C6AD"/>')
  .replace('<a:srgbClr val="C0504D"/>', '<a:srgbClr val="610A8B"/>')
  .replace('<a:srgbClr val="9BBB59"/>', '<a:srgbClr val="10B981"/>')
  .replace('<a:srgbClr val="8064A2"/>', '<a:srgbClr val="610A8B"/>')
  .replace('<a:srgbClr val="4BACC6"/>', '<a:srgbClr val="16C6AD"/>')
  .replace('<a:srgbClr val="F79646"/>', '<a:srgbClr val="16C6AD"/>')
  .replace('<a:srgbClr val="0000FF"/>', '<a:srgbClr val="16C6AD"/>')
  .replace('<a:srgbClr val="800080"/>', '<a:srgbClr val="610A8B"/>');
writeFileSync(themePath, theme);
const theme2 = join(WORK, "ppt/theme/theme2.xml");
if (existsSync(theme2)) writeFileSync(theme2, readFileSync(themePath));

for (const f of walk(join(WORK, "ppt"))) {
  if (!f.endsWith(".xml")) continue;
  let xml = readFileSync(f, "utf8");
  const next = xml
    .replaceAll("0B1220", "1A0F2E")
    .replaceAll("0b1220", "1A0F2E")
    .replaceAll("101A2E", "221536")
    .replaceAll("142036", "241440");
  if (next !== xml) writeFileSync(f, next);
}

const extra = CASES.length + 1;
const firstNew = 97;
const alreadyPatched = existsSync(join(WORK, `ppt/slides/slide${firstNew}.xml`));
const total = alreadyPatched
  ? readdirSync(join(WORK, "ppt/slides")).filter((n) => /^slide\d+\.xml$/.test(n)).length
  : 96 + extra;

if (!alreadyPatched) {
writeFileSync(join(WORK, `ppt/slides/slide${firstNew}.xml`), sectionSlideXml(firstNew, total));
writeFileSync(
  join(WORK, `ppt/slides/_rels/slide${firstNew}.xml.rels`),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout7.xml"/></Relationships>`
);

CASES.forEach((c, i) => {
  const n = firstNew + 1 + i;
  const media = `image${5 + i}.png`;
  copyFileSync(join(ROOT, c.file), join(WORK, "ppt/media", media));
  writeFileSync(
    join(WORK, `ppt/slides/slide${n}.xml`),
    caseSlideXml({ kicker: c.kicker, title: c.title, bullets: c.bullets, page: n, total })
  );
  writeFileSync(
    join(WORK, `ppt/slides/_rels/slide${n}.xml.rels`),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout7.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image2.png"/>
<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${media}"/>
</Relationships>`
  );
});

let types = readFileSync(join(WORK, "[Content_Types].xml"), "utf8");
for (let n = firstNew; n <= 96 + extra; n++) {
  types = types.replace(
    "</Types>",
    `<Override PartName="/ppt/slides/slide${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/></Types>`
  );
}
writeFileSync(join(WORK, "[Content_Types].xml"), types);

let pres = readFileSync(join(WORK, "ppt/presentation.xml"), "utf8");
let ids = "";
for (let i = 0; i < extra; i++) {
  ids += `<p:sldId id="${352 + i}" r:id="rId${103 + i}"/>`;
}
pres = pres.replace("</p:sldIdLst>", `${ids}</p:sldIdLst>`);
writeFileSync(join(WORK, "ppt/presentation.xml"), pres);

let rels = readFileSync(join(WORK, "ppt/_rels/presentation.xml.rels"), "utf8");
let extraRels = "";
for (let i = 0; i < extra; i++) {
  extraRels += `<Relationship Id="rId${103 + i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${firstNew + i}.xml"/>`;
}
rels = rels.replace("</Relationships>", `${extraRels}</Relationships>`);
writeFileSync(join(WORK, "ppt/_rels/presentation.xml.rels"), rels);
}

const map = {};
for (const abs of walk(WORK)) {
  const rel = abs.slice(WORK.length + 1).replace(/\\/g, "/");
  map[rel] = readFileSync(abs);
}
const ordered = {};
for (const key of Object.keys(map).sort((a, b) => {
  if (a === "[Content_Types].xml") return -1;
  if (b === "[Content_Types].xml") return 1;
  if (a === "_rels/.rels") return -1;
  if (b === "_rels/.rels") return 1;
  return a.localeCompare(b);
})) {
  ordered[key] = map[key];
}
writeFileSync(SRC, makeZip(ordered));
rmSync(WORK, { recursive: true, force: true });
console.log("Actualizado", SRC, "slides:", total);
