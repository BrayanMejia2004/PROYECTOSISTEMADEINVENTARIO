---
name: actualizarcontexto
description: Analiza los cambios del día con git diff, actualiza todos los archivos de contexto del proyecto y deja la memoria lista para la próxima sesión. Úsalo al terminar la jornada de desarrollo, cuando digas "actualiza el contexto", "guarda el progreso", "documenta lo que hice hoy", "actualiza la memoria del proyecto" o antes de cerrar la sesión.
---

# Actualizar Contexto del Proyecto

## Paso 1: Verificar ubicación y obtener timestamp

```bash
# Verificar que estamos en la raíz del proyecto
ls .ai/context/ 2>/dev/null || echo "ERROR: Abre OpenCode desde la raíz del proyecto"

# Obtener timestamp actual
date "+%Y-%m-%d %H:%M"
```

Guarda el timestamp — lo usarás en todos los archivos actualizados.

## Paso 2: Detectar cambios con git

```bash
# Commits de las últimas 24 horas
git log --oneline --since="24 hours ago"

# Comparar con el commit anterior
git diff HEAD~1 --stat 2>/dev/null

# Cambios no commiteados aún
git diff --stat
git status --short

# Ver qué cambió realmente en el código
git diff HEAD~1 -- "*.ts" "*.tsx" 2>/dev/null | head -200
```

Si git no está disponible:
```bash
# Alternativa: archivos modificados recientemente
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path '*/node_modules/*' ! -path '*/dist/*' ! -path '*/.next/*' \
  -newer .ai/context/current-state.md 2>/dev/null | sort
```

## Paso 3: Correr tests para capturar estado actual

```bash
cd backend && pnpm test -- --coverage --passWithNoTests 2>&1 | tail -20
cd ../frontend && pnpm test -- --coverage --passWithNoTests 2>&1 | tail -20
```

## Paso 4: Actualizar archivos de contexto

### 4a. Sobreescribir `current-state.md` con timestamp

Reemplaza el contenido completo. Incluye al inicio:
`> Última actualización: [timestamp del Paso 1]`

Documenta el estado REAL detectado en el git diff:
- Qué modelos existen en `src/models/`
- Qué endpoints existen en `src/routes/`
- Qué páginas/features existen en el frontend
- Bugs activos encontrados
- Notas de la sesión

### 4b. Sobreescribir `pending.md` con timestamp

- Marca ✅ las tareas completadas detectadas en el diff
- Mueve los ✅ a "Completados recientemente" con fecha de hoy
- Cambia ⚪ → 🟡 si están en progreso
- Agrega tareas nuevas detectadas que no estaban listadas
- Actualiza el timestamp al inicio

### 4c. Agregar entrada al `changelog.md` (APPEND — nunca borrar)

Inserta una nueva entrada AL INICIO del changelog (después del comentario `<!-- La IA inserta nuevas entradas AQUÍ -->`):

```markdown
### [YYYY-MM-DD] — [Resumen de una línea]

**Backend:**
- feat/fix/refactor: descripción concisa

**Frontend:**
- feat/fix/refactor: descripción concisa

**Base de datos:**
- (si aplica)

**Tests:**
- (si aplica)

**Decisiones tomadas:**
- (referencia a decisions.md si aplica)
```

### 4d. Actualizar tabla de resumen en `test-status.md`

Solo actualiza los números de la tabla y la sección "Últimos tests fallando".
NO borres la lista de tests críticos.

### 4e. Agregar a `decisions.md` SOLO si hubo decisión nueva (APPEND — nunca borrar)

Si se tomó una decisión técnica importante hoy, agregar AL FINAL del archivo.
Si no hubo decisiones nuevas, NO tocar este archivo.

### 4f. Actualizar checkboxes en `project-summary.md`

Marca los módulos completados detectados en el diff.
Actualiza el estado general y el timestamp.

## Paso 5: Commit automático del contexto

```bash
git add .ai/context/
git commit -m "chore(context): actualizar contexto IA — $(date '+%Y-%m-%d')" 2>/dev/null || true
```

## Paso 6: Confirmar al usuario

```
## Contexto actualizado ✓

Fecha: [timestamp]

Cambios detectados hoy:
- [lista de los cambios principales del git diff]

Archivos actualizados:
- ✓ current-state.md
- ✓ pending.md — [N] completadas, [N] nuevas
- ✓ changelog.md — nueva entrada agregada
- ✓ test-status.md
- [✓/—] decisions.md

Tests: [N passing / N failing]
[⚠️ si hay tests fallando, listarlos]

Para comenzar la próxima sesión: /cargarcontexto
```

## Reglas estrictas

1. NUNCA sobreescribir `decisions.md` — solo append al final
2. NUNCA sobreescribir `architecture.md` — solo el usuario lo edita
3. NUNCA sobreescribir `changelog.md` — solo insertar al inicio
4. SIEMPRE incluir timestamp en los archivos que se sobreescriben
5. NO copiar código fuente en los archivos de contexto — solo descripciones
6. Mantener contexto corto — máximo 3-4 líneas por item
