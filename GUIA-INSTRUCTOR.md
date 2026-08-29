# Guía del Instructor — AI Business Lab

**Curso:** Inteligencia Artificial Aplicada al Negocio (basado en ChatGPT y Claude)
**Duración:** 16 horas — 4 sesiones de 4 horas (o 2 sábados de 8 horas)
**Modalidad:** Presencial o remota, con el laboratorio web abierto en el navegador de cada alumno
**Cupo sugerido:** hasta 50 alumnos

Esta guía es para el facilitador. El alumno no la necesita.

---

## 1. Qué es este laboratorio y cómo funciona

El AI Business Lab es un sitio web educativo que corre en el navegador. **No reemplaza a ChatGPT ni a Claude**: es el entorno donde el alumno aprende el método, practica con retos, juega quizzes de repaso y arma su proyecto final. El uso real de la IA se hace en otra pestaña (ChatGPT o Claude en su versión gratuita).

Puntos clave que debes comunicar el primer día:
- El progreso de cada alumno se guarda **en su propio navegador** (no en un servidor). Si cambia de equipo o borra los datos del navegador, empieza de nuevo.
- No hay un panel central donde tú veas el avance de todos. El seguimiento en clase es presencial (los alumnos muestran su pantalla o su ficha).
- La metodología del curso es **A.C.T.I.V.A.**: Analizar, Contextualizar, Transformar, Iterar, Verificar, Aplicar.
- La regla de oro, repetida en todo el curso: **la IA propone, la persona decide y verifica.**

### Modo instructor
En el menú lateral, botón **"Instructor"** → PIN **`1234`**. Desbloquea notas de facilitación dentro de las lecciones y retos. El PIN se puede cambiar editando `content/instructor-notes.json`.

> Nota de seguridad: si el sitio es público, el PIN es visible en el código. No lo uses para nada sensible; solo protege las notas de facilitación.

---

## 2. Requisitos del alumno

**Antes de la primera sesión, cada alumno debe tener:**

Cuentas (todas gratuitas):
- Una cuenta de **ChatGPT** (chat.openai.com) — versión gratuita.
- Una cuenta de **Claude** (claude.ai) — versión gratuita.
- Un correo electrónico funcional (para crear las cuentas anteriores).

Equipo:
- Computadora (Windows, Mac o Linux) con **navegador moderno** (Chrome, Edge o Firefox actualizados). Tablet funciona para leer, pero el proyecto se hace mejor en computadora.
- Conexión a internet estable.
- **Microsoft Office** (Word, Excel, PowerPoint) o equivalente (Google Docs/Sheets/Slides sirve para practicar).

Conocimientos previos:
- Nivel usuario básico de computadora (abrir navegador, copiar y pegar, guardar archivos).
- **No** se requiere experiencia previa con IA ni programación.

Actitud:
- Traer **un problema real de su trabajo** que quiera resolver o agilizar. Es la base del proyecto final.
- Disposición a **no pegar datos confidenciales** (nombres reales de clientes, cifras internas, contraseñas). Se trabaja con casos anonimizados.

---

## 3. Material que se le entrega al alumno

Al inicio del curso, comparte:
1. **El enlace al laboratorio** (una vez publicado en GitHub Pages: `https://xander0408.github.io/CURSOS/`).
2. **Guía rápida de acceso** (una página): cómo entrar, escribir su nombre, navegar módulos y quizzes.
3. **Recordatorio de cuentas**: instrucciones para crear ChatGPT y Claude gratis (con captura de pantalla si es posible).
4. **Hoja de "reglas del laboratorio"**: qué NO pegar (datos confidenciales), y la regla de verificación humana.
5. **Plantilla de la ficha de proyecto** (el laboratorio la genera al final; conviene tenerla también en Word para que la personalicen).

Material que el alumno produce y se lleva:
- Su **biblioteca de prompts** (construida en el Prompt Lab; puede copiarla y guardarla).
- Su **ficha de proyecto final** (problema, solución, prompt, validación, tiempo ahorrado).
- Su **respaldo de progreso** (botón "Exportar JSON" en la sección Progreso).

