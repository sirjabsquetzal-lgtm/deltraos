# DeltraOS — cómo instalarla en tu Android con Brave

Esta carpeta (`deltraos/`) es la app completa: HTML/CSS/JS plano, sin build,
sin dependencias externas. Todo el estado (planes, trades, movimientos,
ajustes) vive en el propio teléfono — `localStorage` para los datos y
`IndexedDB` para imágenes/audio (fotos de Sueños, capturas de trade, pista
de meditación). No hay backend ni sincronización entre dispositivos.

## 1. Súbela a algún hosting estático

Un PWA solo se puede "instalar" (ícono + pantalla completa + funciona sin
internet) si se sirve por **http(s)**, no abriendo el archivo directamente.
Opciones, de más simple a más control:

- **GitHub Pages** (recomendado si ya usas GitHub): crea o usa un repo,
  sube el contenido de esta carpeta a la rama que sirvas con Pages
  (normalmente `main` o `gh-pages`, activándolo en
  *Settings → Pages*), y tu URL queda como
  `https://<usuario>.github.io/<repo>/`. Exactamente como subiste
  `WealthOS` a mano — aquí es el mismo procedimiento, solo que con estos
  archivos.
- **Netlify / Vercel / Cloudflare Pages**: arrastra la carpeta a su panel
  de "deploy manual" — no requieren cuenta de git.
- **Servidor local en el teléfono** (Termux + `python3 -m http.server`, o
  cualquier app de servidor estático): útil si no quieres depender de
  internet en absoluto; abre `http://localhost:<puerto>/index.html` en
  Brave desde el propio equipo.

No importa cuál elijas — la app es 100% estática, cualquier hosting de
archivos sirve.

## 2. Instálala desde Brave (Android)

1. Abre la URL en Brave.
2. Menú (⋮) → **Instalar app** (o el aviso que aparece solo abajo).
3. Confirma. Queda en tu launcher con su propio ícono, sin barra de
   navegador, y sigue funcionando sin internet gracias al service worker
   (`sw.js`) que cachea la app la primera vez que la abres.

Si actualizas los archivos en el hosting más adelante, sube el `sw.js`
con el `CACHE_NAME` incrementado (por ejemplo `deltraos-v2`) para que el
teléfono jale la versión nueva en vez de servir la cacheada.

## 3. Qué contiene la carpeta

```
index.html              shell + estilos (tema Paper/Black, tipografía, grid)
app.js                  toda la lógica: estado, cálculos del plan, sesiones
                         NY/Tokio, flujo de trade, i18n ES/EN, render
manifest.webmanifest     metadatos de instalación (ícono, colores, modo standalone)
sw.js                    cache de app-shell para uso offline
icon-192.png / icon-512.png / icon-maskable.png   íconos generados
assets/dreams/*.png      las 7 fotos precargadas del tab Sueños
```

## 4. Decisiones tomadas al pasar del prototipo a la app real

- **Resultado del trade ya no viene pre-marcado en "Ganancia".** En el
  prototipo el estado inicial traía `Profit` seleccionado por defecto;
  aquí Finalizar exige elegir Ganancia o Pérdida explícitamente — con
  dinero real de por medio, un trade nunca debe registrarse solo porque
  no tocaste el botón.
- **Elegir un plan en la hoja "Nuevo trade" también lo activa.** En el
  boceto ese selector no estaba conectado a los cálculos (siempre usaba
  el plan ya activo); aquí sí cambia cuál plan manda en riesgo/TP,
  igual que dice el texto de la propia hoja.
- **Entrada/SL/TP en Registrar trade llevan una nota de "valores de
  partida".** Se siguen precargando desde el riesgo del día (no hay feed
  de precio real), pero ahora se avisa que hay que ajustarlos al precio
  real de tu fill.
- **La captura de pantalla y la portada del trade sí se guardan** (vía
  IndexedDB) — en el boceto era solo un rectángulo decorativo.
- **Tipografía:** en vez de Doto/Chivo Mono por Google Fonts, se usan
  fuentes del sistema (mono tabular para números/labels) para que la
  instalación funcione sin conexión desde el primer arranque, sin
  depender de que Google Fonts responda. La retícula de puntos, el
  rojo/negro/gris/blanco y los bordes a 0 se mantienen igual.
- El resto — sesiones NY/Tokio con tu zona horaria, plan compuesto con
  meta y goal, depósitos/retiros con rebase opcional, bloqueo de sesión
  tras una pérdida, checklist de los 4 pasos con selectores visuales,
  BE, Sueños con collage editable, ajustes de idioma/tema/instrumentos —
  sigue el comportamiento acordado en las conversaciones de diseño.

## 5. Limitaciones a tener en cuenta

- Los datos son **por navegador y por dispositivo** — instalarla en dos
  teléfonos (o borrar datos del sitio en Brave) da dos historiales
  independientes. Si más adelante quieres respaldo/sincronización real
  entre dispositivos, eso ya requiere un backend.
- `localStorage` tiene un límite de unos 5–10 MB; como las fotos y el
  audio van aparte en IndexedDB (con cupo mucho mayor), esto no debería
  ser un problema salvo un historial de trades verdaderamente enorme.
