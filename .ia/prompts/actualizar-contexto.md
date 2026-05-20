# Actualizar Contexto del Proyecto

## Objetivo

Analizar los cambios del día usando git, actualizar todos los archivos de contexto
y dejar el proyecto listo para la próxima sesión.

---

## Paso 1: Obtener timestamp actual

```bash
date "+%Y-%m-%d %H:%M"
```

Guarda este valor — lo usarás en todos los archivos que actualices.

---

## Paso 2: Detectar cambios recientes con git

```bash
# Ver los últimos commits (cambios ya commiteados hoy)
git log --oneline --since="24 hours ago" 2>/dev/null || git log --oneline -10

# Ver cambios no commiteados (trabajo en progreso)
git diff --stat 2>/dev/null

# Ver archivos nuevos no trackeados
git status --short 2>/dev/null

# Ver el diff completo de los últimos cambios para entender qué se modificó
git diff HEAD~1 --stat 2>/dev/null || git diff --stat 2>/dev/null
```

Si git no está inicializado:
```bash
# Alternativa sin git: listar archivos modificados recientemente
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path '*/node_modules/*' ! -path '*/dist/*' \
  -newer .ai/context/current-state.md 2>/dev/null | sort
```

---

## Paso 3: Analizar qué cambió

Con base en el git diff, detecta:

- **Nuevos archivos de modelo** → nuevo modelo en MongoDB
- **Nuevos archivos de service** → nueva lógica de negocio
- **Nuevos archivos de route/controller** → nuevo endpoint
- **Nuevos archivos en features/** → nuevo módulo frontend
- **Nuevos archivos en pages/** → nueva página
- **Cambios en permissions.ts** → nuevos permisos o roles
- **Cambios en tests/** → tests agregados o modificados
- **Cambios en docker-compose/Dockerfile** → infraestructura
- **Cambios en package.json** → nuevas dependencias
- **Corrección de bugs** → archivos modificados con "fix" en el commit

---

## Paso 4: Correr tests para capturar estado actual

```bash
# Backend
cd backend && pnpm test -- --coverage --passWithNoTests 2>&1 | tail -30

# Frontend
cd frontend && pnpm test -- --coverage --passWithNoTests 2>&1 | tail -30
```

---

## Paso 5: Actualizar archivos de contexto

### 5a. Actualizar `current-state.md` (SOBREESCRIBIR COMPLETO)

Reemplaza TODO el contenido con el estado actual real del proyecto.
Agrega al inicio: `> Última actualización: [timestamp del Paso 1]`

Reglas:
- Solo incluye lo que realmente existe en el código
- Mueve items completados de "en progreso" a "completado"
- Detecta bugs activos del git diff o tests fallando

### 5b. Actualizar `pending.md` (SOBREESCRIBIR COMPLETO)

- Marca como ✅ las tareas que detectaste completadas en el diff
- Mueve los ✅ a la tabla "Completados recientemente" con la fecha
- Actualiza estados: ⚪ → 🟡 si están en progreso
- Agrega nuevas tareas detectadas en el diff que no estaban en la lista
- Actualiza el timestamp al inicio

### 5c. Agregar entrada al `changelog.md` (APPEND AL INICIO — nunca borrar)

Inserta una nueva entrada DESPUÉS de la línea `<!-- La IA inserta nuevas entradas AQUÍ -->` con el formato:

```markdown
### [YYYY-MM-DD] — [Resumen de una línea de lo que se hizo]

**Backend:**
- feat/fix/refactor: descripción concisa

**Frontend:**
- feat/fix/refactor: descripción concisa

**Base de datos:**
- (si aplica)

**Tests:**
- (si aplica)

**Decisiones tomadas:**
- (si aplica, referencia a decisions.md)
```

### 5d. Actualizar `test-status.md` (SOBREESCRIBIR tabla de resumen)

Solo actualiza los números de la tabla de resumen y la sección "Últimos tests fallando".
NO borres la lista de tests críticos que deben existir.

### 5e. Agregar a `decisions.md` (APPEND AL FINAL — NUNCA sobreescribir)

Solo si se tomó una decisión técnica importante hoy.
Agregar DEBAJO de la línea `<!-- La IA agrega nuevas decisiones DEBAJO de esta línea -->`.
Si no hubo decisiones nuevas, NO tocar este archivo.

### 5f. Actualizar `project-summary.md`

Solo actualiza:
- La línea de "Última actualización"
- Los checkboxes de módulos implementados
- La línea de "Estado general del proyecto"

NO tocar la descripción general ni las tecnologías.

---

## Paso 6: Commit automático del contexto

```bash
cd .ai
git add context/
git commit -m "chore(context): actualizar contexto IA — [fecha]" 2>/dev/null || true
```

Si no hay nada que commitear, está bien — significa que no hubo cambios detectados.

---

## Paso 7: Confirmar al usuario

```
## Contexto actualizado ✓

Fecha: [timestamp]

Cambios detectados hoy:
- [lista de los cambios principales del git diff]

Archivos de contexto actualizados:
- ✓ current-state.md
- ✓ pending.md — [N] tareas completadas, [N] nuevas agregadas
- ✓ changelog.md — nueva entrada agregada
- ✓ test-status.md — [N passing / N failing]
- [✓/—] decisions.md — [nueva decisión agregada / sin cambios]

Tests: [N passing] [N failing]
[⚠️ Tests fallando: lista si los hay]

Para comenzar la próxima sesión ejecuta: /cargarcontexto
```

---

## Reglas estrictas

1. **NUNCA sobreescribir `decisions.md`** — solo append al final
2. **NUNCA sobreescribir `architecture.md`** — solo el usuario puede editarlo manualmente
3. **NUNCA sobreescribir `changelog.md`** — solo insertar al inicio
4. **SIEMPRE incluir timestamp** en los archivos que se sobreescriben
5. **NO copiar código fuente** en los archivos de contexto — solo descripciones
6. **Mantener contexto corto** — máximo 3-4 líneas por item en current-state.md
7. **Si git no está disponible**, usar find para detectar archivos modificados recientemente
