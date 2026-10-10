## Claude Starter README

## Skills de Claude Code

- `/test [filtro]`: corre los tests con Vitest y, si algo falla, diagnostica la causa sin modificar código.
- `/diff-review [foco]`: revisa el diff local (`git diff HEAD` + archivos sin trackear) contra una checklist de tipos, manejo de errores, tests faltantes y secretos, y devuelve una tabla de severidad.
  - Se llama `diff-review` y no `review` ni `code-review` porque ambos nombres ya son comandos integrados de Claude Code.
- `/changelog [versión]`: actualiza `CHANGELOG.md` (formato Keep a Changelog) con los commits desde el último tag, agrupados por tipo de Conventional Commit. Solo se ejecuta a mano (`disable-model-invocation`), porque escribe archivos.
- `/start-task <descripción>`: sincroniza `master`, propone y crea una rama `<tipo>/<descripcion>` y arranca la tarea con un plan que tienes que aprobar. Solo se ejecuta a mano.

## Revisión automática

### Cómo funciona

- `.github/workflows/claude-review.yml` revisa cada PR que no esté en borrador (al abrirlo, al reabrirlo, al sacarlo de borrador y en cada push) con `anthropics/claude-code-action@v1`. Usa Sonnet y un máximo de 15 turnos, y publica un único comentario con la tabla de hallazgos. Si llega un push nuevo, cancela la revisión anterior.
- Usa los mismos criterios que `/diff-review`, porque lee el checklist, la severidad y el formato de `.claude/skills/diff-review/SKILL.md`. Si cambias la skill, cambian la revisión local y la del PR. Claude solo tiene herramientas de lectura más `gh pr comment`, así que no puede editar ni hacer push.
- `.github/workflows/claude.yml` responde cuando alguien menciona `@claude` en issues, comentarios de PR o reviews. Solo atiende a usuarios con permiso de escritura en el repo, y también usa Sonnet con 15 turnos.
- Requisitos: el secret de Actions `CLAUDE_CODE_OAUTH_TOKEN`, generado con `claude setup-token` (caduca al año), y la [GitHub App de Claude](https://github.com/apps/claude) instalada en el repo.

### Historial de revisiones

Ejecuciones de la revisión que publicaron comentario:

| PR                                                                           | Commit revisado                | Archivos | ALTA | MEDIA | BAJA | Veredicto           |
| ---------------------------------------------------------------------------- | ------------------------------ | -------: | ---: | ----: | ---: | ------------------- |
| [#6](https://github.com/inglauraocampo-create/mini-api/pull/6) GET por id    | `843b8e4` (fase red)           |        4 |    0 |     0 |    0 | ✅ Aprobar          |
| [#6](https://github.com/inglauraocampo-create/mini-api/pull/6) GET por id    | `af71a2e` (secreto de prueba)  |        5 |    1 |     0 |    0 | ❌ Requiere cambios |
| [#6](https://github.com/inglauraocampo-create/mini-api/pull/6) GET por id    | `351cf31` (revert del secreto) |        4 |    0 |     0 |    0 | ✅ Aprobar          |
| [#7](https://github.com/inglauraocampo-create/mini-api/pull/7) DELETE por id | `7087ca8` (green + refactor)   |        4 |    0 |     0 |    0 | ✅ Aprobar          |

### Hallazgos

Único hallazgo hasta ahora, copiado del comentario de la revisión en el PR #6. La credencial se sustituyó por un placeholder, para que el README no contenga una cadena de conexión que los escáneres de secretos detecten:

| #   | Severidad | Categoría | Archivo:línea  | Problema                                                                                                                                                                                      | Sugerencia                                                                                                                                                                                                           |
| --- | --------- | --------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ALTA      | Secretos  | `src/app.ts:8` | Se exporta `DATABASE_URL` con una cadena de conexión Postgres que incluye usuario y contraseña (`<usuario>:<contraseña>`) en el código fuente. Además la constante no se usa en ningún sitio. | Eliminar la constante, rotar esa credencial (ya queda en el historial de git) y, si hace falta, leer la URL de `process.env.DATABASE_URL` validándola al arrancar; documentar solo un placeholder en `.env.example`. |

El secreto era falso. Se añadió a propósito en `af71a2e` para comprobar que la revisión detecta credenciales en el código, y se quitó con `git revert` en `351cf31`.

### Lecciones

- **Los workflows tienen que estar en `master` antes de que funcionen del todo.** En el PR #5, el que los añadía, las 3 ejecuciones de la revisión terminaron bien pero no publicaron comentario, y las menciones a `@claude` quedaron sin respuesta. Lo de `@claude` tiene una causa segura: los eventos de comentario (`issue_comment`) siempre ejecutan la versión del workflow que hay en la rama por defecto, y ahí todavía no existía. Lo de la revisión, probablemente, se debe a que `claude-code-action` no actúa si el archivo del workflow no coincide con el de la rama por defecto. Desde el merge del PR #5, las dos cosas funcionan.
- **Un revert no borra un secreto.** El commit que lo añadió sigue en el historial de `master`, porque el PR #6 se mergeó con un merge commit. Con una credencial real habría que rotarla. Para que no llegue a `master`, usa "Squash and merge".
