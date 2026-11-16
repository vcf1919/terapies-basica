/**
 * Textos fijos de la interfaz (castellano). Código de PLANTILLA.
 * Para añadir valenciano en el futuro: crear va.ts con las mismas claves.
 */
export const es = {
  lang: 'es',
  locale: 'es-ES',
  dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const,
  diasNombre: {
    lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves',
    viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
  },
  diasCorto: {
    lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue',
    viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom',
  },
  estado: {
    abierto: 'Abierto ahora',
    cerrado: 'Cerrado ahora',
    cierraA: 'Cierra a las {h}',
    abreA: 'Abre a las {h}',
    abreManana: 'Abre mañana a las {h}',
    abreDia: 'Abre el {d} a las {h}',
    cierreEspecial: 'Hoy cerrado',
    hoy: 'Hoy',
    cerradoDia: 'Cerrado',
  },
  menu: {
    servicios: 'Servicios', sobre: 'Nosotros', equipo: 'Equipo', opiniones: 'Opiniones',
    galeria: 'Galería', proceso: 'Cómo trabajamos', faq: 'Preguntas', ubicacion: 'Dónde estamos',
    abrir: 'Abrir menú', cerrar: 'Cerrar menú', principal: 'Navegación principal',
    saltar: 'Saltar al contenido',
  },
  ui: {
    llamar: 'Llamar',
    whatsapp: 'WhatsApp',
    escribir: 'Escribir un email',
    comoLlegar: 'Cómo llegar',
    abrirMaps: 'Abrir en Google Maps',
    horario: 'Horario',
    horarioHoy: 'Horario de hoy',
    direccion: 'Dirección',
    contacto: 'Contacto',
    desde: 'desde',
    min: 'min',
    verEnGoogle: 'Ver todas en Google',
    resenas: 'reseñas en Google',
    pausar: 'Pausar el carrusel',
    reanudar: 'Reanudar el carrusel',
    cerrar: 'Cerrar',
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    ampliar: 'Ampliar imagen',
    paso: 'Paso',
    estrellas: '{n} de 5 estrellas',
    mapaCargando: 'Cargando mapa…',
    mapaAria: 'Mapa 3D de la ubicación de {n}',
    anios: 'años',
    redes: 'Redes sociales',
    volverInicio: 'Volver al inicio',
    noEncontrada: 'Página no encontrada',
    noEncontradaTexto: 'La página que buscas no existe o ha cambiado de dirección.',
  },
  legal: {
    aviso: 'Aviso legal',
    privacidad: 'Política de privacidad',
    cookies: 'Política de cookies',
    creditos: 'Web por',
  },
} as const;

export type Dict = typeof es;
export const t = es;

/** Sustituye {clave} por su valor. */
export function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
