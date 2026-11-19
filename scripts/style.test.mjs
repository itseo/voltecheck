import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../assets/styles.css", import.meta.url),"utf8");
const html = readFileSync(new URL("../index.html", import.meta.url),"utf8");

test("Todas las esquinas de la interfaz usan 5px", () => {
  const radii = [...css.matchAll(/border-radius:\s*([^;}]+);/g)].map((item) => item[1].trim());
  assert(radii.length > 10);
  assert(radii.every((radius) => radius === "5px"));
});

test("Sin desplazamiento horizontal por fondos decorativos", () => {
  assert.match(css, /html\s*\{[^}]*overflow-x:\s*clip/s);
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*clip/s);
  assert.match(css, /\.page-bg\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.card\s*\{[^}]*min-width:\s*0/s);
});

test("Pie de página contrastado", () => {
  const footerCss=[...css.matchAll(/\.site-footer\s*\{([^}]+)\}/gs)].at(-1)?.[1] || "";
  assert.match(footerCss, /background:\s*#fff/);
  assert.match(footerCss, /color:\s*#344d60/);
  assert.doesNotMatch(css, /\.desktop-message\s*~\s*\.site-footer/);
  assert.match(html,/Creado con ❤️ por/);
  assert.match(html,/href="https:\/\/sistewa\.com"/);
});

test("Símbolo 4G SVG facilitado por Sistewa", () => {
  assert.match(html, /class="hero-symbol"/);
  assert.match(html, /viewBox="0 0 48 48"/);
  assert.match(html, /M35\.087 9\.408/);
  assert.match(html, /<g fill="currentColor">/);
  assert.match(css, /\.hero-symbol\s*\{[^}]*color:\s*var\(--mint-bright\)/s);
});

test("Acción principal abre la guía de activación", () => {
  assert.match(html, /id="detected-select"[^>]*>Guía de activación/);
});
