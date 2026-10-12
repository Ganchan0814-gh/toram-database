'use strict';
const CATS = [["items","アイテム"],["equipment","装備"],["monsters","モンスター・ボス"],["skills","スキル"],["materials","素材"],["recipes","製作レシピ"],["crystas","クリスタ"],["maps","マップ・狩場"],["builds","ビルド"]];
const LABEL = {equipType:"装備種別",stats:"能力値",obtain:"入手先",dropFrom:"ドロップ元",materials:"製作素材",related:"関連情報",kind:"種別",element:"属性",locations:"出現場所",drops:"ドロップアイテム",weaponType:"武器種",tree:"スキルツリー",effect:"効果",requirements:"習得・装着条件",usage:"用途",recipes:"関連レシピ",product:"完成品",ingredients:"必要素材",conditions:"製作条件",monsters:"出現モンスター",huntingNotes:"狩場情報",purpose:"目的",statPolicy:"ステータス方針",skills:"スキル構成",equipment:"装備",combo:"コンボ",type:"種別"};
const HIDE = ["id","name","category","aliases","description","sources","verified","updatedAt","isSample"];
const S = {q:"", cat:"all", sort:"name", ver:false};
let ALL = [], BY = {}, ERR = [];
const $ = s => document.querySelector(s);
function el(t, c, x){ const e = document.createElement(t); if(c) e.className = c; if(x != null) e.textContent = x; return e; }

async function load(){
  const r = await Promise.allSettled(CATS.map(([k]) => fetch("data/" + k + ".json").then(x => { if(!x.ok) throw new Error("HTTP " + x.status); return x.json(); })));
  r.forEach((x, i) => {
    const [k, l] = CATS[i];
    if(x.status !== "fulfilled"){ ERR.push(l + "（data/" + k + ".json）を読み込めません：" + x.reason.message + "。JSONの書き間違いの可能性があります。"); return; }
    const a = x.value && Array.isArray(x.value.records) ? x.value.records : [];
    a.forEach(o => {
      if(!o || typeof o !== "object" || !o.id){ ERR.push(l + "：idのないデータをスキップしました。"); return; }
      if(BY[o.id]){ ERR.push("IDが重複しています：" + o.id); return; }
      o._cat = k; BY[o.id] = o; ALL.push(o);
    });
  });
  ALL.forEach(o => { const t = []; flat(o, t); o._t = t.join(" ").toLowerCase(); });
  route();
}
function flat(v, out){
  if(v == null) return;
  if(typeof v === "string"){ out.push(v); if(BY[v]) out.push(BY[v].name || ""); }
  else if(typeof v === "number" || typeof v === "boolean") out.push(String(v));
  else if(Array.isArray(v)) v.forEach(x => flat(x, out));
  else if(typeof v === "object") Object.entries(v).forEach(([k, x]) => { if(k[0] !== "_") flat(x, out); });
}
function catLabel(k){ const c = CATS.find(x => x[0] === k); return c ? c[1] : k; }

