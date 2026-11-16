/** Contraste WCAG para elegir el color de texto sobre los colores de marca. Código de PLANTILLA. */
function lum(hex: string) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/** Devuelve el color (claro u oscuro) con mejor contraste sobre `fondo`. */
export function sobre(fondo: string, claro = '#ffffff', oscuro = '#111111') {
  return contraste(fondo, claro) >= contraste(fondo, oscuro) ? claro : oscuro;
}
