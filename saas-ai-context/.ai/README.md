# Sistema de Contexto IA — SaaS Inventory

Sistema de memoria persistente para mantener el contexto del proyecto entre sesiones de desarrollo con IA.

---

## Comandos disponibles (OpenCode)

| Comando | Cuándo usarlo |
|---------|---------------|
| `/cargarcontexto` | **Al inicio de cada sesión** — carga arquitectura, estado actual y pendientes |
| `/actualizarcontexto` | **Al terminar el día** — detecta cambios con git y actualiza todos los archivos |
| `/exportarcontexto` | **Al cambiar de IA** — genera `claude-ready.md` compacto para otra herramienta |

---

## Estructura de archivos

```
.ai/
├── context/
│   ├── architecture.md      ← Estable. Stack, jerarquía, patrones. Rara vez cambia.
│   ├── current-state.md     ← Se sobreescribe en cada /actualizarcontexto con timestamp.
│   ├── project-summary.md   ← Resumen ejecutivo. Se actualiza conforme avanza el proyecto.
│   ├── pending.md           ← Tareas con prioridad (P1/P2/P3) y estado. Se sobreescribe.
│   ├── decisions.md         ← APPEND ONLY. Historial de decisiones técnicas. Nunca se borra.
│   ├── changelog.md         ← APPEND ONLY. Historial de cambios por fecha. Nunca se borra.
│   ├── test-status.md       ← Estado de tests y cobertura. Se actualiza en cada sesión.
│   └── claude-ready.md      ← Generado por /exportarcontexto. Contexto compacto combinado.
├── prompts/
│   ├── cargar-contexto.md   ← Instrucciones detalladas para cargar contexto
│   ├── actualizar-contexto.md ← Instrucciones detalladas para actualizar contexto
│   └── exportar-contexto.md ← Instrucciones para generar claude-ready.md
└── commands/
    ├── cargarcontexto.md    ← Slash command de OpenCode
    ├── actualizarcontexto.md ← Slash command de OpenCode
    └── exportarcontexto.md  ← Slash command de OpenCode
```

---

## Flujo de trabajo recomendado

```
Inicio del día
    └── /cargarcontexto
          ↓
    La IA lee el contexto y presenta resumen
          ↓
    Desarrollas normalmente...
          ↓
Final del día
    └── git add . && git commit -m "feat: lo que hiciste"
          ↓
    /actualizarcontexto
          ↓
    La IA detecta cambios y actualiza toda la memoria
```

---

## Reglas importantes

- **`decisions.md` y `changelog.md` son append-only** — la IA nunca borra entradas existentes
- **`architecture.md` solo lo editas tú** — la IA no lo modifica automáticamente
- **Esta carpeta va en Git** — es parte del proyecto, no en .gitignore
- **Hacer commit antes de `/actualizarcontexto`** — el sistema usa `git diff HEAD~1` para detectar cambios

---

## Configuración de OpenCode

Los comandos en `.ai/commands/` funcionan como slash commands si OpenCode los detecta
en el directorio del proyecto. Si prefieres tenerlos globales:

```bash
cp .ai/commands/*.md ~/.opencode/commands/
```
