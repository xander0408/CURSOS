# Manual de aprendizaje — Inteligencia Artificial aplicada al negocio

Magnatic · Think Evolution. Documento para llevarse a casa. No sustituye las 16 horas en aula: las acompaña.

## Cómo usar este libro

Este manual es **documentación de aprendizaje**, no el laboratorio web. Lo puedes leer en el avión, en un receso o tres meses después del curso. Está escrito para gerencias y mandos que no programan.

En vivo, el instructor recorre módulos, quizzes, el comparador y el proyecto final en el portal. Aquí encontrarás el **porqué** y el **cómo seguir** cuando ya no esté el proyector. Donde diga «en el aula», es un puente con lo que verán juntos: cinco piezas del prompt, A.C.T.I.V.A., verificación humana, ChatGPT y Claude en pestañas aparte, y la ficha del viernes 2.

Léelo en este orden la primera vez. Después úsalo como consulta: glosario al final, errores típicos, hábitos de los lunes.

La regla de oro del laboratorio —y de este texto— es una sola: **la IA propone; tú decides y verificas.**

---

## 1. Para qué existe la IA en el trabajo (y para qué no)

La inteligencia artificial, en lenguaje de oficina, es un conjunto de sistemas que **predicen, clasifican o generan** a partir de patrones. No es un colega que «entiende» tu planta. No firma. No tiene tu procedimiento interno a menos que tú se lo cuentes, sin secretos.

Sirve cuando la tarea es **borrador, estructura, reformulación, checklist, resumen de un texto que tú aportas, o una primera tabla**. No sirve como fuente única de cifras legales, precios oficiales, diagnósticos médicos, despidos, ni como archivo de la empresa.

En el aula oirán la diferencia entre **IA tradicional** (un número, una etiqueta: fraude sí/no, pronóstico de demanda) e **IA generativa** (texto, esquema, ideas). ChatGPT y Claude son generativas. Un ERP o un sistema de calidad no se reemplazan con un chat.

Pregunta útil cada lunes: ¿esta tarea, si sale mal, daña a una persona, a un cliente o a un número oficial? Si la respuesta es sí, la IA puede ayudar al borrador, pero **un humano nombra la fuente y aprueba**.

---

## 2. Una historia breve, en lenguaje de negocio

No hace falta memorizar fechas de olimpiada. Sí conviene un mapa para no creer que «la IA nació en 2022».

Durante décadas, las máquinas siguieron **reglas** escritas por personas (si el sensor pasa de X, para la línea). Luego llegaron sistemas que **aprenden patrones** de muchos ejemplos: detectar un tipo de defecto, estimar una probabilidad. Eso ya existía en industria y banca.

El salto reciente es el **modelo de lenguaje**: un sistema entrenado para continuar texto de forma estadística, a escala enorme. De ahí salen chats que redactan, traducen tono, proponen estructura. En el módulo de **Historia de la IA** del laboratorio recorren Turing, Dartmouth, inviernos de la IA, el auge de los datos y los transformers, hasta productos como ChatGPT y Claude. El quiz de historia no es trivia inútil: evita el mito de que «ahora la máquina piensa como nosotros».

Lo que debes llevarte: cada ola prometió de más; las que sobrevivieron resolvieron **un trabajo concreto** con **un responsable humano**. Esta ola también.

---

## 3. Cómo «piensa» un chat (sin matemáticas)

Un modelo de lenguaje no busca en tu carpeta de red. Lee lo que hay **en la conversación** (y, si el producto lo permite, un archivo que tú subiste). Predice la siguiente palabra, y la siguiente, hasta armar un párrafo que **suena** coherente.

Por eso:

- Si el contexto es pobre, el texto se oye seguro y puede estar **equivocado**.
- Si pides una ley con número y no la sabe, puede **inventar** un artículo plausible.
- Si no le das el tono ni el destinatario, inventa un correo genérico que no firmarías.

En el aula usarán cuentas **gratuitas**. Los nombres de modelo y los topes **cambian**. La instrucción del curso es: **gana lo que veas en pantalla ese día**. No memorices un apodo de modelo que alguien escribió en un blog.

Tampoco asumas que el chat «ya conoce» CISA, tus KPIs o el contrato del cliente Alfa. En versión gratuita, **solo ve lo que escribes**. Por eso el curso insiste en **anonimizar**: Planta Norte, Cliente Alfa, [COMPLETAR], nunca nómina ni el PDF real.

