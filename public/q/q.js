// Contractor reply page wiring. All text from the server or the homeowner is
// set with textContent (never as HTML), so markup shows as plain text.
import { tokenFromHash, packetLines, checkReply, replyFields, summary, pdfProblem } from "./q-core.mjs";

// Anti-framing fallback: GitHub Pages can't send `frame-ancestors`, so the page
// refuses to run inside another site's frame. (A frame that blocks scripts gets
// a dead page: the form only works through this script, and form-action is 'none'.)
if (window.top !== window.self) {
  document.documentElement.replaceChildren();
  throw new Error("framed");
}

// Reads the token from the fragment and removes it from the address bar at once,
// before anything else (including Turnstile) can see it.
function takeTokenFromAddressBar() {
  const fresh = tokenFromHash(location.hash);
  history.replaceState(null, "", location.pathname);
  return fresh;
}
let token = takeTokenFromAddressBar();

const root = document.documentElement;
const API = `${root.dataset.functionsUrl}/quote-public`;
const SITEKEY = root.dataset.turnstileSitekey;
const $ = (id) => document.getElementById(id);
const show = (id) => { for (const s of ["loading", "closed", "request", "done"]) $(s).hidden = s !== id; };
const LOADING_TEXT = $("loading").textContent;
const widgetReady = () => Boolean(window.turnstile) && typeof turnstileWidget === "string" && turnstileWidget !== "loading";

// Opening another reply link in this tab is a fragment-only navigation: the
// page isn't reloaded. Each link gets a new generation, and every answer that
// arrives for an older generation (view, photo or submit) is dropped, so
// nothing from one link can appear under, or be sent with, another.
let generation = 0;
let kind = "quote", submission = null, turnstileWidget = null;
let photoURLs = [];

async function call(body, forToken) {
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, token: forToken }),
    referrerPolicy: "no-referrer", credentials: "omit", cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function text(el, value) { el.textContent = value ?? ""; return el; }

function closed(contact) {
  text($("closed-contact-value"), contact?.value ?? "");
  $("closed-contact").hidden = !contact?.value;
  show("closed");
}

function clearPhotos() {
  for (const url of photoURLs) URL.revokeObjectURL(url);
  photoURLs = [];
  $("photos").replaceChildren();
}

/** Clears everything that belonged to the previous link. */
function resetForNewLink() {
  generation += 1;
  clearPhotos();
  for (const id of ["title", "job-text", "expires"]) text($(id), "");
  $("job-facts").replaceChildren();
  $("previous").hidden = true;
  $("previous-lines").replaceChildren();
  $("done-lines").replaceChildren();
  closed(null);
  $("form").reset();
  clearErrors();
  $("submit").disabled = false;
  setKind("quote"); // also clears the submission id
  syncPriceMode();
  if (widgetReady()) window.turnstile.reset(turnstileWidget);
  text($("loading"), LOADING_TEXT);
  show("loading");
}

async function load() {
  const mine = generation, forToken = token;
  if (!forToken) return closed();
  let res;
  try { res = await call({ action: "view" }, forToken); } catch {
    if (mine === generation) { text($("loading"), "We couldn't load this request. Check your connection and refresh."); show("loading"); }
    return;
  }
  if (mine !== generation) return; // another link was opened meanwhile
  if (res.data.state !== "open") return closed(res.data.contact);
  const p = res.data.packet;
  text($("title"), `${p.first_name} in ${p.city} is asking for a ${p.trade} quote`);
  text($("job-text"), p.request_text);
  const dl = $("job-facts");
  dl.replaceChildren();
  for (const [k, v] of packetLines(p)) { dl.append(text(document.createElement("dt"), k), text(document.createElement("dd"), v)); }
  text($("expires"), `This link works until ${new Date(res.data.expires_at).toLocaleDateString()}, unless the homeowner closes the request.`);
  clearPhotos();
  loadPhotos(res.data.photo_count, mine, forToken);
  showPrevious(res.data.response);
  show("request");
  loadTurnstile();
}

