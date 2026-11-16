/** Aparición escalonada al hacer scroll + contadores. Código de PLANTILLA. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduce || !('IntersectionObserver' in window)) {
  items.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
}

/* Contadores de cifras */
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
if (!reduce && counters.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        const end = Number(el.dataset.count);
        const dec = (el.dataset.count!.split('.')[1] ?? '').length;
        const t0 = performance.now();
        const dur = 1400;
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = (end * eased).toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => io.observe(el));
}