---

## 4. ChatGPT y Claude: dos herramientas, un método

No hay ganador mundial. Hay **este** correo, **esta** tabla, **este** comité.

En vivo practicarán el **mismo prompt** en ambos y el **Comparador** del laboratorio. Un patrón frecuente (no una ley): uno puede ir más listo para enviar; el otro más cauto y marcar huecos. Tú eliges por utilidad, no por marca.

Hábitos sanos:

- Cuenta Free de cada uno, creadas **antes** del primer viernes.
- ChatGPT Free para volumen de borradores; Claude Free para contrastar entregables importantes (el cupo de Claude se agota; no es para 80 iteraciones).
- Si Claude se queda sin créditos, **el mismo texto** sigue en ChatGPT. El método no se detiene.
- No subas el libro de Excel real ni el contrato. Pega un **recorte anónimo** o datos de juguete.

El laboratorio web **no reemplaza** estos chats. Es el aula digital: lecciones, retos, quizzes, biblioteca de prompts, ficha. La IA de verdad está en la otra pestaña.

---

## 5. El framework de cinco piezas (lo que recitarán en vivo)

Un prompt no es un hechizo. Es un **encargo de trabajo**. En el aula lo memorizan:

1. **Rol** — quién debe ser la IA (redactor de calidad, analista de gabinete, mesa de ayuda para no técnicos).
2. **Contexto** — la situación, sin datos sensibles.
3. **Objetivo** — qué debe lograr, en una frase medible.
4. **Formato** — correo de 120 palabras, tabla de 4 columnas, seis apartados.
5. **Restricciones** — qué no inventar; dónde poner [COMPLETAR]; tono; prohibiciones.

Si falta formato, sale un ensayo. Si faltan restricciones, inventa descuentos y fechas. Si falta contexto, adivina tu empresa.

En **Prompt Lab** arman las cinco piezas y guardan en **Biblioteca**. El manual de prompts del portal trae casos para copiar (queja de Cliente Alfa, minuta de patio, Excel de juguete, PPT a comité). En casa, reutiliza la plantilla y **cambia solo el contexto**.

Ejemplo compacto (ficticio):

Rol: ejecutivo de atención con tono empático y directo. Contexto: retraso de 3 días, cliente valioso, no hay reembolso, sí 10% en la próxima compra, causa aún no cerrada. Objetivo: correo listo para que un humano lo edite. Formato: asunto + máximo 150 palabras. Restricciones: no inventar la causa ni una fecha de llegada; no citar normas con número que yo no te di.

Eso es lo que en vivo contrastan con el pedido flojo: «escribe un correo».

---

## 6. A.C.T.I.V.A.: el método del laboratorio

Las letras no son decoración. En fundamentos ordenan los seis pasos con flechas. Llévalos al lunes:

- **Analizar** — qué duele, quién usa el resultado, qué pasa si está mal.
- **Contextualizar** — qué necesita saber el modelo, ya anonimizado.
- **Transformar** — el primer borrador (el chat).
- **Iterar** — no aceptar la primera salida; pedir más corto, sin promesas, con huecos.
- **Verificar** — cifras, obligaciones, nombres, contra una fuente humana o un documento oficial.
- **Aplicar** — pegar en Word, enviar, o tirar a la basura. Tú aplicas.

El proyecto final del viernes 2 recorre esto de punta a punta sobre **un problema de tu cargo**, con datos de práctica ficticios si hace falta.

---

## 7. Alucinaciones, sesgos y el estilo que engaña

**Alucinación:** contenido que parece profesional y es falso: una ISO con número inventado, un «según el artículo 14», una cita, un KPI. El modelo no miente con malicia; **completa el patrón**.

**Sesgo:** el texto asume género, región o cliente «típico» y excluye. Revísalo como revisarías un comunicado de RRHH.

**Estilo seguro ≠ dato verificado.** Un correo impecable puede afirmar un descuento que nadie autorizó.

En el aula hay retos de **cazar el error**. En casa, la pregunta de Guardian: ¿puedo señalar la fuente de cada cifra y de cada obligación antes de enviar?

Técnica práctica: pide siempre una restricción del tipo «si no tienes un dato, escribe [FALTA] y pregúntame; no inventes».

---

## 8. Privacidad: la lista que deben poder recitar

