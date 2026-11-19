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
  const footerCss=css.match(/\.site-footer\s*\{([^}]+)\}/s)?.[1] || "";
  assert.match(footerCss, /background:\s*#fff/);
  assert.match(footerCss, /color:\s*#344d60/);
  assert.doesNotMatch(css, /\.desktop-message\s*~\s*\.site-footer/);
  assert.match(html,/Creado con ❤️ por/);
  assert.match(html,/href="https:\/\/sistewa\.com"/);
});

test("Símbolo 4G correcto", () => {
  assert.match(html, /class="hero-symbol"/);
  assert.match(html, /<text x="11" y="51"[^>]+>4G<\/text>/);
  assert.match(html, /<g fill="#6ae6c2">/);
});
