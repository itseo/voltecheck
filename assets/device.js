/* Detección orientativa: los navegadores pueden ocultar marca y modelo. */
export async function detectDevice() {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const uaData = navigator.userAgentData;
  const tv = /smart.?tv|hbbtv|tizen.*tv|webos.*tv|googletv|android tv|appletv|aft[bstm]|netcast|roku|viera|bravia.*tv/i.test(ua);
  const tablet = /ipad|tablet|kindle|silk\/|playbook|nexus 7|nexus 9|pixel c|sm-t\d|redmi pad/i.test(ua) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const looksPhone = /iphone|ipod|windows phone|blackberry|mobile|phone/i.test(ua);
  const android = /android/i.test(ua);
  const isPhone = !tv && !tablet && (uaData?.mobile === true || looksPhone);
  let model = "";
  let os = /iphone|ipod/i.test(ua) ? "iOS" : android ? "Android" : "Desconocido";

  if (isPhone && uaData && typeof uaData.getHighEntropyValues === "function") {
    try {
      const hints = await uaData.getHighEntropyValues(["model", "platform", "platformVersion"]);
      model = (hints.model || "").trim();
      if (hints.platform) os = hints.platform;
    } catch (_) { /* Los Client Hints pueden no estar disponibles. */ }
  }
  if (!model && android) {
    const matches = [...ua.matchAll(/;\s*([^;)]+?)\s+Build\//gi)];
    if (matches.length) model = matches[matches.length - 1][1].trim();
  }
  if (/^iphone$/i.test(model)) model = "";
  return { isPhone, tv, tablet, model, os };
}