Nunca pegues en un chat público gratuito:

- Nóminas, DPI, cuentas bancarias, salud de personas.
- Contratos, cláusulas, precios oficiales no públicos.
- Contraseñas, tokens, dumps de correo interno.
- Nombres de clientes reales, proveedores en disputa, números de lote reales si identifican el negocio de forma sensible.
- Cualquier cosa que te molestaría ver fuera de la empresa.

Sí puedes: un caso equivalente (Cliente Alfa, lote L-441 de **ejemplo**, humedad 18% vs 14% **de ejemplo**), cargos genéricos, [FECHA], [PRECIO].

Si dudas, no lo pegues. Redacta el contexto en cinco líneas anónimas primero (eso es una actividad del viernes 1).

Los productos de pago empresariales existen; **este curso usa Free**. El hábito de anonimizar sirve igual el día que la empresa compre un plan: la responsabilidad sigue siendo tuya.

---

## 9. Word: el borrador no es el documento

En vivo: generan texto en el chat, lo pegan en Word, **marcan en rojo** lo que un humano debe verificar (tono, cifras, confidencialidad, destinatario).

La IA acelera el **primer** párrafo. Tú pones estilos, membrete, control de cambios, y la firma.

Buenos usos: correo, minuta, aviso interno, informe de una página con huecos [CIFRA OFICIAL]. Malos usos: «escribe el informe anual con los números reales que te imagines».

Después del curso: guarda dos prompts maestros (queja; minuta). Cámbiales solo el contexto. Eso es biblioteca, no magia.

---

## 10. Excel: la fórmula se comprueba a mano

El chat puede proponer `=A2*B2` o un `BUSCARV`. **Tres celdas conocidas** se calculan con calculadora o a lápiz. Si coinciden, sigues. Si no, el modelo se equivocó o el rango está mal.

Nunca pegues el libro de la planta. Seis filas inventadas bastan para practicar (actividad de Excel del viernes 2).

Si la IA pone **texto** donde Excel espera número, la hoja falla. Eso se discute en aula a propósito.

La IA no es tu controlador financiero. Es un ayudante de sintaxis.

---

## 11. PowerPoint: hilo, no decoración

Pide **estructura** (seis diapositivas, un mensaje por slide, máximo tres viñetas) y un **guion de 8 minutos**. Descarta dos ideas flojas. El diseño lo haces tú en PPT.

En comité, una cifra sin fuente es un riesgo. Usa [CIFRA OFICIAL] hasta que alguien la ponga.

En vivo hay módulo PPT y a veces mini-votación ChatGPT vs Claude sobre el mismo esquema. En casa, el criterio es: ¿un compañero entiende el hilo en 30 segundos?

---

## 12. Análisis, investigación y productividad diaria

Resumir un texto **que tú pegaste** (anónimo) es uso legítimo. «Investiga en internet y dame la verdad sobre nuestro competidor» en un modo que no navega, o que mezcla fuentes, es terreno de alucinación.

Detectar riesgos de usar un chat público para minutas (mapa de 10 riesgos y un control humano) es el tipo de entregable de auditoría del curso: **no afirma que el chat cumple una norma**; pide control.

Productividad: agendas, relevos de turno, seguimientos. Siempre con [COMPLETAR] en nombres y horas reales.

El módulo de productividad del viernes 2 conecta con el correo, la minuta y la decisión asistida: la IA arma opciones; el comité decide.

---

## 13. Qué verán en vivo (puente con las 16 horas)

Para que este libro no flote aparte del aula, este es el mapa. Los horarios exactos los marca el instructor.

**Viernes 1.** Entran al laboratorio (URL con barra final, logo Magnatic). Conocernos. Cuentas gratis. Historia de la IA y su quiz. Fundamentos, reto A.C.T.I.V.A., cómo hablar con la IA, ingeniería de prompts y las cinco piezas en voz alta, Word con revisión en rojo. **Preparar el caso anónimo. No cerrar la ficha del proyecto.**

**Viernes 2.** Excel con comprobación a mano, PowerPoint, comparador, caza de errores, productividad. **De 14:20 a 16:25, examen:** Proyecto final, doce pasos, Word de práctica de su cargo, ChatGPT y Claude en vivo, **Guardar ficha**. Cierre con quiz integrador y, si aplica, un minuto en voz alta: problema, qué hizo la IA, qué revisó un humano, ahorro.

