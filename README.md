# rgdev-plantilla

Plantilla de webs para negocios locales (clínicas, centros de belleza, comercios) de **rgdev.studio**.
Astro 7 con salida 100 % estática, CSS propio con design tokens y JS vanilla. Se despliega en Cloudflare Pages.

- **3 variantes** con diseño propio: `salud`, `belleza` y `comercio`.
- **Todo sale de un JSON**: `src/content/site.config.json`, validado con Zod en cada build.
- **12 secciones** que se activan, desactivan y reordenan desde el JSON, además de páginas legales, SEO local, sitemap y robots.
- Lighthouse en móvil sobre los ejemplos: 99–100 en Performance, Accessibility, Best Practices y SEO.

---

## La regla de oro: qué es del cliente y qué es de la plantilla

| Del **cliente** (lo único que se toca) | De la **plantilla** (no tocar en un repo de cliente) |
| --- | --- |
| `src/content/site.config.json`: todos los datos y textos | `src/components/`, `src/layouts/`, `src/pages/` |
| `src/assets/cliente/`: logo y fotos (se optimizan) | `src/themes/`, `src/styles/`, `src/lib/`, `src/scripts/`, `src/i18n/` |
| `public/cliente/`: favicon, vídeo del hero y archivos sin optimizar | `examples/`, `scripts/`, configuración y este README |

Si algo de un cliente no se puede hacer desde el JSON, **es un fallo de la plantilla**. Arréglalo aquí, en
`rgdev-plantilla`, y llévalo al cliente con un merge (ver más abajo). No lo parchees en el repo del cliente.

---

## Comandos

```bash
npm install
npm run dev              # usa src/content/site.config.json
npm run dev:salud        # previsualiza examples/salud.json
npm run dev:belleza
npm run dev:comercio
npm run build            # genera dist/ con el config del cliente
npm run build:ejemplos   # compila los tres ejemplos (comprobación)
npm run check            # valida el config + astro check (tipos)
npm run check:todos      # valida el config del cliente y los tres ejemplos
npm run placeholders     # regenera las imágenes de placeholder de los ejemplos
```

Para usar otro JSON: `SITE_CONFIG=ruta/al.json npm run dev`. Las fotos de `examples/<nombre>.json` se buscan en
`examples/assets/<nombre>/`.

Node: la versión está fijada en `.nvmrc` (22.23.4, la mínima que pide Astro 7.4).

---

## 1. Crear la web de un cliente nuevo

1. **Crea el repo.** En GitHub, dentro de `rgdev-plantilla`, pulsa **Use this template → Create a new repository**.
   Ponle de nombre, por ejemplo, `web-clinica-ejemplo` y hazlo privado.
2. **Clónalo y conecta la plantilla** (para poder traer mejoras más adelante):
   ```bash
   git clone git@github.com:TU_USUARIO/web-clinica-ejemplo.git
   cd web-clinica-ejemplo
   git remote add plantilla git@github.com:vcf1919/rgdev-plantilla.git
   git config merge.ours.driver true
   npm install
   ```
3. **Rellena los datos.** Parte del ejemplo más parecido:
   ```bash
   cp examples/belleza.json src/content/site.config.json   # o salud / comercio
   ```
   Edita el JSON y ejecuta `npm run check` para ver los errores.
4. **Fotos y logo.** Borra los placeholders de `src/assets/cliente/` y pon ahí las fotos del cliente (JPG, PNG o WebP de
   al menos 1600 px en el lado largo; Astro las convierte a WebP y genera los tamaños). El logo, mejor en SVG. Las rutas
   del JSON son relativas a esa carpeta, por ejemplo `"src": "hero.jpg"`. Si usas vídeo en el hero, va en
   `public/cliente/` y se escribe como `"/cliente/hero.mp4"`.
5. **Comprueba:** `npm run check` y `npm run dev`. Revisa la web a 375 px y en escritorio.
6. **Textos legales.** Las páginas `/aviso-legal`, `/privacidad` y `/cookies` se generan con los datos de `legal` y
   `contacto`. Son textos genéricos: **revísalos** para cada cliente.
7. **Sube los cambios:** `git add -A && git commit -m "Datos del cliente" && git push`.
8. **Cloudflare Pages.** Ve a Workers & Pages → Create → Pages → *Connect to Git*, elige el repo y configura:
   - Framework preset: **Astro** (o *None*)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Production branch: `main`
   - No hace falta definir `NODE_VERSION`: Cloudflare lee `.nvmrc`.
9. **Dominio.** En *Custom domains* añade el dominio del cliente y, después, actualiza `sitio.url` en el JSON con ese
   dominio. Esa URL se usa para la canonical, el sitemap y Open Graph.
