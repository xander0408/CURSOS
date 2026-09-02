# Avances centrales (todos los alumnos, cualquier PC)

GitHub Pages **solo sirve archivos**. No puede correr SQL ni guardar el progreso de 10 laptops.

Por eso el laboratorio puede hablar con una **base SQLite en la nube** (Cloudflare D1), gratis. Tú ves a todos en **Aula / admin**. Si un alumno cambia de PC o cierra la pestaña una semana, al volver a entrar con su usuario **recupera el avance**.

Mientras `content/sync.json` tenga `"apiUrl": ""`, todo sigue como ahora: solo el navegador local.

## Si ya estás en el proyecto `cursos` (Workers y Pages)

Estás en el sitio correcto. El **Directorio raíz `/`** está mal: hay que apuntarlo a `sync`. El aula de GitHub Pages no se toca.

### A. Base SQL

1. Menú izquierdo → **Almacenamiento y bases de datos** → **D1**.
2. **Crear** una base. Nombre: `abl-avances`.
3. Ábrela → **Consola** (o SQL) y ejecuta:

```sql
CREATE TABLE IF NOT EXISTS saves (
  username TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
```

4. En esa misma base copia el **ID** (UUID largo).

### B. Proyecto `cursos`

1. Menú **Cómputo** → **Workers y Pages** → entra a **cursos**.
2. Pestaña **Vinculaciones** → añadir **D1**. Variable: **`DB`**. Elige la base `abl-avances`.
3. Pestaña **Configuración** → **Configuración de compilación** → editar:
   - **Directorio raíz:** `sync` (no `/`)
   - **Comando de compilación:** vacío (Ninguno)
   - **Implementar comando:** `npx wrangler deploy`
4. Guarda. Pestaña **Implementaciones** → **Nueva implementación**.
5. Pestaña **Dominios**: copia la URL `https://….workers.dev` **sin** barra al final.

Esa URL va en `content/sync.json` (`apiUrl`). El `database_id` de D1 va en `sync/wrangler.toml`. Pásamelos y los dejo publicados.

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