El laboratorio guarda el avance **en su navegador**. Si cambian de PC: Progreso → Exportar. No usen incógnito.

Este manual **no** trae sus contraseñas ni los casos Word personales. Eso es material de aula.

---

## 14. El proyecto y la ficha (aprendizaje, no spoilers)

La ficha documenta: problema, cómo lo haces hoy, tiempos, qué hace la IA y qué haces tú, prompt, salidas de dos herramientas, comparación, verificación, proceso repetible, ahorro estimado, riesgos, control humano.

El ahorro **lo estimas tú**. El modelo no conoce el valor de tu hora.

`Ficha-Proyecto-Final.docx` es plantilla vacía para respaldo. La entrega académica es **guardar en el portal**. Los archivos `proyectos/` son casos de práctica para copiar el día del examen, con datos ficticios.

Después del curso, puedes repetir la ficha con **otro** proceso de tu área, siempre anónimo en el chat público.

---

## 15. Cómo pedir bien: patrones que duran

**Iterar.** Primera salida: «más corto, sin promesas, marca lo que no sabes». Segunda: «quita adjetivos, deja hechos».

**Un entregable por chat.** No mezcles «hazme el correo, la PPT y el presupuesto» en un solo mensaje si el resultado debe firmarse.

**Ejemplos.** Dos frases de tono que sí te gustan valen más que «sé profesional».

**Público.** Correo interno ≠ comunicado a dirección ≠ cartelera.

**Idioma.** Pide el idioma de salida. Si mezclas español y anglicismos de planta, dilo.

**No negocies con el modelo una cifra.** La cifra sale de tu sistema o de un humano.

---

## 16. Límites Free que no debes olvidar

- Topes de mensajes, longitud y archivos. Si se acaba, espera o cambia de herramienta con el **mismo** prompt.
- Privacidad: el producto gratuito no es un baúl corporativo.
- Adjuntar PDFs pesados gasta cupo y sube riesgo. Prefiere un extracto anónimo.
- Imágenes y modos «con internet» dependen del día. Verifica si la respuesta cita algo que puedas abrir tú.

Cuando la empresa compre Copilot u otro copiloto **dentro** de Word o del correo, el método de cinco piezas y la verificación **siguen**. Solo cambia el lugar donde pegas.

---

## 17. Ética y responsabilidad

Declarar que un borrador nació con IA es honestidad, no vergüenza, cuando la política interna lo pida.

No uses la IA para elaborar acoso, discriminación, o para fingir que leíste un contrato que no leíste.

No automatices un rechazo de personal o un recorte «porque el chat lo sugirió».

El responsable frente a un cliente o un auditor **eres tú** o tu jefatura, no la marca del chat.

---

## 18. Glosario corto

**Prompt:** el encargo que escribes.

**Token:** trozo de texto que el modelo procesa; los textos largos «gastan» más.

**Alucinación:** falso plausible.

**Prompt maestro:** plantilla reutilizable; solo cambias contexto.

**Copiloto:** IA embebida en otra app (Word, navegador). Asiste; no firma.

**Modelo de lenguaje:** sistema que predice texto.

**Fine-tuning / RAG:** técnicas de empresa para anclar respuestas a documentos propios. **Fuera de alcance** de este curso Free; el concepto basta: sin tus documentos, el chat generalista improvisará.

**A.C.T.I.V.A.:** el ciclo del laboratorio.

**Ficha:** evidencia de criterio del proyecto.

---

## 19. Errores típicos (y la corrección)

| Error | Corrección |
| ----- | ---------- |
| «Hazme un correo» | Cinco piezas y destinatario |
| Creer la primera cifra | Fuente humana o sistema |
| Pegar el Excel real | Seis filas de juguete |
| Un solo chat para todo | Mismo prompt en dos herramientas si importa |
| Cerrar la ficha el viernes 1 | El examen es el viernes 2 |
| Modo incógnito | Se pierde el avance |
| URL sin barra final | `…/CURSOS/` |
| Memorizar el nombre del modelo | Mirar la pantalla de hoy |
| Aceptar el primer borrador | Iterar: más corto, sin promesas |
| Pensar que el lab es ChatGPT | El lab es el aula; el chat es otra pestaña |

---

## 20. Hábitos para los 30 días siguientes

Semana 1: un correo interno por semana con cinco piezas. Imprímelo, marca en rojo, envía la versión tuya.

