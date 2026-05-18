---
name: dead-code-detector
description: Analiza el proyecto actual para detectar y eliminar código muerto: archivos no importados, funciones no llamadas, variables no usadas, exports sin consumidores, dependencias no utilizadas, rutas sin controlador, componentes React sin uso, tipos TypeScript huérfanos y comentarios de código obsoleto. Úsalo cuando el usuario diga "busca código muerto", "limpia el proyecto", "hay código que no se usa", "elimina lo que sobra", "audita el código", "refactoriza el proyecto", "código sin usar", "dependencias innecesarias" o "limpia imports". También actívalo si el usuario pregunta por el tamaño del bundle o quiere optimizar el proyecto antes de salir a producción.
---

# Dead Code Detector

Analiza el proyecto completo en busca de código que no se esté utilizando. Lee primero, reporta después, elimina solo con confirmación del usuario.

---

## Fase 1: Mapear el proyecto

```bash
# Estructura general
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path '*/node_modules/*' ! -path '*/dist/*' ! -path '*/build/*' \
  ! -path '*/.next/*' ! -path '*/coverage/*' \
  | sort

# Contar archivos por tipo
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path '*/node_modules/*' ! -path '*/dist/*' \
  | wc -l
```

---

## Fase 2: Detección automática con herramientas

### 2.1 Variables y exports no usados — TypeScript

```bash
# Verifica si hay tsconfig
cat tsconfig.json 2>/dev/null || cat tsconfig.*.json 2>/dev/null || true
```

Activa estas reglas en `tsconfig.json` si no están (solo para el análisis, revertir después si el usuario no las quiere permanentes):

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

```bash
# Compila y captura todos los warnings de código no usado
pnpm exec tsc --noEmit 2>&1 | grep -E "(is declared but|is defined but|never read|never used)" | sort
```

### 2.2 Dependencias no utilizadas

```bash
# Instalar si no existe
pnpm exec depcheck --json 2>/dev/null || pnpm add -g depcheck && depcheck --json
```

Si `depcheck` no está disponible:

```bash
# Alternativa manual: lista deps del package.json vs imports en el código
cat package.json | grep -A 100 '"dependencies"' | grep -E '^\s+"[^"]+":' | sed 's/[^"]*"\([^"]*\)".*/\1/' > /tmp/deps_list.txt

# Por cada dependencia, busca si hay algún import/require de ella
while read dep; do
  count=$(grep -r "from ['\"]${dep}" src/ 2>/dev/null | wc -l)
  count2=$(grep -r "require(['\"]${dep}" src/ 2>/dev/null | wc -l)
  total=$((count + count2))
  if [ "$total" -eq 0 ]; then
    echo "SIN USO: $dep"
  fi
done < /tmp/deps_list.txt
```

### 2.3 Archivos no importados en ningún lado

```bash
# Lista todos los archivos fuente
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -name "*.d.ts" \
  ! -name "*.test.*" \
  ! -name "*.spec.*" \
  | sort > /tmp/all_files.txt

# Para cada archivo verifica si alguien lo importa
while read filepath; do
  # Extrae el nombre base sin extensión
  basename=$(basename "$filepath" | sed 's/\.[^.]*$//')
  dirname=$(dirname "$filepath")

  # Busca imports de este archivo en todo el proyecto
  count=$(grep -r "from.*['\"].*${basename}['\"]" src/ 2>/dev/null | grep -v "^${filepath}" | wc -l)
  count2=$(grep -r "import.*['\"].*${basename}['\"]" src/ 2>/dev/null | grep -v "^${filepath}" | wc -l)
  total=$((count + count2))

  if [ "$total" -eq 0 ]; then
    # Excluir entry points conocidos
    case "$basename" in
      main|index|app|server|App|router|setup) ;;
      *) echo "SIN IMPORTAR: $filepath" ;;
    esac
  fi
done < /tmp/all_files.txt
```

### 2.4 Funciones exportadas que nadie consume

```bash
# Busca exports en todos los archivos
grep -rn "^export const\|^export function\|^export class\|^export type\|^export interface\|^export enum" \
  src/ --include="*.ts" --include="*.tsx" \
  | grep -v "\.test\.\|\.spec\." \
  | while IFS=: read file line content; do
      # Extrae el nombre exportado
      name=$(echo "$content" | grep -oE "(const|function|class|type|interface|enum) [A-Za-z_][A-Za-z0-9_]*" | awk '{print $2}')
      if [ -n "$name" ]; then
        # Cuenta referencias fuera del archivo donde está definido
        count=$(grep -r "\b${name}\b" src/ 2>/dev/null | grep -v "^${file}" | grep -v "export " | wc -l)
        if [ "$count" -eq 0 ]; then
          echo "EXPORT SIN CONSUMIDOR: ${name} en ${file}:${line}"
        fi
      fi
  done 2>/dev/null | sort
```

