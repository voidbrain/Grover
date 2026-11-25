import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SEMANTIC_TOKENS } from '@voidbrain/bricks/tokens';

// The client takes its tokens from 🧱 bricks with a Grover theme (F-020-T02). These checks read the sources:
// the theme must define what every bricks component reads, and nothing else may carry its own palette.
const src = join(process.cwd(), 'src');
const read = (file: string) => readFileSync(join(src, file), 'utf8');
const theme = () => read('grover-theme.css');

/** The declarations inside the first block whose selector matches. */
function block(css: string, selector: RegExp): string {
  const start = css.search(selector);
  expect(start, `no block for ${selector}`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
  }
  throw Error('unclosed block');
}
const defines = (css: string, token: string) => new RegExp(`${token}\\s*:`).test(css);

function styleSources(dir = join(src, 'app')): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? e.name === 'testing'
        ? []
        : styleSources(join(dir, e.name))
      : /\.(scss|ts)$/.test(e.name) && !e.name.endsWith('.spec.ts')
        ? [join(dir, e.name)]
        : [],
  );
}

describe('Grover theme on bricks', () => {
  it('defines every bricks semantic token in light', () => {
    const light = block(theme(), /:root,\s*\[data-bx-theme='grover'\]/);
    for (const token of SEMANTIC_TOKENS) expect(defines(light, token), token).toBe(true);
  });

  it('defines every bricks colour token again in dark', () => {
    const dark = block(theme(), /@media \(prefers-color-scheme: dark\)/);
    const colours = SEMANTIC_TOKENS.filter((t) => !/font|radius/.test(t));
    for (const token of colours) expect(defines(dark, token), token).toBe(true);
  });

  it('is applied to the page body', () => {
    expect(read('index.html')).toMatch(/<body data-bx-theme="grover">/);
  });

  it('keeps the old local tokens out of every style', () => {
    const old =
      /var\(--(bg|surface|surface-2|line|text|muted|accent|on-accent|ok|warn|bad|radius|radius-lg|space-\d|font)\)/;
    for (const file of [join(src, 'styles.scss'), ...styleSources()])
      expect(readFileSync(file, 'utf8'), file).not.toMatch(old);
  });

  it('has no literal colour outside the theme', () => {
    const literal = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i;
    for (const file of [join(src, 'styles.scss'), ...styleSources()]) {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(css, file).not.toMatch(literal);
    }
  });
});