Semana 2: una tabla o fórmula con tres celdas comprobadas.

Semana 3: un esquema de 6 slides para una reunión real, cifras entre corchetes hasta tener oficiales.

Semana 4: revisa tu biblioteca: ¿dos prompts que de verdad repetirás?

Reunión de equipo: 10 minutos, «qué no pegamos en el chat». Eso vale más que una charla de ciencia ficción.

---

## 21. Ejercicios para casa (sin datos reales)

1. Reescribe un correo viejo tuyo (ya enviado) con el framework. Compara longitud y promesas.
2. Toma un párrafo de un procedimiento **público** o inventado y pide un resumen de 5 viñetas con [FALTA] donde no conste.
3. Inventa tres proveedores P1 P2 P3 y pide una tabla sin ganador.
4. Pide al chat una «norma ISO 99887-Z» y observa si la inventa. Anota la lección.
5. Explica A.C.T.I.V.A. a un colega en dos minutos. Si no puedes, reléelo.

---

## 22. Preguntas que el instructor puede hacer (prepárate)

- ¿Cuál es la diferencia entre IA tradicional y generativa en una frase?
- Di las cinco piezas.
- ¿Por qué el estilo profesional no basta?
- ¿Qué no pegarías nunca?
- ¿Cómo compruebas una fórmula que te dio el chat?
- ¿Por qué probar dos herramientas con el mismo prompt?
- ¿Quién estima el ahorro en la ficha?

Si respondes esto sin leer el teleprompter, el curso cumplió. Este libro está para cuando la memoria falle.

---

## 23. Más historia, para no ser ingenuos en una reunión

Cuando alguien dice «la IA va a quitar todos los puestos», recuerden las olas anteriores. En los años 50 y 60 hubo promesas de traducción automática perfecta y de máquinas que razonarían como personas. Hubo **inviernos**: se cortó presupuesto porque el resultado no coincidía con el folleto. Luego volvió el interés con más datos, más cómputo y mejores algoritmos.

Eso no significa que «no pase nada esta vez». Significa que **el valor aparece en un proceso concreto** (un tipo de correo, un tipo de informe, un checklist de relevo) con **dueño** y **control**, no en un eslogan.

Los **transformers** (la arquitectura detrás de muchos modelos actuales) permitieron relacionar palabras lejanas en un texto largo. Para ti: el chat puede mantener el hilo de un prompt de una página mejor que los sistemas viejos de «bolsa de palabras». Sigue sin ser un experto de tu planta.

En el módulo de historia del laboratorio verán nombres (Turing, Dartmouth, winters, deep learning, ChatGPT). El aprendizaje para gerencia es: **cada nombre es un hito de expectativa y de límite**. El quiz existe para que no salgan diciendo que «ahora ya piensa».

---

## 24. Datos, entrenamiento y por qué el chat no «sabe» tu procedimiento

Los modelos se entrenan con cantidades enormes de texto público y licenciado. Eso les da fluidez. **No** les da el SOP de tu turno B ni el precio del trimestre.

Tres consecuencias:

1. Habla con seguridad de temas generales (cómo estructurar un correo).
2. Se equivoca en lo local (tu política de descuentos).
3. Mezcla lo general con lo local si tú no separas: por eso las **restricciones** y los **[COMPLETAR]**.

Empresas grandes construyen sistemas que **buscan en documentos internos** y luego redactan (a veces llamado RAG). Eso **no** es este curso. Si algún día lo tienen, igual tendrás que verificar: el buscador puede traer el PDF viejo.

---

## 25. Tokens, contexto y por qué los chats «se olvidan»

El modelo atiende una ventana de texto. Si la conversación es kilométrica, el inicio se diluye. Por eso, para un entregable importante, **abre un chat nuevo** con el prompt maestro completo, no un hilo de tres días con chistes mezclados.

Los archivos adjuntos cuentan. Un PDF de 80 páginas en Free puede fallar, truncarse o alucinar citas internas. Mejor: tú extraes la página 3 anonimizada.

---

## 26. Calidad, compras, ventas, RRHH, sistemas: el mismo método, distinto riesgo

**Calidad.** Un borrador de no conformidad acelera el papel; la causa raíz y la firma son humanas. No dejes que el chat invente una cláusula ISO.

**Compras.** Tablas de proveedores sin elegir ganador. Los precios oficiales no se pegan.