async function loadPhotos(count, mine, forToken) {
  for (let i = 0; i < Math.min(count, 6); i++) {
    const res = await call({ action: "photo", index: i }, forToken).catch(() => null);
    if (mine !== generation) return; // late photo for an older link or load: dropped
    if (!res || res.data.state !== "open" || !res.data.base64) continue;
    const bytes = Uint8Array.from(atob(res.data.base64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    photoURLs.push(url);
    const img = document.createElement("img");
    img.alt = `Job photo ${i + 1}`;
    img.src = url;
    img.addEventListener("click", () => img.classList.toggle("full"));
    $("photos").append(img);
  }
}

function showPrevious(r) {
  if (!r) { $("previous").hidden = true; return; }
  const times = Array.isArray(r.visit_times) ? r.visit_times.slice(0, 3) : [];
  const lines = r.kind === "decline" ? ["You declined this request."]
    : r.kind === "site_visit" ? ["You asked for a site visit.", times.length ? `Times you offered: ${times.join(", ")}` : null]
    : [r.price_high ? `Quote: $${r.price_low} to $${r.price_high}` : `Quote: $${r.price_low}`, r.price_includes ? `Includes: ${r.price_includes}` : null];
  $("previous-lines").replaceChildren(...lines.filter(Boolean).map((l) => text(document.createElement("li"), l)));
  $("previous").hidden = false;
  // Prefill the form with this link's current answer.
  const f = $("form");
  for (const name of ["company_name", "contact_name", "phone", "email", "price_includes", "warranty_terms", "payment_terms", "notes"])
    if (r[name] != null && f.elements[name]) f.elements[name].value = r[name];
  if (r.kind === "quote") {
    if (r.price_high) { f.elements.price_mode.value = "range"; f.elements.price_low.value = r.price_low; f.elements.price_high.value = r.price_high; }
    else f.elements.price_total.value = r.price_low ?? "";
    if (r.deposit_amount) f.elements.deposit_amount.value = r.deposit_amount;
    if (r.deposit_percent) f.elements.deposit_percent.value = r.deposit_percent;
    if (r.earliest_start) f.elements.earliest_start.value = r.earliest_start;
    if (r.valid_until) f.elements.valid_until.value = r.valid_until;
    if (r.duration_days) f.elements.duration_days.value = r.duration_days;
    if (r.materials_included != null) f.elements.materials_included.value = r.materials_included ? "yes" : "no";
  }
  if (r.kind === "site_visit") for (let i = 0; i < 3; i++) f.elements[`visit_time_${i}`].value = times[i] ?? "";
  if (r.kind === "decline" && r.decline_reason) f.elements.decline_reason.value = r.decline_reason;
  setKind(r.kind);
  syncPriceMode();
}

function setKind(next) {
  kind = next;
  submission = null;
  for (const b of document.querySelectorAll(".tabs button")) b.setAttribute("aria-selected", String(b.dataset.kind === kind));
  for (const fs of document.querySelectorAll("fieldset[data-for]")) fs.hidden = !fs.dataset.for.split(" ").includes(kind);
  for (const o of document.querySelectorAll(".opt[data-opt]")) o.hidden = !o.dataset.opt.split(" ").includes(kind);
  text($("submit"), kind === "quote" ? "Send quote" : kind === "site_visit" ? "Ask for a site visit" : "Decline");
}
function syncPriceMode() {
  const range = $("form").elements.price_mode.value === "range";
  document.querySelector('[data-mode="total"]').hidden = range;
  document.querySelector('[data-mode="range"]').hidden = !range;
}

function loadTurnstile() {
  if (turnstileWidget !== null || !SITEKEY) return;
  turnstileWidget = "loading";
  const s = document.createElement("script");
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  s.async = true;
  s.referrerPolicy = "no-referrer";
  s.onload = () => { turnstileWidget = window.turnstile.render("#turnstile", { sitekey: SITEKEY }); };
  document.head.append(s);
}

function failed(message) { const e = $("form-error"); text(e, message); e.hidden = false; }
function clearErrors() {
  $("form-error").hidden = true;
  for (const e of document.querySelectorAll(".field-error")) e.remove();
}

async function fileBase64(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 32768) bin += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(bin);
}

async function submit(event) {
  event.preventDefault();
  const mine = generation, forToken = token;
  if (!forToken) return closed();
  clearErrors();
  const f = $("form");
  const values = Object.fromEntries([...new FormData(f).entries()].filter(([, v]) => typeof v === "string"));
  const answerKind = kind;
  const errors = checkReply(answerKind, values);
  for (const [name, message] of Object.entries(errors)) {
    const input = f.elements[name];
    if (input?.closest("label")) input.closest("label").append(text(Object.assign(document.createElement("span"), { className: "field-error" }), message));
  }
  if (Object.keys(errors).length) return failed("Please check the highlighted fields.");
  const file = answerKind === "quote" ? f.elements.pdf.files[0] : null;
  const problem = pdfProblem(file);
  if (problem) return failed(problem);
  const captcha = widgetReady() ? window.turnstile.getResponse(turnstileWidget) : null;
  if (!captcha) return failed("Please complete the check above the button.");
  const fields = replyFields(answerKind, values);
  // One id per attempt: a retry after a lost response can't create a second reply.
  submission ??= crypto.randomUUID();
  const attempt = submission;
  $("submit").disabled = true;
  try {
    const pdf = file ? await fileBase64(file) : null;
    if (mine !== generation) return; // another link was opened while the PDF was read: send nothing
    const res = await call({ action: "respond", kind: answerKind, fields, submission_id: attempt, turnstile_token: captcha,
      ...(pdf ? { pdf_base64: pdf } : {}) }, forToken);
    if (mine !== generation) return; // this answer belongs to a link that's no longer open here
    if (res.data.state === "closed") return closed();
    if (res.status === 429) return failed("Too many tries. Please wait a few minutes and try again.");
    if (res.data.error === "captcha_failed") { if (widgetReady()) window.turnstile.reset(turnstileWidget); return failed("The check didn't pass. Please try again."); }
    if (res.data.error === "pdf_active_content") return failed("This PDF can't be accepted because it contains scripts, attachments or actions. Save it as a plain PDF and try again.");
    if (res.data.error === "invalid_pdf") return failed("That file doesn't look like a PDF.");
    if (res.data.error === "invalid_request") return failed(res.data.reason === "links_not_allowed" ? "Links aren't allowed in the answer." : "Please check the highlighted fields.");
    if (res.data.state !== "received") return failed("We couldn't send that just now. Please try again.");
    submission = null;
    $("done-lines").replaceChildren(...summary(answerKind, fields).map((l) => text(document.createElement("li"), l)));
    show("done");
  } catch {
    if (mine === generation) failed("We couldn't send that. Check your connection and try again; your answer won't be sent twice.");
  } finally {
    if (mine === generation) $("submit").disabled = false;
  }
}

// Another reply link opened in this tab: scrub it from the address bar first,
// then start over as if the page had been freshly loaded with that link.
function onHashChange() {
  const fresh = takeTokenFromAddressBar();
  if (!fresh || fresh === token) return; // empty, malformed or the same link: nothing to switch
  token = fresh;
  resetForNewLink();
  load();
}

for (const b of document.querySelectorAll(".tabs button")) b.addEventListener("click", () => setKind(b.dataset.kind));
$("form").addEventListener("change", (e) => { if (e.target.name === "price_mode") syncPriceMode(); });
$("form").addEventListener("submit", submit);
$("again").addEventListener("click", () => { generation += 1; load(); });
window.addEventListener("hashchange", onHashChange);
setKind("quote");
load();
