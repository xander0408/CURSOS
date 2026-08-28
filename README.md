# AI Business Lab

Laboratorio educativo de **Inteligencia Artificial Aplicada al Negocio** (basado en ChatGPT y Claude).
Curso de 16 horas: 9 módulos, retos, quizzes tipo concurso, comparador ChatGPT vs Claude,
biblioteca de prompts y proyecto final.

Es un sitio **100% estático** (HTML, CSS y JavaScript). No necesita servidor ni base de datos.
El progreso de cada alumno se guarda en el **navegador de cada quien** (`localStorage`).

## Para el alumno

Entra al enlace que te comparta el instructor, escribe tu nombre en el Dashboard y empieza por
los Módulos o por un Quiz. Tu avance se guarda solo en tu navegador; si cambias de equipo o
borras los datos del navegador, empiezas de nuevo.

## Para el instructor

- Botón **"Instructor"** (abajo en el menú) → PIN `1234` para ver las notas de facilitación.
  Puedes cambiar el PIN en `content/instructor-notes.json`.
- El progreso vive en el navegador de cada alumno; esta versión no centraliza los resultados.

## Ver el sitio en tu computadora (opcional)

El navegador bloquea la carga de archivos JSON si abres `index.html` con doble clic.
Usa un servidor local. Con Node instalado:

```
node serve.js
```

Luego abre http://localhost:8080 (o usa otro puerto: `node serve.js 3000`).

## Publicado con GitHub Pages

El sitio se sirve directamente desde la rama principal del repositorio mediante GitHub Pages.