**Ventas.** Seguimiento post-visita sin inventar crédito ni fecha de entrega.

**RRHH.** Avisos internos sin pedir edad ni datos sensibles. El tono de «familia» de empresa puede volverse condescendiente: revísalo.

**Sistemas.** Comunicados de incidente sin IPs ni nombres de servidor. Enseña qué **no** se pega en un chat público (logs).

**Dirección.** Brief de una página: opciones, supuestos, qué verificar antes de firmar. Nada de ROI inventado.

En vivo cada uno tiene un caso de práctica alineado al cargo. Este capítulo es para que, de vuelta al puesto, no copien el caso ficticio como si fuera el real: **copian el método**.

---

## 27. Cómo facilitar una reunión de 15 minutos sobre IA (tú, sin ser el instructor)

1. Regla de oro en la pizarra.
2. Lista de lo que no se pega (2 minutos).
3. Un ejemplo pobre vs uno de cinco piezas (5 minutos).
4. Un error: cifra sin fuente (3 minutos).
5. Acuerdo: un prompt maestro del área, dueño, fecha de revisión (5 minutos).

Eso replica el espíritu del aula sin el laboratorio. Si pueden, abren el portal y el comparador.

---

## 28. Ejemplo trabajado: correo de retraso (el que verán en el manual de prompts)

Pedido flojo: «escribe un correo por un atraso».

Pedido del curso (idea): rol de atención; cliente valioso; 3 días; no reembolso; 10% próxima compra; no inventar causa; no fecha mágica; 150 palabras.

Qué buscar en la salida:

- ¿Disculpa sin melodramas?
- ¿El 10% está condicionado a política real?
- ¿Hay una promesa de «lo resolvemos ya» que nadie puede cumplir?
- ¿Aparece una causa inventada («fue el clima»)?

En el comparador, un modelo puede sonar más listo para enviar y el otro más cauto. **Ninguno se envía sin tu edición.**

---

## 29. Ejemplo trabajado: Excel de juguete

Columnas: producto, cantidad, precio unitario de **ejemplo**. Fórmula de importe. Tres filas: 10×2=20, 5×3=15, 0×9=0. Si el chat propone una fórmula rara y esas tres no cuadran, no la copies al libro real.

Pide: «explica en una frase qué hace cada parte de la fórmula». Si no puedes repetirla, no la uses.

---

## 30. Ejemplo trabajado: seis diapositivas a comité

Mensaje único: «queremos pasar a diligencia, no a comprar mañana». Slides: problema, dos opciones, supuestos, riesgos, qué verificar, petición de decisión. Viñetas cortas. Cifras entre corchetes. Guion: qué dirás si preguntan el 8% de ahorro del proveedor (respuesta: no verificado).

Eso es el módulo PPT más el criterio de dirección.

---

## 31. Evaluación en el curso: qué cuenta y qué no

Cuentan: quizzes de módulo, retos (A.C.T.I.V.A., caza de error), actividades marcadas, **ficha guardada el viernes 2**.

No cuentan como examen: el calentamiento de 2 minutos (sirve para energía), leer este libro, el Word de plantilla vacía enviado por correo.

El instructor no tiene un servidor con todas las notas. El seguimiento es **en sala**. Exporta tu JSON.

---

## 32. Después del laboratorio: copilotos de Office y «el chat de la empresa»

Puede llegar Copilot en Word o un asistente interno. Entonces:

- Sigue anonimizando lo que no deba viajar.
- Sigue verificando cifras.
- Aprovecha que el copiloto **ve el documento abierto**: el prompt puede ser más corto («acorta el párrafo 2, tono directo, no inventes números»).
- No asumas que el copiloto «ya está alineado a compliance» sin que Legal lo diga.

Este manual no es un contrato de software. Es oficio.

---

## 33. Preguntas frecuentes

**¿Esto reemplaza un diplomado de ciencia de datos?** No. No entrenan modelos ni programan.

**¿Debo pagar Plus o Pro?** No para este curso. Si pagas por tu cuenta, igual aplican las reglas de datos.

**¿Puedo usar Gemini, Copilot o Grok?** El aula se centra en ChatGPT y Claude para comparar dos. El método es portable. No inventes en el quiz un «modelo del día» que no esté en pantalla.

**¿Y si el chat se niega a un correo de reclamo?** Reformula: no pidas engañar; pide un borrador ético con los hechos que diste.

