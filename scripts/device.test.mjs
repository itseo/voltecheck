import test from "node:test";
import assert from "node:assert/strict";
let counter=0;
async function detect({ua,platform="",touch=0,mobile,model}) {
  const uaData=mobile===undefined ? undefined : {
    mobile,
    async getHighEntropyValues() {return {model:model||"",platform:"Android"};}
  };
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:{userAgent:ua,platform,maxTouchPoints:touch,userAgentData:uaData}});
  const {detectDevice}=await import("../assets/device.js?case="+(++counter));
  return detectDevice();
}
test("Android móvil identificado por Client Hints",async()=>{
  const d=await detect({ua:"Mozilla/5.0 (Linux; Android 14; SM-A556B Build/UP1A) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",mobile:true,model:"SM-A556B"});
  assert.equal(d.isPhone,true);
  assert.equal(d.model,"SM-A556B");
});
test("Android móvil con User Agent tradicional",async()=>{
  const d=await detect({ua:"Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TP1A) AppleWebKit/537.36 Mobile Safari/537.36"});
  assert.equal(d.isPhone,true);
  assert.equal(d.model,"Pixel 7");
});
test("iPhone requiere selección manual",async()=>{
  const d=await detect({ua:"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"});
  assert.equal(d.isPhone,true);
  assert.equal(d.model,"");
});
test("iPad bloqueado",async()=>{
  const d=await detect({ua:"Mozilla/5.0 (iPad; CPU OS 17 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"});
  assert.equal(d.isPhone,false);
  assert.equal(d.tablet,true);
});
test("iPadOS tipo Mac bloqueado",async()=>{
  const d=await detect({ua:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",platform:"MacIntel",touch:5});
  assert.equal(d.isPhone,false);
});
test("PC bloqueado",async()=>{
  const d=await detect({ua:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127 Safari/537.36",mobile:false});
  assert.equal(d.isPhone,false);
});
test("Smart TV bloqueada",async()=>{
  const d=await detect({ua:"Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36"});
  assert.equal(d.isPhone,false);
  assert.equal(d.tv,true);
});
