// Verifica que cada texto marcado para traducir en index.html tenga su versión en inglés.
// Correr con: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('assets/i18n.js', root), 'utf8'), context);
const EN = context.window.I18N_EN;

const textKeys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
const attrKeys = [...html.matchAll(/data-i18n-attr="([^"]+)"/g)]
  .flatMap((m) => m[1].split(';').map((pair) => pair.split(':')[1]));
const usedKeys = new Set([...textKeys, ...attrKeys]);

test('el diccionario se carga', () => {
  assert.ok(EN && Object.keys(EN).length > 0);
});

test('cada clave usada en el HTML tiene traducción al inglés', () => {
  const missing = [...usedKeys].filter((key) => typeof EN[key] !== 'string' || !EN[key].trim());
  assert.deepEqual(missing, []);
});

test('no quedan traducciones sin usar', () => {
  const unused = Object.keys(EN).filter((key) => !usedKeys.has(key));
  assert.deepEqual(unused, []);
});

test('los textos con etiquetas conservan las mismas etiquetas en inglés', () => {
  const tags = (s) => [...s.matchAll(/<\/?([a-z]+)/g)].map((m) => m[0]).join(' ');
  for (const [, tag, key, inner] of html.matchAll(/<(\w+)[^>]*?data-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
    assert.equal(tags(EN[key]), tags(inner), `etiquetas distintas en "${key}" (<${tag}>)`);
  }
});

test('el switch tiene un botón por idioma', () => {
  const langs = [...html.matchAll(/data-set-lang="([a-z]+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(langs, ['en', 'es']);
});

test('los enlaces traducidos apuntan a archivos que existen', () => {
  const hrefKeys = [...html.matchAll(/data-i18n-attr="([^"]+)"/g)]
    .flatMap((m) => m[1].split(';').map((pair) => pair.split(':')))
    .filter(([attr]) => attr === 'href')
    .map(([, key]) => key);
  assert.ok(hrefKeys.length > 0);
  for (const key of hrefKeys) {
    assert.ok(existsSync(new URL(EN[key], root)), `no existe ${EN[key]} (${key})`);
  }
});