**¿Puedo hacer la ficha en casa el jueves?** Puedes **anotar** el caso. Cerrar la ficha es el bloque de examen, con las dos IAs en vivo.

**¿El laboratorio funciona en el celular?** Se lee. El proyecto se hace mejor en computadora.

---

## 34. Mini guía de estilo cuando editas la salida

- Quita adverbios vacíos («realmente», «simplemente»).
- Convierte promesas en próximos pasos con dueño.
- Una idea por párrafo en correos a dirección.
- Números: dígitos y unidad. Si no hay número, no lo pongas.
- Cierra con qué debe hacer el lector, no con «quedamos atentos» vacío si no hay fecha.

---

## 35. Bitácora sugerida (una hoja a la semana)

Fecha. Tarea. Prompt (sí/no cinco piezas). Herramienta. Qué verifiqué. Qué envié. Minutos antes / después. Qué no volveré a pegar.

En un mes tienes evidencia de aprendizaje **tuya**, no un diploma decorativo. El curso pide esa lógica en la ficha; la bitácora la extiende.

---

## 37. Un día típico después del curso (narración)

Llegas. Hay un correo de un cliente molesto. Antes abrías un mensaje viejo y reescribías. Ahora abres tu prompt maestro de queja, cambias el contexto (días de atraso, lo que sí puedes ofrecer, lo que no), pegas en el chat, sacas un borrador, lo pegas en Word, quitas una promesa, confirmas el 10% con tu política, envías. Tardaste menos. El control fue tuyo.

A media mañana te piden una tabla comparativa. No pegas las cotizaciones reales. Armas tres filas ficticias con la misma estructura, pides el formato, copias la tabla vacía a Excel y **llenas tú** los números oficiales.

Por la tarde hay comité. Pides seis slides de estructura, descargas el esquema, montas PPT, dejas [CIFRA] hasta que Finanzas conteste. No presentas el 8% del proveedor como hecho.

Eso es el curso aplicado. Este libro existe para que ese día no dependas de recordar la diapositiva 40.

---

## 38. Cómo escribir restricciones que de verdad cortan alucinaciones

Malas restricciones: «sé preciso», «no te equivocues», «sé ético». El modelo no tiene un medidor interno de ética corporativa tuya.

Buenas restricciones, concretas:

- No inventes normas, artículos ni números de ISO.
- Si falta un dato, escribe [FALTA] y una pregunta. No rellenes.
- No uses nombres de personas. Usa cargos.
- Máximo 120 palabras. Si no cabe, recorta hechos, no agregues adornos.
- No ofrezcas descuentos, plazos ni fechas que yo no listé.
- Tono: directo, de usted, sin emojis.
- Idioma: español de Centroamérica, sin traducir al inglés términos de planta que yo no usé.

En el aula verán que un prompt largo no es «más inteligente»: es **más acotado**. El instructor insistirá en copiar y pegar casos del manual, no en improvisar un poema al modelo.

---

## 39. Iterar: el diálogo que sí vale la pena

Primera salida demasiado larga. Segunda instrucción: «Deja solo hechos y el próximo paso. Quita adjetivos. Marca en una línea qué no puedes saber.»

Tercera: «Ahora un asunto de 6 palabras y un cierre con nombre de cargo, no de persona.»

Eso es Iterar en A.C.T.I.V.A. No es pelearse con la máquina. Es **editar con lenguaje**.

Si después de tres rondas sigue inventando la causa del retraso, el prompt está mal (faltó restricción) o estás pidiendo un hecho que no diste. **No insistas pidiendo «la verdad»: dilo tú o [FALTA].**

---

## 40. Trabajo en equipo: un prompt, muchos dueños

Un prompt maestro de calidad no es de «sistemas». Es del proceso. Acuerden:

- Quién lo actualiza.
- Dónde vive (biblioteca del lab, Word en SharePoint interno — **sin** pegar secretos en chats públicos).
- Qué versión está vigente (fecha).
- Qué se verifica siempre (lista corta).

El laboratorio les enseña a guardar en Biblioteca. En la empresa, el hábito es el mismo: **no reinventar cada lunes**.

---

## 41. Lo que el instructor hará en vivo que este libro no puede reemplazar