10. **Después de publicar:** da de alta el sitemap (`https://dominio/sitemap-index.xml`) en Google Search Console,
    revisa los datos estructurados con la *Prueba de resultados enriquecidos* y enlaza la web desde el perfil de
    Google Business.

### Cómo se escribe el JSON (resumen)

- **Énfasis en títulos:** `"titular": "Tu dentista *de confianza*"`. Lo que va entre asteriscos se resalta según la
  variante: en color en salud, en cursiva serif en belleza, con acento de color en comercio.
- **Horario:** cada día es `"cerrado"` o una lista de tramos `[["09:30","14:00"],["16:00","20:30"]]`. Los días
  puntuales cerrados van en `horario.cierres` (`[{ "fecha": "2026-12-25" }]`). El "Abierto ahora" se calcula en el
  navegador con la hora de Europe/Madrid.
- **Reservas:** `tipo` puede ser `whatsapp`, `telefono`, `booksy` o `url`. Todos los botones de reservar usan este campo.
- **Secciones:** si una sección aparece en `secciones`, se muestra. Con `"activa": false` se oculta sin borrar el texto.
  `secciones.orden` cambia el orden; si no está, se usa el de la variante.
  - Cada sección admite `antetitulo`, `id` (el ancla) y `menu` (texto en la navegación, o `false` para que no salga).
  - `hero.estilo` (`dividido` | `editorial` | `fondo`) y `servicios.estilo` (`tarjetas` | `lista`) fuerzan una
    composición distinta de la que trae la variante por defecto.
- **Tema:** `tema.variante` y, si se quiere, `tema.colores` (`primario`, `acento`, `fondo` en hex) y `tema.tipografias`
  (`titulos`, `texto`), elegidas de la lista de fuentes autoalojadas: `schibsted-grotesk`, `hanken-grotesk`,
  `bodoni-moda`, `instrument-sans`, `familjen-grotesk`, `onest`, `newsreader`, `literata`. Si un color no da contraste
  AA, el build lo avisa en la consola.
- **Imágenes:** siempre `{ "src": "...", "alt": "..." }`. El `alt` es obligatorio.
- **Errores:** si falta un campo obligatorio, hay una errata en un nombre de campo o una imagen no existe, el build se
  para e indica la ruta exacta (`secciones.equipo.miembros.0.foto.alt → El texto alternativo (alt) es obligatorio`).

---

## 2. Checklist: qué pedirle al cliente

**Identidad**
- [ ] Logo en vectorial (SVG, AI o PDF) y, si existe, versión para fondo oscuro
- [ ] Colores de marca, si los tiene
- [ ] Eslogan o frase que les defina, y año de apertura

**Datos y legal**
- [ ] Razón social o nombre del titular, NIF/CIF y domicilio fiscal
- [ ] Datos registrales y colegio profesional (en clínicas: número de colegiado de cada profesional)
- [ ] Teléfono, WhatsApp y email de contacto
- [ ] Dirección exacta y enlace a su ficha de Google Maps
- [ ] Redes sociales (URL completas)
- [ ] Dominio: ¿lo tienen? ¿quién lo gestiona?

**Horario y reservas**
- [ ] Horario de cada día, con horario partido si lo tienen, y cierres de vacaciones o festivos
- [ ] Cómo quieren recibir las citas: WhatsApp, teléfono, Booksy (enlace) u otra plataforma (URL)

**Contenido**
- [ ] Lista de servicios o productos: nombre, descripción breve, precio "desde" y duración (opcionales)
- [ ] Texto "sobre nosotros" (o una charla de 10 minutos para redactarlo) y 2–4 cifras destacadas
- [ ] Equipo: foto, nombre, cargo y una frase de cada persona
- [ ] 6–10 reseñas de Google copiadas tal cual (autor, nota, texto y mes), más la nota media y el número total
- [ ] Preguntas frecuentes (4–6)
- [ ] Cómo es la primera visita o el proceso de trabajo (3–4 pasos)
- [ ] Indicaciones para llegar: parking, transporte público, accesibilidad

**Fotos**
- [ ] Foto principal del local o del servicio, en horizontal y de buena calidad
- [ ] 6–12 fotos para la galería (local, detalles, trabajos realizados)
- [ ] Retratos del equipo con fondo y luz parecidos
- [ ] Permiso de uso de todas las imágenes y, si aparecen clientes, su consentimiento

---

## 3. Traer mejoras de la plantilla a un repo de cliente