Opcional recomendado:
- Un certificado o constancia de participación, entregado tras completar el proyecto final.

---

## 4. Estructura del curso (mapa de módulos)

| # | Módulo | Enfoque | Sesión |
|---|--------|---------|--------|
| 1 | Fundamentos de IA generativa | Qué es, límites, alucinaciones, verificación | Sábado 1 |
| 2 | Cómo hablar con una IA | Contexto, objetivo, tono, ejemplos, iteración | Sábado 1 |
| 3 | Ingeniería de prompts | Framework de 5 piezas, prompt maestro, biblioteca | Sábado 2 |
| 4 | IA + Word | Documentos, tono, revisión humana | Sábado 2 |
| 5 | IA + Excel | Fórmulas y validación de números | Sábado 3 |
| 6 | IA + PowerPoint | Estructura, storytelling, guion | Sábado 3 |
| 7 | Análisis e investigación | Resumir, comparar, verificar fuentes | Sábado 3 |
| 8 | Productividad diaria | Correos, minutas, decisiones | Sábado 4 |
| 9 | Proyecto final | Un problema real, de punta a punta | Sábado 4 |

Herramientas transversales (disponibles en el menú en todo momento):
- **Quiz**: repaso estilo concurso, cronometrado, con puntos por rapidez. Ideal para cerrar cada módulo.
- **Prompt Lab**: construir prompts con el framework y guardarlos.
- **Comparador**: mismo prompt en ChatGPT vs Claude, para elegir por utilidad.
- **Biblioteca**: plantillas de prompts reutilizables.
- **Proyecto final**: 12 pasos guiados hasta la ficha.

---

## 5. Paso a paso por sesión

### Sábado 1 — Fundamentos y conversación (Módulos 1 y 2)

**Antes de empezar (15 min):** verifica que todos entren al laboratorio y tengan ChatGPT y Claude abiertos en otras pestañas. Pide que escriban su nombre en el Dashboard.

**Bloque 1 — Módulo 1 (90 min):**
- Recorre las lecciones del Módulo 1 proyectando tu pantalla. Detente en cada callout ("Piensa", "Límite", "Privacidad", "Verificar").
- Actividad de apertura: pregunta qué tarea repetitiva odian de su semana. Anótalas: serán candidatas al proyecto final.
- Los alumnos resuelven los **retos del Módulo 1** en su laboratorio.
- Cierra con el **Quiz 1** proyectado en modo concurso (compiten por rapidez). Comenta las respuestas.

**Pausa (15 min).**

**Bloque 2 — Módulo 2 (90 min):**
- Lecciones del Módulo 2. Énfasis en dar contexto y en iterar (no aceptar el primer borrador).
- Ejercicio en vivo: toma un pedido pobre ("hazme un correo") y mejóralo entre todos usando las 5 piezas.
- Retos del Módulo 2 + **Quiz 2**.

**Cierre (30 min):** cada alumno comparte una tarea real donde aplicaría lo visto.

---

### Sábado 2 — Prompts y Word (Módulos 3 y 4)

**Bloque 1 — Módulo 3 (Ingeniería de prompts, 120 min):** es el corazón del curso.
- Enseña el framework **Rol + Contexto + Objetivo + Formato + Restricciones** hasta que lo digan de memoria.
- Introduce el **prompt maestro** (plantilla reutilizable). Cada alumno crea uno en el **Prompt Lab** y lo guarda en su biblioteca.
- Retos del Módulo 3 + **Quiz 3**.

**Pausa (15 min).**

**Bloque 2 — Módulo 4 (IA + Word, 90 min):**
- Lecciones sobre tipos de documento, cambio de tono y revisión humana.
- Práctica: cada alumno genera un borrador de correo o informe en ChatGPT/Claude (caso anonimizado), lo pega en Word y lo revisa (tono, datos, confidencialidad).
- Retos del Módulo 4 + **Quiz 4**.