function filtered(skipCat){
  const q = S.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return ALL.filter(o => (skipCat || S.cat === "all" || o._cat === S.cat) && (!S.ver || o.verified === true) && q.every(w => o._t.includes(w)));
}
function render(){
  const e = $("#err"); e.replaceChildren(); ERR.forEach(m => e.append(el("p", null, m)));
  const base = filtered(true), cb = $("#cats"); cb.replaceChildren();
  [["all","すべて"]].concat(CATS).forEach(([k, l]) => {
    const n = k === "all" ? base.length : base.filter(o => o._cat === k).length;
    const b = el("button", S.cat === k ? "on" : "", l + "（" + n + "）");
    b.type = "button"; b.onclick = () => { S.cat = k; render(); }; cb.append(b);
  });
  const rows = filtered(false).sort((a, b) => S.sort === "new" ? String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")) : String(a.name || "").localeCompare(String(b.name || ""), "ja"));
  $("#count").textContent = rows.length + "件";
  const list = $("#list"); list.replaceChildren();
  if(!rows.length){ list.append(el("p", "na", ALL.length ? "該当するデータがありません。キーワードや絞り込みを変えてください。" : "データがまだ登録されていません。")); return; }
  rows.forEach(o => {
    const c = el("div", "card"); c.tabIndex = 0;
    c.append(el("h3", null, o.name || "（名称未登録）"));
    c.append(badges(o));
    c.append(el("p", null, o.description || "情報未登録"));
    const go = () => { location.hash = encodeURIComponent(o.id); };
    c.onclick = go; c.onkeydown = ev => { if(ev.key === "Enter") go(); };
    list.append(c);
  });
}
function badges(o){
  const d = el("div"); d.append(el("span", "badge", catLabel(o._cat)));
  if(o.isSample) d.append(el("span", "badge sample", "サンプルデータ"));
  d.append(el("span", o.verified === true ? "badge ok" : "badge", o.verified === true ? "確認済み" : "未確認"));
  return d;
}
function link(o){ const a = el("a", null, o.name || o.id); a.href = "#" + encodeURIComponent(o.id); return a; }
function val1(x){
  if(x && typeof x === "object"){
    const s = el("span"), r = BY[x.id];
    s.append(r ? link(r) : document.createTextNode(String(x.id || "")));
    Object.entries(x).forEach(([k, v]) => { if(k !== "id") s.append(" " + (k === "qty" ? "×" : k + "：") + v); });
    return s;
  }
  if(typeof x === "string" && BY[x]) return link(BY[x]);
  return document.createTextNode(String(x));
}
function val(v){
  if(v == null || v === "" || (Array.isArray(v) && !v.length)) return el("span", "na", "情報未登録");
  if(Array.isArray(v)){ const u = el("ul"); v.forEach(x => { const li = el("li"); li.append(val1(x)); u.append(li); }); return u; }
  return val1(v);
}
function row(dl, k, node){ dl.append(el("dt", null, k)); const d = el("dd"); d.append(node); dl.append(d); }
function showDetail(o){
  const d = $("#detail"); d.replaceChildren(); d.hidden = false;
  const w = el("div", "in"), back = el("button", null, "← 一覧へ戻る");
  back.type = "button"; back.onclick = () => { location.hash = ""; };
  w.append(back, el("h2", null, o.name || "（名称未登録）"), badges(o));
  const dl = el("dl");
  row(dl, "説明", val(o.description));
  row(dl, "別名", val(Array.isArray(o.aliases) ? o.aliases : []));
  Object.keys(o).filter(k => k[0] !== "_" && !HIDE.includes(k)).forEach(k => row(dl, LABEL[k] || k, val(o[k])));
  const src = el("ul"), ss = Array.isArray(o.sources) ? o.sources : [];
  ss.forEach(u => { const li = el("li"); if(/^https?:\/\//i.test(u)){ const a = el("a", null, u); a.href = u; a.target = "_blank"; a.rel = "noopener noreferrer"; li.append(a); } else li.textContent = String(u); src.append(li); });
  row(dl, "情報源", ss.length ? src : val([]));
  row(dl, "最終更新日", val(o.updatedAt));
  w.append(dl); d.append(w); d.scrollTop = 0;
}
function route(){
  let id = ""; try { id = decodeURIComponent(location.hash.slice(1)); } catch(e) {}
  if(id && BY[id]) showDetail(BY[id]); else { $("#detail").hidden = true; render(); }
}
$("#q").oninput = e => { S.q = e.target.value; render(); };
$("#sort").onchange = e => { S.sort = e.target.value; render(); };
$("#ver").onchange = e => { S.ver = e.target.checked; render(); };
$("#reset").onclick = () => { S.q = ""; S.cat = "all"; S.sort = "name"; S.ver = false; $("#q").value = ""; $("#sort").value = "name"; $("#ver").checked = false; render(); };
window.onhashchange = route;
(function theme(){
  let t = null; try { t = localStorage.getItem("theme"); } catch(e) {}
  if(!t) t = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = t;
  $("#theme").onclick = () => { t = t === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = t; try { localStorage.setItem("theme", t); } catch(e) {} };
})();
load();