### 2.5 Imports no usados en cada archivo

```bash
# ESLint con regla no-unused-vars si hay configuración
cat .eslintrc* 2>/dev/null || cat eslint.config.* 2>/dev/null || true

pnpm exec eslint src/ --rule '{"@typescript-eslint/no-unused-vars": "warn"}' \
  --ext .ts,.tsx --format compact 2>/dev/null \
  | grep "no-unused-vars\|@typescript-eslint/no-unused-vars" \
  | sort
```

### 2.6 Rutas del backend sin controlador o sin ruta definida

```bash
# Controladores definidos
ls src/controllers/ 2>/dev/null

# Controladores registrados en routes
grep -r "controller\|Controller" src/routes/ 2>/dev/null | grep "import" | sort

# Detectar controladores importados pero no usados en rutas
grep -rn "import.*controller" src/routes/ 2>/dev/null \
  | while IFS=: read file line content; do
      ctrl=$(echo "$content" | grep -oE "[A-Za-z]+Controller")
      if [ -n "$ctrl" ]; then
        count=$(grep -c "\b${ctrl}\b" "$file" 2>/dev/null)
        if [ "$count" -le 1 ]; then
          echo "CONTROLADOR IMPORTADO SIN USO: ${ctrl} en ${file}"
        fi
      fi
  done
```

### 2.7 Componentes React sin uso

```bash
# Lista de componentes definidos (archivos con PascalCase)
find src -type f -name "*.tsx" \
  ! -path '*/pages/*' \
  ! -path '*/router/*' \
  ! -name "*.test.*" \
  | while read f; do
      comp=$(basename "$f" .tsx)
      # Solo PascalCase
      if echo "$comp" | grep -qE '^[A-Z]'; then
        count=$(grep -r "\b${comp}\b" src/ 2>/dev/null | grep -v "^${f}" | grep -v "export " | wc -l)
        if [ "$count" -eq 0 ]; then
          echo "COMPONENTE SIN USO: ${comp} en ${f}"
        fi
      fi
  done
```

### 2.8 Tipos e interfaces TypeScript huérfanos

```bash
grep -rn "^export type \|^export interface " \
  src/ --include="*.ts" --include="*.tsx" \
  | while IFS=: read file line content; do
      name=$(echo "$content" | grep -oE "(type|interface) [A-Za-z_][A-Za-z0-9_<>]*" | awk '{print $2}' | sed 's/<.*//')
      if [ -n "$name" ]; then
        count=$(grep -r "\b${name}\b" src/ 2>/dev/null | grep -v "^${file}" | grep -v "^export " | wc -l)
        if [ "$count" -eq 0 ]; then
          echo "TIPO HUÉRFANO: ${name} en ${file}:${line}"
        fi
      fi
  done 2>/dev/null | sort
```

### 2.9 Código comentado (bloques de código, no documentación)

```bash
# Busca bloques de código comentado (líneas que empiezan con // seguido de código)
grep -rn "^\s*\/\/ \(const\|let\|var\|function\|import\|export\|return\|if\|for\|while\|class\)" \
  src/ --include="*.ts" --include="*.tsx" \
  | grep -v "\.test\.\|\.spec\." \
  | head -50
```

### 2.10 Archivos de configuración y scripts obsoletos

```bash
# Archivos que probablemente no se usen
find . -maxdepth 2 -type f \( \
  -name "*.bak" -o \
  -name "*.old" -o \
  -name "*.backup" -o \
  -name "*.tmp" -o \
  -name "*.orig" \
\) ! -path '*/node_modules/*'

# Scripts en package.json que referencian archivos inexistentes
cat package.json | grep -A 30 '"scripts"' | grep -oE '"[^"]+\.(?:ts|js|sh)"' \
  | while read scriptfile; do
      clean=$(echo $scriptfile | tr -d '"')
      [ ! -f "$clean" ] && echo "SCRIPT APUNTA A ARCHIVO INEXISTENTE: $clean"
  done 2>/dev/null
```

---

## Fase 3: Análisis manual de patrones comunes

Lee los siguientes archivos y busca manualmente estos patrones:

### En archivos de utilidades (`utils/`, `lib/`, `helpers/`)
- Funciones helper que se escribieron "por si acaso" pero no se llaman en ningún lado
- Funciones duplicadas (mismo comportamiento con distinto nombre)

### En modelos / tipos
- Campos en schemas de Mongoose que no se usan en ningún servicio ni controller
- Tipos TypeScript definidos en `types/index.ts` que no se importan en ningún archivo

### En el frontend
- Páginas en `pages/` que no están registradas en el router
- Hooks en `hooks/` que no se usan en ningún componente
- Context providers que se definen pero no se consumen con `useContext`

