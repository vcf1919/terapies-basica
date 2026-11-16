/**
 * "Abierto ahora / Cerrado" calculado en el navegador con la hora de Europe/Madrid.
 * Lee el horario de <script type="application/json" id="horario-data">.
 * Código de PLANTILLA.
 */
type Data = { semana: [string, string][][]; cierres: string[]; t: Record<string, string>; dias: string[] };

const dataEl = document.getElementById('horario-data');
if (dataEl) {
  const data: Data = JSON.parse(dataEl.textContent || '{}');
  const fmt = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
  const h = (s: string) => s.replace(/^0(\d)/, '$1');

  function madridNow() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23',
    }).formatToParts(new Date());
    const g = (t: string) => parts.find((p) => p.type === t)!.value;
    const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(g('weekday'));
    return { day: wd, time: `${g('hour')}:${g('minute')}`, date: `${g('year')}-${g('month')}-${g('day')}` };
  }

  const addDays = (iso: string, n: number) => {
    const d = new Date(iso + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };

  function compute() {
    const now = madridNow();
    const closedToday = data.cierres.includes(now.date);
    const today = closedToday ? [] : data.semana[now.day];
    const current = today.find(([a, c]) => now.time >= a && now.time < c);
    if (current) return { open: true, label: data.t.abierto, detail: fmt(data.t.cierraA, { h: h(current[1]) }), day: now.day };
    const later = today.find(([a]) => now.time < a);
    if (later) return { open: false, label: data.t.cerrado, detail: fmt(data.t.abreA, { h: h(later[0]) }), day: now.day };
    for (let i = 1; i <= 7; i++) {
      const d = (now.day + i) % 7;
      if (data.cierres.includes(addDays(now.date, i))) continue;
      const first = data.semana[d][0];
      if (first) {
        const detail = i === 1 ? fmt(data.t.abreManana, { h: h(first[0]) }) : fmt(data.t.abreDia, { d: data.dias[d].toLowerCase(), h: h(first[0]) });
        return { open: false, label: closedToday ? data.t.cierreEspecial : data.t.cerrado, detail, day: now.day };
      }
    }
    return { open: false, label: data.t.cerrado, detail: '', day: now.day };
  }

  function render() {
    const s = compute();
    document.querySelectorAll<HTMLElement>('[data-status]').forEach((el) => {
      el.dataset.open = String(s.open);
      el.querySelector('[data-status-label]')!.textContent = s.label;
      const det = el.querySelector('[data-status-detail]');
      if (det) det.textContent = s.detail;
      el.hidden = false;
    });
    document.querySelectorAll<HTMLElement>('[data-hours-today]').forEach((el) => {
      const row = el.querySelector<HTMLElement>(`[data-day~="${s.day}"]`);
      el.querySelectorAll('[data-today]').forEach((r) => r.removeAttribute('data-today'));
      row?.setAttribute('data-today', '');
    });
    const now = madridNow();
    const tramos = data.cierres.includes(now.date) ? [] : data.semana[now.day];
    const hoy = tramos.length ? tramos.map(([a, c]) => `${h(a)}–${h(c)}`).join(' · ') : data.t.cerradoDia;
    document.querySelectorAll<HTMLElement>('[data-today-hours]').forEach((el) => (el.textContent = hoy));
  }

  render();
  setInterval(render, 60_000);
}
