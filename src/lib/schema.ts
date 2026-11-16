/**
 * Esquema del archivo de configuración del cliente (src/content/site.config.json).
 * Código de PLANTILLA: el cliente nunca edita este archivo.
 * Si el JSON no cumple el esquema, el build falla con la ruta exacta del campo.
 */
import { z } from 'zod';

/* ───────────── Primitivas reutilizables ───────────── */

const texto = z.string().trim().min(1, 'No puede estar vacío');
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM (ej. "09:30")');
const hex = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Color hexadecimal (ej. "#1f6f5c")');
const telefono = z
  .string()
  .regex(/^\+\d{2,3}[\d ]{8,14}$/, 'Teléfono con prefijo internacional (ej. "+34 961 234 567")');
const url = z.url({ message: 'URL completa con https://' });

/** Imagen optimizable. `src` es relativa a la carpeta de assets del cliente
 *  (src/assets/cliente/ en un cliente, examples/assets/<ejemplo>/ en los ejemplos). */
const imagen = z.strictObject({
  src: texto.regex(/\.(jpe?g|png|webp|avif|svg)$/i, 'Debe ser .jpg, .png, .webp, .avif o .svg'),
  alt: z.string().trim().min(3, 'El texto alternativo (alt) es obligatorio'),
});

/** Tramo horario: ["09:00", "14:00"] */
const tramo = z
  .tuple([hora, hora])
  .refine(([a, c]) => a < c, 'La hora de cierre debe ser posterior a la de apertura');
const dia = z.union([z.literal('cerrado'), z.array(tramo).min(1).max(3)]);

/* ───────────── Bloques de datos ───────────── */

const negocio = z.strictObject({
  nombre: texto,
  sector: texto, // "Clínica dental", "Centro de estética"…
  eslogan: texto,
  descripcionCorta: texto.max(200),
  anioApertura: z.number().int().min(1900).max(new Date().getFullYear()),
  logo: imagen, // preferible SVG
  logoClaro: imagen.optional(), // versión para fondos oscuros (footer, marcador del mapa)
});

const legal = z.strictObject({
  titular: texto, // persona física o razón social
  nif: texto.regex(/^[A-Z0-9]{9}$/i, 'NIF/CIF de 9 caracteres sin guiones'),
  domicilioFiscal: texto.optional(), // si difiere de la dirección del local
  registro: texto.optional(), // "Inscrita en el Registro Mercantil de Valencia…"
  colegio: texto.optional(), // profesiones colegiadas (dentistas, fisios…)
});

const redes = z
  .object({
    instagram: url,
    facebook: url,
    tiktok: url,
    youtube: url,
    linkedin: url,
    x: url,
  })
  .partial();

