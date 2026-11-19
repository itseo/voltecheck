import fs from "node:fs";
import assert from "node:assert/strict";
const catalog = JSON.parse(fs.readFileSync(new URL("../data/catalog.json", import.meta.url),"utf8"));
assert.equal(catalog.schema,1,"Esquema del catálogo");
assert(Array.isArray(catalog.brands) && catalog.brands.length>0,"Fabricantes vacíos");
assert(catalog.guides && typeof catalog.guides==="object","Guías ausentes");
const used = new Set();
let total=0;
for(const brand of catalog.brands) {
  assert(brand.id && brand.name && brand.guide,"Fabricante incompleto");
  assert(catalog.guides[brand.guide],"Guía de fabricante ausente: "+brand.id);
  assert(Array.isArray(brand.models),"Modelos ausentes");
  for(const item of brand.models) {
    const model=typeof item==="string" ? {name:item}:item;
    assert(model.name,"Nombre vacío");
    const id=brand.id+"/"+model.name.toLowerCase();
    assert(!used.has(id),"Modelo duplicado: "+id);
    used.add(id);
    const guide=catalog.guides[model.guide||brand.guide];
    if(model.status!=="unsupported") assert(guide && guide.variants.length,"Modelo sin guía: "+id);
    total++;
  }
}
for(const [id,guide] of Object.entries(catalog.guides)) {
  assert(Array.isArray(guide.variants) && guide.variants.length,"Faltan variantes: "+id);
  for(const v of guide.variants) {
    assert(v.id && v.label && Array.isArray(v.steps) && v.steps.length>=3,"Guía incompleta: "+id);
    assert(v.steps.every(s=>typeof s==="string" && s.trim().length>0),"Pasos vacíos: "+id);
  }
}
for(const path of ["index.html","assets/styles.css","assets/app.js","assets/device.js","assets/favicon.svg","assets/og.svg","LICENSE","NOTICE.md"]) {
  assert(fs.existsSync(new URL("../"+path,import.meta.url)),"Archivo ausente: "+path);
}
console.log("Catálogo válido:",total,"modelos,",catalog.brands.length,"fabricantes,",Object.keys(catalog.guides).length,"guías.");
