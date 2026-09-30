---
name: start-task
description: Sincroniza master, crea una rama para la tarea e inicia el trabajo con un plan aprobado.
argument-hint: <descripción de la tarea>
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git fetch *) Bash(git branch *) Bash(git log *)
---

<estado_actual>
Rama actual: !`git branch --show-current`

Cambios pendientes:
!`git status --short`
</estado_actual>

<tarea>
$ARGUMENTS
</tarea>

<proceso_git>

1. Revisa <estado_actual>. Si hay cambios sin commitear o archivos sin
   rastrear, DETENTE y muéstramelos. No hagas stash, reset ni checkout
   que descarte trabajo.
2. Cambia a master y sincroniza: `git checkout master`, `git fetch origin`,
   `git pull --ff-only`. Si el pull no es fast-forward, detente y
   explícame la divergencia.
3. Propón el nombre de la rama con el formato `<tipo>/<descripcion>`,
   donde tipo es feat, fix, docs, test o chore. Espera a que lo confirme
   y luego créala con `git checkout -b`.
4. Verifica con `git branch --show-current` que estás en la rama nueva.

</proceso_git>

<forma_de_trabajo>

- Antes de modificar archivos, muéstrame un plan breve y espera mi aprobación.
- Haz commits pequeños con Conventional Commits sin scope, por ejemplo
  `feat: ...` o `fix: ...`.
- No hagas push ni abras un PR sin que te lo pida.
- Al terminar, muestra `git log --oneline -5` y los archivos modificados.

</forma_de_trabajo>