const contacto = z.strictObject({
  telefono,
  whatsapp: telefono.optional(),
  email: z.email({ message: 'Email no válido' }),
  direccion: z.strictObject({
    calle: texto,
    cp: z.string().regex(/^\d{5}$/, 'Código postal de 5 cifras'),
    localidad: texto,
    provincia: texto,
    pais: z.string().length(2).default('ES'),
  }),
  coordenadas: z.strictObject({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  googleMaps: url,
  redes: redes.default({}),
});

const horario = z.strictObject({
  lunes: dia,
  martes: dia,
  miercoles: dia,
  jueves: dia,
  viernes: dia,
  sabado: dia,
  domingo: dia,
  nota: texto.optional(), // "Festivos nacionales cerrado"
  cierres: z
    .array(z.strictObject({ fecha: z.iso.date(), motivo: texto.optional() }))
    .default([]), // días puntuales cerrados (afecta a "Abierto ahora")
});

const reservas = z.discriminatedUnion('tipo', [
  z.strictObject({ tipo: z.literal('whatsapp'), numero: telefono.optional(), mensaje: texto.optional() }),
  z.strictObject({ tipo: z.literal('telefono'), numero: telefono.optional() }),
  z.strictObject({ tipo: z.literal('booksy'), url }),
  z.strictObject({ tipo: z.literal('url'), url }),
]).and(z.strictObject({ textoBoton: texto.default('Reservar cita') }));

/** Tipografías disponibles (autoalojadas con @fontsource; cada preset usa una pareja). */
export const FUENTES = [
  'schibsted-grotesk', 'hanken-grotesk', 'newsreader', 'bodoni-moda',
  'familjen-grotesk', 'instrument-sans', 'literata', 'onest',
] as const;

const tema = z.strictObject({
  variante: z.enum(['salud', 'belleza', 'comercio']),
  colores: z.strictObject({ primario: hex, acento: hex, fondo: hex }).partial().optional(),
  tipografias: z.strictObject({ titulos: z.enum(FUENTES), texto: z.enum(FUENTES) }).partial().optional(),
});

const seo = z.strictObject({
  title: texto.max(65, 'Máximo 65 caracteres para que no se corte en Google'),
  description: texto.min(70).max(160, 'Entre 70 y 160 caracteres'),
  imagenOG: imagen, // se exporta a 1200×630
  schemaType: z.enum([
    'LocalBusiness', 'Dentist', 'MedicalClinic', 'Physiotherapy', 'Optician',
    'BeautySalon', 'HairSalon', 'NailSalon', 'DaySpa', 'HealthAndBeautyBusiness',
    'Store', 'ClothingStore', 'Florist', 'Bakery', 'ShoeStore', 'JewelryStore',
  ]),
  rangoPrecio: z.enum(['€', '€€', '€€€', '€€€€']).optional(),
});

/* ───────────── Secciones ───────────── */

/** Campos comunes: ancla, etiqueta en el menú (false = no aparece) y activa. */
const base = {
  activa: z.boolean().default(true),
  id: z.string().regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones').optional(),
  menu: z.union([texto, z.literal(false)]).optional(),
  antetitulo: texto.optional(),
};

const secciones = z.strictObject({
  orden: z.array(z.enum([
    'hero', 'sobre', 'servicios', 'equipo', 'opiniones',
    'galeria', 'proceso', 'faq', 'ubicacion', 'ctaFinal',
  ])).optional(), // si falta, se usa el orden por defecto de la variante

  hero: z.strictObject({
    ...base,
    titular: texto,
    subtitulo: texto.optional(),
    ctaSecundario: z.strictObject({ texto, href: texto }).optional(),
    fondo: z.discriminatedUnion('tipo', [
      z.strictObject({ tipo: z.literal('imagen'), imagen }),
      // el vídeo va en public/cliente/ (no se optimiza); el póster sí
      z.strictObject({ tipo: z.literal('video'), src: texto.regex(/^\/cliente\/.+\.(mp4|webm)$/), poster: imagen }),
    ]).optional(),
    panel: z.boolean().default(true), // panel translúcido con abierto/dirección/horario de hoy
    // composición; si falta, la decide la variante (salud: dividido, belleza: editorial, comercio: fondo)
    estilo: z.enum(['fondo', 'dividido', 'editorial']).optional(),
  }).optional(),


  sobre: z.strictObject({
    ...base,
    titulo: texto,
    parrafos: z.array(texto).min(1),
    imagen: imagen.optional(),
    cifras: z.array(z.strictObject({
      valor: z.union([z.number(), z.literal('anios')]), // "anios" = calculado desde anioApertura
      prefijo: z.string().optional(),
      sufijo: z.string().optional(),
      etiqueta: texto,
    })).max(4).default([]),
  }).optional(),

  servicios: z.strictObject({
    ...base,
    titulo: texto,
    intro: texto.optional(),
    items: z.array(z.strictObject({
      nombre: texto,
      descripcion: texto,
      precioDesde: z.number().positive().optional(), // € ; se muestra "desde 35 €"
      duracion: z.number().int().positive().optional(), // minutos
      imagen: imagen.optional(),
      destacado: z.boolean().default(false),
    })).min(1),
    nota: texto.optional(), // "Precios con IVA incluido"
    // si falta, la decide la variante (salud y comercio: tarjetas, belleza: lista tipo carta)
    estilo: z.enum(['tarjetas', 'lista']).optional(),
  }).optional(),

  equipo: z.strictObject({
    ...base,
    titulo: texto,
    intro: texto.optional(),
    miembros: z.array(z.strictObject({
      nombre: texto,
      cargo: texto,
      frase: texto.optional(),
      colegiado: texto.optional(), // "Col. nº 46-1234"
      foto: imagen,
    })).min(1),
  }).optional(),

  opiniones: z.strictObject({
    ...base,
    titulo: texto,
    notaMedia: z.number().min(1).max(5),
    totalResenas: z.number().int().positive(),
    urlGoogle: url,
    resenas: z.array(z.strictObject({
      autor: texto,
      nota: z.number().int().min(1).max(5),
      texto,
      fecha: texto.optional(), // "Marzo 2026"
    })).min(6, 'Mínimo 6 reseñas para llenar las dos filas del carrusel'),
  }).optional(),

  galeria: z.strictObject({
    ...base,
    titulo: texto,
    intro: texto.optional(),
    imagenes: z.array(imagen.extend({ pie: texto.optional() })).min(3),
  }).optional(),

  proceso: z.strictObject({
    ...base,
    titulo: texto,
    intro: texto.optional(),
    pasos: z.array(z.strictObject({ titulo: texto, texto })).min(2).max(6),
  }).optional(),

  faq: z.strictObject({
    ...base,
    titulo: texto,
    preguntas: z.array(z.strictObject({ pregunta: texto, respuesta: texto })).min(1),
  }).optional(),

  ubicacion: z.strictObject({
    ...base,
    titulo: texto,
    texto: texto.optional(),
    indicaciones: z.array(texto).default([]), // "Parking gratuito en…", "Metro L1 parada…"
    mapa: z.strictObject({
      zoom: z.number().min(12).max(19).default(16.6),
      inclinacion: z.number().min(0).max(70).default(58),
      rotacion: z.number().min(-180).max(180).default(-18),
    }).default({ zoom: 16.6, inclinacion: 58, rotacion: -18 }),
  }).optional(),

  ctaFinal: z.strictObject({
    ...base,
    titulo: texto,
    texto: texto.optional(),
    mostrarHorario: z.boolean().default(true),
  }).optional(),
});

/* ───────────── Config completo ───────────── */

export const siteConfigSchema = z
  .object({
    sitio: z.strictObject({
      url, // dominio final, para canonical, sitemap y OG
      favicon: texto.regex(/^\/cliente\//, 'Debe estar en public/cliente/').optional(),
    }),
    negocio,
    legal,
    contacto,
    horario,
    reservas,
    tema,
    secciones,
    seo,
  })
  .superRefine((cfg, ctx) => {
    // Cada sección listada en `orden` debe tener contenido
    for (const [i, key] of (cfg.secciones.orden ?? []).entries()) {
      if (!cfg.secciones[key]) {
        ctx.addIssue({
          code: 'custom',
          path: ['secciones', 'orden', i],
          message: `"${key}" está en el orden pero no tiene contenido en secciones.${key}`,
        });
      }
    }
    // Reservas por WhatsApp sin número ni contacto.whatsapp
    if (cfg.reservas.tipo === 'whatsapp' && !cfg.reservas.numero && !cfg.contacto.whatsapp) {
      ctx.addIssue({
        code: 'custom',
        path: ['reservas', 'numero'],
        message: 'Reservas por WhatsApp: indica reservas.numero o contacto.whatsapp',
      });
    }
  });

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type Secciones = SiteConfig['secciones'];
export type SeccionKey = Exclude<keyof Secciones, 'orden'>;
export type Dia = z.infer<typeof dia>;
export type Imagen = z.infer<typeof imagen>;