- El ritmo, las pausas, el concurso de quizzes.
- Ver dos pantallas distintas en el comparador.
- Corregir en el pasillo un pegado peligroso.
- El bloque de dos horas del proyecto con reloj en la pared.
- Las preguntas orales de las cinco piezas.

Por eso el manual es **fuera del curso** en el sentido de que se lo llevan, y **dentro** en el sentido de que nombra esas prácticas. Si solo leen y no asisten, les faltará el músculo. Si solo asisten y no leen, se les olvidará el porqué a las tres semanas.

---

## 42. Seguridad de la información, en una página

Clasifica mentalmente: público, interno, confidencial, secreto. Un chat Free es un canal **ajeno**. Trátalo como si el texto pudiera verse fuera.

No uses la cuenta personal para pegar lo confidencial «porque es más cómodo».

Cierra sesiones en PCs compartidas.

Desconfía de plugins y GPTs de terceros que piden más datos.

Si hay un incidente (alguien pegó un archivo), avisen por el canal interno de seguridad, no al chat preguntando «¿qué hago?».

---

## 43. Mitos que conviene desmontar en voz alta

**«El que no use IA se queda fuera.»** El que **firme** basura generada se queda peor. Oficio primero.

**«Hay que usar el modelo más nuevo.»** Hay que usar el que tienes, con método. El aula Free es deliberado.

**«Si suena bien, es verdad.»** Es el mito más caro.

**«La IA ya lee mi correo de la empresa.»** En Free, no, salvo que lo pegues.

**«Comparar dos chats es perder tiempo.»** En entregables que importan, es barato. En el aula lo cronometran.

---

## 44. Plantilla de prompt maestro (cópiala a tu biblioteca)

Rol: [cargo que redacta, para [público]].

Contexto: [hechos anónimos, 4–8 líneas]. No incluir [lista de prohibido].

Objetivo: [verbo + entregable].

Formato: [estructura, extensión, idioma].

Restricciones: [no inventar X; [FALTA]; no promesas; tono].

Cierre del prompt: «Antes de redactar, enumera en 3 viñetas qué datos te faltan. Luego el entregable.»

Esa última línea, que en vivo pueden añadir, reduce alucinaciones porque obliga a declarar huecos.

---

## 45. Cómo leer un resultado de Claude o ChatGPT con lápiz rojo

Subraya: cifras, fechas, nombres, normas, ofertas, adjetivos morales («siempre», «garantizamos»).

Cada subrayado: ¿está en tu contexto? ¿Sí / [FALTA] / inventado?

Eso es el ejercicio de Word del viernes 1, portable a cualquier texto.

---

## 46. Indicadores tontos y indicadores útiles

Tonto: número de prompts por día.

Útil: porcentaje de salidas que enviaste **sin** cambiar una cifra (debería ser cercano a cero si hay cifras).

Útil: minutos de una tarea repetida, antes y después, **tú** lo mides.

Útil: incidentes de pegado indebido (objetivo: cero).

La ficha del curso pide ahorro estimado. No lo conviertas en un KPI teatral para dirección sin medición honesta.

---

## 47. Si diriges un equipo que ya «usa ChatGPT a escondidas»

No lo prohibas de golpe sin alternativa: se esconderán más. Haz la reunión de 15 minutos del capítulo 27. Da la lista de no pegar. Pide un prompt maestro por área. Ofrece este manual. El laboratorio ya les dio el marco; tú das permiso y límite.

---

## 48. Cierre práctico: tres cosas que deben saber de memoria

Uno: cinco piezas.

Dos: qué no se pega.

Tres: la IA propone, tú verificas.

Si olvidan el resto, con esas tres no hacen daño. El resto de páginas es para hacer **bien** el trabajo, no solo para no hacerlo mal.

---

## 49. Lectura de cierre



La IA generativa es una **máquina de borradores**. Las organizaciones que ganan no son las que más pegan en el chat, sino las que **piden con oficio, iteran y verifican**.

Magnatic diseñó el laboratorio para que practiquen eso en dos viernes. Este manual es el cuaderno que se llevan. Cuando el producto cambie de nombre o de tope, el método sigue: rol, contexto, objetivo, formato, restricciones; analizar, contextualizar, transformar, iterar, verificar, aplicar.

**La IA propone. Tú decides y verificas.**

---

Magnatic · AI Business Lab · Documento de aprendizaje para participantes. Complementa el portal y las sesiones en vivo; no reemplaza las reglas internas de tu empresa.