Cuando mejores la plantilla (un arreglo, una sección nueva, rendimiento…), cada cliente puede recibir el cambio sin
perder sus datos:

```bash
git fetch plantilla
git merge plantilla/main
npm run check && npm run build      # comprueba que todo sigue bien
git push                            # Cloudflare Pages redespliega solo
```

**La primera vez** hay que añadir dos opciones, porque "Use this template" crea el repo sin historial común con la
plantilla:

```bash
git merge plantilla/main --allow-unrelated-histories -X theirs
```

`-X theirs` toma la versión de la plantilla en los archivos de la plantilla. A partir del segundo merge ya basta con
`git merge plantilla/main`.

### Por qué no hay que tocar nada fuera de las carpetas del cliente

- `.gitattributes` marca `src/content/site.config.json`, `src/assets/cliente/**` y `public/cliente/**` con
  `merge=ours`. Si hay conflicto en esos archivos, **siempre gana la versión del cliente**. Para eso hace falta haber
  ejecutado una vez `git config merge.ours.driver true` en el repo del cliente (paso 2 de la guía).
- El resto de archivos es de la plantilla. Si cambias un componente en el repo de un cliente, el siguiente merge
  chocará con las mejoras de la plantilla y tendrás que resolver el conflicto a mano, cliente por cliente.
- Si un cliente necesita algo que el JSON no permite, añade esa opción **a la plantilla** (campo nuevo en
  `src/lib/schema.ts`, opcional y con valor por defecto, para que los JSON antiguos sigan siendo válidos) y luego haz
  el merge en el cliente.
- Para webs personalizadas o demos que se salgan mucho de la plantilla, haz un fork y asume que esos merges
  necesitarán revisión manual.

---

## Estructura

```
src/
├─ content/site.config.json   ◀ CLIENTE: datos y textos
├─ assets/cliente/            ◀ CLIENTE: logo y fotos optimizables
├─ lib/        esquema Zod, carga del config, horario, reservas, SEO (JSON-LD), imágenes
├─ themes/     salud.ts · belleza.ts · comercio.ts (tokens, fuentes, orden y composición por defecto)
├─ styles/     global.css (reset, tipografía, botones, utilidades, animaciones)
├─ components/ Header, Footer, MobileBar, ui/ y sections/ (Hero, Sobre, Servicios, Equipo, Opiniones,
│              Galeria, Proceso, Faq, Ubicacion, CtaFinal)
├─ scripts/    reveal, open-status y map (vanilla)
├─ i18n/es.ts  textos fijos de la interfaz
├─ layouts/    BaseLayout (head, SEO, tema) y LegalLayout
└─ pages/      index, aviso-legal, privacidad, cookies, 404, robots.txt
public/cliente/                ◀ CLIENTE: favicon, vídeo
examples/                      salud.json, belleza.json, comercio.json + assets/ (negocios FICTICIOS)
```

### Detalles técnicos

- **Mapa 3D:** MapLibre GL con el estilo *positron* de OpenFreeMap, sin API key y sin cookies. Los edificios se
  extruyen con el color primario. El JS del mapa (~1 MB) solo se descarga cuando la sección está a punto de entrar en
  pantalla.
- **Tipografías:** autoalojadas, con el subconjunto latino de @fontsource. Solo se precargan las dos que usa el sitio.
- **Animaciones:** IntersectionObserver con escalonado y `cubic-bezier(0.22,1,0.36,1)`. Con
  `prefers-reduced-motion` todo se muestra sin movimiento y el carrusel pasa a scroll manual.
- **SEO:** title, description, canonical, Open Graph (imagen 1200×630 generada), JSON-LD del subtipo de schema.org
  elegido (dirección, geo, horario, sameAs, catálogo de servicios y `aggregateRating` si hay reseñas), FAQPage,
  sitemap y robots.txt.
  - Ojo: Google no muestra estrellas en resultados para reseñas que el propio negocio publica sobre sí mismo
    (*self-serving reviews*). El `aggregateRating` es válido, pero no esperes estrellas en el buscador por él.
- **Valenciano:** los textos de la interfaz están en `src/i18n/es.ts`. Para añadir valenciano habrá que crear `va.ts`
  con las mismas claves y permitir textos `{ es, va }` en el JSON. Aún no está implementado.

### Placeholders de los ejemplos

Las imágenes de `examples/assets/` son abstractas y las genera `npm run placeholders` (sharp + SVG), para no depender
de fotos con licencia. Antes de enseñar una demo, cámbialas por fotos libres (Unsplash, Pexels) o por las del cliente.
Los negocios, NIF, teléfonos y dominios (`.example`) de los ejemplos son ficticios.
