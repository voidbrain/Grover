import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import ts from 'typescript';

// B-014: backlog IDs (B-004, F-012) are for the repository, not for the owner. A string the code can show, send or
// describe to a model (client templates, hub messages, MCP tool descriptions) never names one; comments may.
// Every string and template literal in the source and every Angular template is scanned, so a new one fails here.
const ID = /\b[BF]-\d{3}\b/;
const root = fileURLToPath(new URL('../../../', import.meta.url));
const withoutHtmlComments = (text: string) => text.replace(/<!--[\s\S]*?-->/g, '');
const sources = globSync(['apps/*/src/**/*.ts', 'packages/*/src/**/*.ts', 'apps/client/public/**/*.js'], { cwd: root })
  .map((f) => f.replaceAll('\\', '/'))
  .filter((f) => !f.endsWith('.spec.ts'));
const templates = globSync('apps/client/src/**/*.html', { cwd: root }).map((f) => f.replaceAll('\\', '/'));

function literalsWithIds(file: string, text = readFileSync(root + file, 'utf8')): string[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      (ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)) &&
      ID.test(withoutHtmlComments(node.text))
    )
      for (const m of withoutHtmlComments(node.getText()).matchAll(new RegExp(ID, 'g'))) {
        const at = source.getLineAndCharacterOfPosition(node.getStart() + node.getText().indexOf(m[0], m.index));
        found.push(`${file}:${at.line + 1}: ${source.text.split('\n')[at.line]!.trim().slice(0, 100)}`);
      }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function templateLinesWithIds(file: string, text = readFileSync(root + file, 'utf8')): string[] {
  return withoutHtmlComments(text)
    .split('\n')
    .flatMap((line, i) => (ID.test(line) ? [`${file}:${i + 1}: ${line.trim().slice(0, 100)}`] : []));
}

test('B-014: no string shown to the owner or a model names a backlog ID', () => {
  for (const scanned of [
    'apps/hub/src/mcp.ts',
    'apps/client/src/app/setup/probe-editor.ts',
    'apps/client/public/sw.js',
  ])
    assert.ok(sources.includes(scanned), scanned + ' is scanned');
  assert.ok(templates.includes('apps/client/src/app/setup/room-setup.html'), 'templates are scanned');
  assert.deepEqual(
    [...sources.flatMap((f) => literalsWithIds(f)), ...templates.flatMap((f) => templateLinesWithIds(f))],
    [],
  );
});

test('B-014: the scan ignores comments and finds an ID in a string, a template literal or a template', () => {
  const code = [
    '// F-004: a comment may name it',
    '/* B-001 too */',
    "const shown = 'Calibrate first (backlog F-004).';",
    'const tpl = `<p>Off until ${x} (F-004)</p><!-- F-012 -->`;',
    'const fine = `<!-- F-012 --><p>Calibrate first.</p>`;',
  ].join('\n');
  assert.deepEqual(
    literalsWithIds('x.ts', code).map((f) => f.split(':')[1]),
    ['3', '4'],
  );
  assert.deepEqual(templateLinesWithIds('x.html', '<!-- B-014 -->\n<p>ok</p>\n<p>see F-004</p>'), [
    'x.html:3: <p>see F-004</p>',
  ]);
});
