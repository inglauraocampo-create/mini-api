## Claude Starter README

## Skills de Claude Code

- `/test [filtro]`: corre los tests con Vitest y, si algo falla, diagnostica la causa sin modificar código.
- `/diff-review [foco]`: revisa el diff local (`git diff HEAD` + archivos sin trackear) contra una checklist de tipos, manejo de errores, tests faltantes y secretos, y devuelve una tabla de severidad.
  - Se llama `diff-review` y no `review` ni `code-review` porque ambos nombres ya son comandos integrados de Claude Code.
- `/changelog [versión]`: actualiza `CHANGELOG.md` (formato Keep a Changelog) con los commits desde el último tag, agrupados por tipo de Conventional Commit. Solo se ejecuta a mano (`disable-model-invocation`), porque escribe archivos.
- `/start-task <descripción>`: sincroniza `master`, propone y crea una rama `<tipo>/<descripcion>` y arranca la tarea con un plan que tienes que aprobar. Solo se ejecuta a mano.
