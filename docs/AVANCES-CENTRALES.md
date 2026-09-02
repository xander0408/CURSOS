# Avances centrales (todos los alumnos, cualquier PC)

GitHub Pages **solo sirve archivos**. No puede correr SQL ni guardar el progreso de 10 laptops.

Por eso el laboratorio puede hablar con una **base SQLite en la nube** (Cloudflare D1), gratis. Tú ves a todos en **Aula / admin**. Si un alumno cambia de PC o cierra la pestaña una semana, al volver a entrar con su usuario **recupera el avance**.

Mientras `content/sync.json` tenga `"apiUrl": ""`, todo sigue como ahora: solo el navegador local.

## Si ya tienes el Worker pegado a GitHub

El aula en Pages **no cambia**. El Worker es **otra URL** (`….workers.dev`). En el panel de Cloudflare:

1. Entra a **Workers & Pages** y abre **ese** Worker (no el sitio de GitHub Pages).
2. En **Settings → Build** (o *Build configuration*), pon **Root directory** = `sync`. Así Cloudflare usa `sync/worker.js` y `sync/wrangler.toml`, no la raíz del repo.
3. **D1 / Storage:** crea una base (nombre `abl-avances` está bien). En **Bindings** (o Variables and Secrets) añade un binding:
   - tipo **D1**
   - nombre de variable: **`DB`** (exacto, mayúsculas)
   - la base que acabas de crear
4. **Variables:** `ROSTER_URL` = `https://xander0408.github.io/CURSOS/content/students.json`
5. En la base D1 → **Console** (o *Execute SQL*), pega y ejecuta:

```sql
CREATE TABLE IF NOT EXISTS saves (
  username TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
```

6. Copia la URL del Worker (pestaña **Settings → Domains**, algo como `https://abl-avances.TU-CUENTA.workers.dev`), **sin barra al final**.
7. Pégala en `content/sync.json` como `apiUrl` y súbelo a GitHub. Espera Pages. Cada alumno **vuelve a entrar** una vez con usuario y contraseña.

Si el Worker que conectaste es un “Hello World” en otra carpeta, o el *root* no es `sync`, el deploy no usará nuestro código. El root `sync` es lo que lo arregla.

## Una vez (tú, en la laptop, si prefieres terminal)

1. Cuenta en [Cloudflare](https://dash.cloudflare.com/sign-up) (correo basta).
2. En la carpeta `sync` de este proyecto, terminal:

```
npx wrangler login
npx wrangler d1 create abl-avances
```

Copia el **database_id** que imprime y pégalo en `sync/wrangler.toml` (reemplaza `PEGA_AQUI_EL_ID_QUE_TE_DA_WRANGLER`).

```
npx wrangler d1 execute abl-avances --remote --file=schema.sql
npx wrangler deploy
```

3. Te da una URL tipo `https://abl-avances.TU-USUARIO.workers.dev`.
4. Ábrela en el navegador: debe decir ruta no encontrada o un JSON. Eso está bien.
5. En `content/sync.json` pon:

```json
{
  "apiUrl": "https://abl-avances.TU-USUARIO.workers.dev"
}
```

6. Sube ese cambio a GitHub (`git add content/sync.json sync/wrangler.toml` **sin** tokens de Cloudflare; el id de D1 sí va).
7. Espera Pages. **Cada persona entra de nuevo** (usuario y contraseña) una vez, para que el laboratorio pueda copiar su avance. Prueba: un quiz en Chrome, el mismo usuario en otro navegador: debe traer el avance.

No uses un repositorio de GitHub como “base de datos”: haría falta un token en la web pública. GitHub Pages tampoco puede correr SQL. El Worker + D1 es SQL (SQLite) fuera de Pages, y el aula solo llama a esa URL.

## Qué ves tú

Menú **Aula / admin** (usuario instructor): bloque **Avances en el servidor**, con fecha, módulos, si la ficha está lista.

## Si no despliegas el Worker

El curso funciona igual en **una misma PC y el mismo Chrome**. Sigue existiendo Exportar/Importar. El servidor es para no depender de eso.
