import { detectDevice } from "./device.js";

const $ = (id) => document.getElementById(id);
let catalog = null;
let allModels = [];
let chosen = null;
let detected = null;

function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function normalized(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function slug(value) {
  return String(value).normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function fullName(model) {
  return model.brandName + " " + model.name;
}
function expandModels(data) {
  const models = [];
  for (const brand of data.brands || []) {
    for (const item of brand.models || []) {
      const model = typeof item === "string" ? { name: item } : item;
      models.push({
        ...model,
        brand: brand.id,
        brandName: brand.name,
        guide: model.guide || brand.guide,
        id: brand.id + "-" + slug(model.name),
        status: model.status || "supported",
        aliases: model.aliases || []
      });
    }
  }
  return models.sort((a,b) => fullName(a).localeCompare(fullName(b), "es"));
}
function matchedModel(name) {
  const value = normalized(name);
  if (!value || value === "android" || value === "iphone") return null;
  return allModels.find((model) => {
    const options = [model.name, fullName(model), ...model.aliases];
    return options.some((option) => normalized(option) === value);
  }) || null;
}
function showSelectedBrand(brand) {
  $("brand-select").value = brand || "";
  refreshResults();
}
function detectedSummary(device, match) {
  const box = $("detect-state");
  box.replaceChildren();
  const title = node("div","detected-label","Identificación del navegador");
  const name = node("div","detected-name", match ? fullName(match) : device.model || (device.os === "iOS" ? "iPhone" : "Teléfono móvil"));
  const detail = node("p","detected-note", match
    ? "Hemos reconocido una referencia de tu móvil. Comprueba que el nombre coincide con tu dispositivo."
    : "Tu navegador no ha facilitado un modelo exacto que podamos reconocer. Puedes buscarlo en el catálogo.");
  const chip = node("span",match ? "detect-chip" : "detect-chip unknown", match ? "✓ Modelo identificado" : "Selección manual disponible");
  box.append(title,name,detail,chip);
  $("detected-actions").hidden = false;
  $("detected-select").hidden = !match;
  if (match) $("detected-select").onclick = () => selectModel(match);
}
function addBrandOptions() {
  const list = $("brand-select");
  for (const brand of catalog.brands) {
    const option = document.createElement("option");
    option.value = brand.id;
    option.textContent = brand.name;
    list.append(option);
  }
}
function refreshResults() {
  const brand = $("brand-select").value;
  const text = normalized($("model-search").value);
  const matches = allModels.filter((model) => {
    if (brand && model.brand !== brand) return false;
    if (!text) return true;
    return [model.name, fullName(model), ...model.aliases].some((value) => normalized(value).includes(text));
  });
  const list = $("model-results");
  list.replaceChildren();
  for (const model of matches.slice(0,35)) {
    const button = node("button","model-button");
    button.type = "button";
    button.setAttribute("role","listitem");
    const title = node("span","",model.name);
    const maker = node("small","",model.brandName);
    title.append(maker);
    button.append(title,node("b","","›"));
    button.addEventListener("click",() => selectModel(model));
    list.append(button);
  }
  $("results-count").textContent = matches.length > 35 ? "Mostrando 35 de " + matches.length + " modelos. Escribe para filtrar." : matches.length + " modelo" + (matches.length === 1 ? "" : "s") + " disponible" + (matches.length === 1 ? "" : "s");
  $("no-results").hidden = matches.length !== 0;
}
function addParagraph(parent, text, className = "caveat") {
  parent.append(node("p",className,text));
}
function renderVariant(target, variant, model) {
  target.replaceChildren();
  const list = node("ol","steps");
  for (const instruction of variant.steps) list.append(node("li","",instruction));
  target.append(list);
  if (variant.note) addParagraph(target,variant.note,"guide-extra");
  if (model.mmi) {
    addParagraph(target,"En esta variante antigua de Xiaomi, la opción puede estar oculta. Algunos modelos permiten mostrarla marcando *#*#86583#*#* en Teléfono. Utilízalo solo si la opción no aparece y conoces las implicaciones de ese ajuste; no garantiza que tu operador admita VoLTE.","guide-warning");
  }
}
function renderResult(model) {
  const target = $("result-body");
  target.replaceChildren();
  target.append(node("div","result-device",fullName(model)));
  const status = model.status === "unsupported" ? "unsupported" : model.status === "supported" ? "success" : "unknown";
  const title = status === "success" ? "✓ Compatible con tecnología VoLTE" : status === "unsupported" ? "✕ Este modelo no dispone de VoLTE" : "Información pendiente de confirmar";
  target.append(node("div","compatibility " + status,title));
  if (status !== "success") {
    addParagraph(target,model.reason || "No contamos con información suficiente para confirmar la compatibilidad de esta variante.");
    return;
  }
  addParagraph(target,"El dispositivo incorpora tecnología VoLTE. Para utilizarla, tu compañía también debe admitirla con esta línea, firmware y SIM. Esta página no comprueba si está activada.");
  const guide = catalog.guides[model.guide];
  if (!guide || !guide.variants?.length) {
    addParagraph(target,"Aún no está disponible una guía de activación específica para esta interfaz.","guide-warning");
    return;
  }
  target.append(node("h3","guide-head","Cómo activar o encontrar VoLTE"));
  if (guide.intro) addParagraph(target,guide.intro);
  const variants = guide.variants;
  const body = node("div","");
  if (variants.length > 1) {
    const tabs = node("div","variant-tabs");
    const buttons = variants.map((variant) => {
      const button = node("button","variant-tab",variant.label);
      button.type = "button";
      button.setAttribute("aria-pressed","false");
      tabs.append(button);
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.setAttribute("aria-pressed","false"));
        button.setAttribute("aria-pressed","true");
        renderVariant(body,variant,model);
      });
      return button;
    });
    target.append(tabs);
    buttons[0].click();
  } else renderVariant(body,variants[0],model);
  target.append(body);
  if (guide.note) addParagraph(target,guide.note,"guide-warning");
}
function selectModel(model, updateUrl = true) {
  chosen = model;
  renderResult(model);
  $("result-panel").hidden = false;
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set("modelo",model.id);
    history.replaceState(null,"",url);
  }
  $("result-panel").scrollIntoView({ behavior:"smooth", block:"start" });
  $("result-panel").focus({ preventScroll:true });
}
async function copy(text, button) {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else window.prompt("Copia esta dirección:",text);
    if (button) {
      const old = button.textContent;
      button.textContent = "¡Dirección copiada!";
      setTimeout(() => { button.textContent = old; }, 2100);
    }
  } catch (_) {
    window.prompt("Copia esta dirección:",text);
  }
}
function setupEvents() {
  $("brand-select").addEventListener("change",refreshResults);
  $("model-search").addEventListener("input",refreshResults);
  $("toggle-search").addEventListener("click",() => {
    $("search-panel").scrollIntoView({behavior:"smooth",block:"start"});
    $("model-search").focus({preventScroll:true});
  });
  $("change-model").addEventListener("click",() => {
    $("search-panel").scrollIntoView({behavior:"smooth",block:"start"});
    $("model-search").focus({preventScroll:true});
  });
  $("share-result").addEventListener("click",async(event) => {
    if (!chosen) return;
    const url = new URL(location.href);
    url.searchParams.set("modelo",chosen.id);
    if (navigator.share) {
      try { await navigator.share({title:"VoLTECheck: " + fullName(chosen),url:url.toString()}); return; } catch (_) {}
    }
    await copy(url.toString(),event.currentTarget);
  });
}
async function run() {
  $("year").textContent = String(new Date().getFullYear());
  const device = await detectDevice();
  if (!device.isPhone) {
    $("desktop-message").hidden = false;
    $("copy-address").addEventListener("click",() => copy("https://itseo.github.io/voltecheck/",$("copy-address")));
    return;
  }
  $("mobile-app").hidden = false;
  detected = device;
  try {
    const response = await fetch("./data/catalog.json",{cache:"no-cache"});
    if (!response.ok) throw new Error("Catálogo no disponible");
    catalog = await response.json();
    if (!catalog.brands || !catalog.guides) throw new Error("Catálogo no válido");
    allModels = expandModels(catalog);
    addBrandOptions();
    setupEvents();
    const match = matchedModel(device.model);
    detectedSummary(device,match);
    if (match) showSelectedBrand(match.brand);
    refreshResults();
    const requestedId = new URLSearchParams(location.search).get("modelo");
    const deepLink = requestedId && allModels.find((m) => m.id === requestedId);
    if (deepLink) selectModel(deepLink,false);
  } catch (error) {
    $("detect-state").textContent = "No hemos podido cargar el catálogo local. Comprueba tu conexión y vuelve a abrir la página.";
    $("results-count").textContent = "Catálogo no disponible";
    $("no-results").hidden = false;
  }
}
run();
