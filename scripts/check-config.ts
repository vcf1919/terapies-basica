/** Valida el config activo (o todos con --all) sin hacer el build. Código de PLANTILLA. */
import { loadConfig, ConfigError } from '../src/lib/config';

const files = process.argv.includes('--all')
  ? ['src/content/site.config.json', 'examples/salud.json', 'examples/belleza.json', 'examples/comercio.json']
  : [process.env.SITE_CONFIG || 'src/content/site.config.json'];

let ok = true;
for (const f of files) {
  try {
    const { config } = loadConfig(f);
    console.log(`✔ ${f} · ${config.negocio.nombre} (${config.tema.variante})`);
  } catch (e) {
    ok = false;
    console.error(e instanceof ConfigError ? e.message : e);
  }
}
process.exit(ok ? 0 : 1);
