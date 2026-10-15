# Wordstep

Página gratuita de práctica de inglés B1+ para estudiantes hispanohablantes. Adaptada a celulares, sin audio, sin micrófono, sin cuentas de estudiante y sin dependencias de JavaScript.

- 60 palabras con traducciones y ejemplos contextualizados.
- Tarjetas, buscador, filtros y juego de parejas.
- 40 ejercicios explicados: wish, second conditional, past modals of deduction y WH questions.
- Simulacro de 12 preguntas equilibrado entre los cuatro temas.
- Repaso de errores y 8 propuestas de expresión oral con borradores y respuestas modelo.
- Progreso en localStorage por navegador, sin sincronización ni envío de respuestas.

## Uso local

Abre `dist/index.html`, o ejecuta `python3 -m http.server 8080 --directory dist` y visita `http://localhost:8080`.

## GitHub Pages

El flujo incluido publica `dist/`. En Settings → Pages, selecciona **GitHub Actions** como fuente. Haz push a `main` o ejecuta el flujo manualmente.

El contenido funciona sin servicios externos. Las fuentes de Google Fonts son opcionales: si no cargan se usan fuentes del dispositivo. Las respuestas orales son de autoevaluación y no reciben una nota automática.

## Crear el repositorio y publicar automáticamente

Desde una terminal con acceso a internet:

```bash
bash /home/diego/Ingles/wordstep/publish-github.sh
```

El script descarga GitHub CLI oficial si hace falta, inicia la autorización por navegador, crea el repositorio público `wordstep` en la cuenta autenticada y activa GitHub Pages. No necesita que compartas tu contraseña. Si el repositorio ya existe, lo reutiliza; nunca fuerza un push. Si falta el permiso `workflow` en una sesión antigua, ejecuta `gh auth refresh -h github.com -s workflow` y vuelve a ejecutar el script.

## Verificación

`node tests/practice.cjs` comprueba contenido, puntuación, prevención de respuestas repetidas, repaso de errores, filtros, emparejamiento y persistencia con un DOM simulado. No sustituye a la revisión visual en un navegador.