### En el backend
- Middlewares definidos en `middlewares/` que no se aplican en ninguna ruta
- Variables de entorno en `env.ts` que se validan pero no se usan en el código
- Jobs de `node-cron` registrados pero cuya función no hace nada real

---

## Fase 4: Reporte consolidado

Presenta el reporte con este formato exacto:

```
## Reporte de código muerto

### 🔴 Eliminar con seguridad (sin riesgo)
Archivos, funciones o imports que definitivamente no se usan y no tienen efecto secundario.

| Tipo | Elemento | Archivo | Línea |
|------|----------|---------|-------|
| Archivo | utils/oldHelper.ts | — | — |
| Función | formatDateOld() | src/lib/utils.ts | 45 |
| Import | import { X } from '...' | src/... | 3 |

### 🟡 Revisar antes de eliminar (posible uso dinámico)
Elementos que podrían usarse de forma dinámica (string interpolation, require() dinámico, reflexión).

| Tipo | Elemento | Archivo | Motivo para revisar |
|------|----------|---------|---------------------|
| Función | getHandler() | src/... | Podría llamarse con string dinámico |

### 🟠 Dependencias no utilizadas
| Paquete | Tipo | Acción sugerida |
|---------|------|-----------------|
| lodash | dependencies | pnpm remove lodash |

### 🟣 Código comentado encontrado
| Archivo | Líneas | Contenido |
|---------|--------|-----------|

### ⚪ Ignorar (falsos positivos)
Elementos que parecen no usarse pero son necesarios:
- Entry points (main.ts, server.ts, index.ts)
- Archivos de configuración (jest.config.ts, vite.config.ts)
- Declaraciones de tipos globales (*.d.ts)
- Re-exports en archivos index.ts
- Handlers de eventos registrados dinámicamente

---
Total detectado: X elementos
Reducción estimada: ~X archivos, ~X líneas, ~X dependencias
```

---

## Fase 5: Eliminar con confirmación

**NUNCA eliminar nada sin mostrar primero el reporte y esperar confirmación del usuario.**

Cuando el usuario confirme qué eliminar, proceder en este orden:

### Orden seguro de eliminación

1. **Primero:** imports no usados dentro de archivos (menos riesgo)
2. **Segundo:** variables y funciones no usadas dentro de archivos existentes
3. **Tercero:** archivos completos no importados
4. **Cuarto:** dependencias (`pnpm remove [paquete]`)
5. **Último:** código comentado

### Para cada eliminación

```bash
# Antes de eliminar un archivo, verificar una última vez
grep -r "NombreArchivo\|nombreArchivo" src/ --include="*.ts" --include="*.tsx"

# Eliminar el archivo
rm src/ruta/al/archivo.ts

# Verificar que el proyecto sigue compilando
pnpm exec tsc --noEmit

# Verificar que los tests siguen pasando
pnpm test -- --passWithNoTests
```

Si `tsc` o los tests fallan después de una eliminación, **detener inmediatamente** y reportar al usuario qué se rompió antes de continuar.

---

## Fase 6: Verificación final

Después de todas las eliminaciones confirmadas:

```bash
# Compilación limpia
pnpm exec tsc --noEmit && echo "✓ TypeScript OK"

# Tests
pnpm test -- --passWithNoTests && echo "✓ Tests OK"

# Linter
pnpm lint && echo "✓ Lint OK"

# Bundle size (frontend)
pnpm build 2>&1 | grep -E "dist|chunk|gzip|kB|MB" || true
```

Presenta el resumen final:

```
## Limpieza completada ✓

Eliminado:
  - X archivos
  - X funciones / variables
  - X imports
  - X dependencias
  - X líneas de código comentado

Resultado:
  ✓ TypeScript compila sin errores
  ✓ Tests pasan
  ✓ Lint sin warnings nuevos
  ✓ Bundle: [antes] → [después] (si aplica)
```

---

## Reglas estrictas

1. **Nunca eliminar sin reporte previo** — siempre mostrar qué se encontró antes de tocar nada
2. **Nunca eliminar entry points** — `main.ts`, `server.ts`, `index.ts`, `app.ts` aunque parezcan no importados
3. **Nunca eliminar archivos `*.d.ts`** — son declaraciones de tipos globales
4. **Nunca eliminar re-exports** — un `index.ts` que solo reexporta puede parecer sin uso pero es la interfaz pública del módulo
5. **Verificar TypeScript después de cada eliminación** — si falla, revertir antes de continuar
6. **Los tests son la red de seguridad** — si un test falla después de eliminar algo, ese "código muerto" no lo era
7. **Marcar como dudoso** cualquier elemento que se llame con strings dinámicos, `require()` dinámico o reflexión