**Cierre (15 min):** repaso de la regla de verificación.

---

### Sábado 3 — Excel, PowerPoint y Análisis (Módulos 5, 6 y 7)

**Bloque 1 — Módulo 5 (Excel, 75 min):**
- Enfatiza: la IA ayuda con fórmulas, pero **el número siempre se valida** con un caso conocido.
- Práctica con un archivo de ejemplo (prepáralo tú, con datos ficticios). Los alumnos piden fórmulas y las validan.
- Retos del Módulo 5 + **Quiz 5**.

**Bloque 2 — Módulo 6 (PowerPoint, 75 min):**
- De información desordenada a estructura + storytelling + guion del expositor.
- Práctica: convertir un texto largo en un esquema de diapositivas.
- Retos del Módulo 6 + **Quiz 6**.

**Pausa (15 min).**

**Bloque 3 — Módulo 7 (Análisis, 75 min):**
- Resumir, comparar, detectar riesgos, y **verificar fuentes** (cazar alucinaciones).
- Usa el reto "Caza las alucinaciones" en grupo.
- Retos del Módulo 7 + **Quiz 7**.

---

### Sábado 4 — Productividad y Proyecto final (Módulos 8 y 9)

**Bloque 1 — Módulo 8 (Productividad, 60 min):**
- Correos, minutas, agendas, toma de decisiones asistida.
- Retos del Módulo 8 + **Quiz 8**.

**Bloque 2 — Proyecto final (150 min):**
- Cada alumno elige **un problema real de su trabajo** (idealmente uno de los anotados el Sábado 1).
- Recorre los **12 pasos** de la sección "Proyecto final": problema, tarea actual, tiempo antes, solución, prompt, prueba en ChatGPT, prueba en Claude, comparación, refinamiento, verificación, proceso final, ahorro estimado.
- Al terminar, el laboratorio **genera la ficha**. El alumno la copia y la guarda.

**Cierre del curso (30 min):**
- Algunos alumnos presentan su ficha (problema → solución → ahorro).
- Repaso del **Reto final "AI Business Master"** (quiz que mezcla todo).
- Entrega de constancias.

---

## 6. Consejos de facilitación

- **Proyecta los quizzes en modo concurso.** Genera energía y sirve de repaso. Comenta cada respuesta.
- **No corras las lecciones.** El valor está en que piensen, no en terminar rápido.
- **Insiste en la verificación y la privacidad** en cada módulo, no solo al inicio.
- **Ancla todo a casos reales** del trabajo de los alumnos.
- Si un alumno se atasca con las cuentas de ChatGPT/Claude, ten a mano un par de cuentas de respaldo o empareja alumnos.
- Recuérdales **exportar su progreso** (Progreso → Exportar JSON) al final de cada sesión, por si cambian de equipo.

---

## 7. Resolución de problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| "No se ve el contenido / pantalla en blanco" | Abrió el archivo con doble clic | Debe entrar por el **enlace web** (GitHub Pages), no abrir el HTML local |
| "Mi progreso no se guarda" | Modo incógnito o almacenamiento bloqueado | Usar ventana normal del navegador; el laboratorio avisa con un mensaje |
| "Perdí mi avance" | Cambió de navegador/equipo o borró datos | El progreso es local por navegador; usar Exportar/Importar JSON |
| "El quiz no avanza" | Se acabó el tiempo o no eligió opción | Es normal: pasa a la explicación y luego a la siguiente pregunta |
| "No veo las notas del instructor" | Falta desbloquear modo instructor | Botón Instructor → PIN `1234` |

---

## 8. Resultado esperado

Al finalizar, el alumno es capaz de usar ChatGPT y Claude (versiones gratuitas) como asistentes de productividad para **redactar, analizar, investigar, estructurar información, trabajar con documentos y datos, preparar presentaciones y resolver tareas laborales habituales**, comprendiendo sus límites y **validando los resultados antes de usarlos**. Cada alumno se lleva su biblioteca de prompts y una ficha de proyecto con un ahorro de tiempo estimado y control humano.
