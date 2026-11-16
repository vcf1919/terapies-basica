/** JSON-LD (schema.org) generado desde el config. Código de PLANTILLA. */
import type { SiteConfig } from './schema';
import { openingHoursSpec } from './horario';

export function localBusinessLd(cfg: SiteConfig, opts: { url: string; image: string; logo: string }) {
  const { negocio, contacto, seo, secciones } = cfg;
  const d = contacto.direccion;
  const op = secciones.opiniones;
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': seo.schemaType,
    '@id': `${opts.url}#negocio`,
    name: negocio.nombre,
    description: negocio.descripcionCorta,
    slogan: negocio.eslogan,
    url: opts.url,
    image: opts.image,
    logo: opts.logo,
    telephone: contacto.telefono.replace(/\s/g, ''),
    email: contacto.email,
    foundingDate: String(negocio.anioApertura),
    address: {
      '@type': 'PostalAddress',
      streetAddress: d.calle,
      postalCode: d.cp,
      addressLocality: d.localidad,
      addressRegion: d.provincia,
      addressCountry: d.pais,
    },
    geo: { '@type': 'GeoCoordinates', latitude: contacto.coordenadas.lat, longitude: contacto.coordenadas.lng },
    hasMap: contacto.googleMaps,
    openingHoursSpecification: openingHoursSpec(cfg.horario),
  };
  const sameAs = Object.values(contacto.redes).filter(Boolean);
  if (sameAs.length) ld.sameAs = sameAs;
  if (seo.rangoPrecio) ld.priceRange = seo.rangoPrecio;
  if (op && op.activa !== false) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: op.notaMedia,
      reviewCount: op.totalResenas,
      bestRating: 5,
      worstRating: 1,
    };
  }
  const serv = secciones.servicios;
  if (serv && serv.activa !== false) {
    ld.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: serv.titulo,
      itemListElement: serv.items.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.nombre, description: s.descripcion },
        ...(s.precioDesde ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: s.precioDesde, priceCurrency: 'EUR' } } : {}),
      })),
    };
  }
  return ld;
}

export function faqLd(preguntas: { pregunta: string; respuesta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas.map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
    })),
  };
}

/** Serializa JSON-LD de forma segura dentro de <script>. */
export const ldJson = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');
