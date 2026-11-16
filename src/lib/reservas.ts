/** Enlaces de contacto y reserva. Código de PLANTILLA. */
import type { SiteConfig } from './schema';

const digits = (tel: string) => tel.replace(/[^\d]/g, '');

export const telHref = (tel: string) => `tel:+${digits(tel)}`;
export const waHref = (tel: string, msg?: string) =>
  `https://wa.me/${digits(tel)}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;

/** Formato legible: "+34 961 234 567" se respeta tal cual lo escribe el cliente. */
export const telLegible = (tel: string) => tel.replace(/^\+34\s?/, '');

export type Cta = { href: string; texto: string; externo: boolean; tipo: SiteConfig['reservas']['tipo'] };

/** Todos los botones "Reservar cita" salen de aquí. */
export function reservaCta(cfg: SiteConfig): Cta {
  const r = cfg.reservas;
  const texto = r.textoBoton;
  switch (r.tipo) {
    case 'whatsapp': {
      const num = r.numero ?? cfg.contacto.whatsapp!;
      const msg = r.mensaje ?? `Hola, me gustaría pedir cita en ${cfg.negocio.nombre}.`;
      return { href: waHref(num, msg), texto, externo: true, tipo: r.tipo };
    }
    case 'telefono':
      return { href: telHref(r.numero ?? cfg.contacto.telefono), texto, externo: false, tipo: r.tipo };
    default:
      return { href: r.url, texto, externo: true, tipo: r.tipo };
  }
}

export const comoLlegarHref = (cfg: SiteConfig) =>
  `https://www.google.com/maps/dir/?api=1&destination=${cfg.contacto.coordenadas.lat},${cfg.contacto.coordenadas.lng}`;

export const direccionLinea = (cfg: SiteConfig) => {
  const d = cfg.contacto.direccion;
  return `${d.calle}, ${d.cp} ${d.localidad}`;
};
