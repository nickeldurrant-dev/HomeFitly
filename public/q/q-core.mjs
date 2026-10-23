// Pure logic for the contractor reply page (no DOM), unit-tested in Node.
// The server re-validates everything; these checks only give early feedback.
export const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;
const LINK = /(https?:\/\/|ftp:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|us|biz|info|me|app|dev|xyz|site|online|ly|gl)\b)/i;
const MONEY = /^(0|[1-9]\d{0,7})(\.\d{1,2})?$/;

/** The token from "#<token>" only. Anything else is treated as no token. */
export function tokenFromHash(hash) {
  const raw = typeof hash === "string" ? hash.replace(/^#/, "") : "";
  return TOKEN_SHAPE.test(raw) ? raw : null;
}

export const TIMELINES = {
  asap: "As soon as possible", within_month: "Within a month", within_three_months: "Within three months", pricing_only: "Just pricing for now",
};
export const DECLINE_REASONS = { booked: "Booked out", too_small: "Job too small", outside_area: "Outside my area", other: "Other" };

/** Lines to show for the packet; every value is later set with textContent. */
export function packetLines(p) {
  const lines = [];
  lines.push(["Trade", p.trade]);
  lines.push(["Location", `${p.city} ${p.zip}`]);
  lines.push(["Timeline", TIMELINES[p.timeline] ?? p.timeline]);
  if (p.target_date) lines.push(["Target date", p.target_date]);
  if (p.size_text) lines.push(["Size or quantity", p.size_text]);
  if (p.budget != null) lines.push(["Budget", `$${p.budget}`]);
  const how = { phone: "Phone", text: "Text", email: "Email" }[p.contact_channel] ?? "Contact";
  lines.push([`Preferred contact (${how})`, p.contact_value]);
  return lines;
}

const clean = (v) => (typeof v === "string" ? v.trim() : "");
const money = (v) => clean(v).replace(/,/g, "").replace(/^\$/, "");

/** Early checks mirroring the server. Returns { field: message } (empty when OK). */
export function checkReply(kind, f) {
  const errors = {};
  const text = (name, max, required) => {
    const v = clean(f[name]);
    if (required && !v) errors[name] = "Required.";
    else if ([...v].length > max) errors[name] = `Keep it under ${max} characters.`;
    else if (v && name !== "email" && LINK.test(v)) errors[name] = "Links aren't allowed here.";
  };
  if (kind === "decline") { text("notes", 200, false); return errors; }
  text("contact_name", 120, true);
  if (!clean(f.phone) && !clean(f.email)) errors.phone = "Add a phone number or an email address.";
  if (kind === "site_visit") {
    for (let i = 0; i < 3; i++) text(`visit_time_${i}`, 80, false);
    text("notes", 500, false);
    return errors;
  }
  text("company_name", 120, true);
  text("price_includes", 500, true);
  for (const n of ["warranty_terms", "payment_terms", "notes"]) text(n, 500, false);
  if (f.price_mode === "range") {
    const lo = money(f.price_low), hi = money(f.price_high);
    if (!MONEY.test(lo)) errors.price_low = "Enter an amount like 6000 or 6000.50.";
    if (!MONEY.test(hi)) errors.price_high = "Enter an amount like 7500.";
    if (MONEY.test(lo) && MONEY.test(hi) && cents(lo) >= cents(hi)) errors.price_high = "The high end must be more than the low end.";
  } else if (!MONEY.test(money(f.price_total))) errors.price_total = "Enter an amount like 6450 or 6450.50.";
  if (clean(f.deposit_amount) && clean(f.deposit_percent)) errors.deposit_percent = "Use an amount or a percent, not both.";
  return errors;
}
function cents(s) { const [w, d = ""] = s.split("."); return BigInt(w) * 100n + BigInt((d + "00").slice(0, 2)); }

/** The JSON the server expects. Only these keys are ever sent. */
export function replyFields(kind, f) {
  const v = (name) => (clean(f[name]) ? clean(f[name]) : undefined);
  if (kind === "decline") return { company_name: v("company_name"), decline_reason: f.decline_reason || "other", notes: v("notes") };
  const contact = { contact_name: v("contact_name"), phone: v("phone"), email: v("email") };
  if (kind === "site_visit")
    return { company_name: v("company_name"), ...contact, notes: v("notes"),
      visit_times: [0, 1, 2].map((i) => v(`visit_time_${i}`)).filter(Boolean) };
  const out = {
    company_name: v("company_name"), ...contact, price_mode: f.price_mode === "range" ? "range" : "total",
    price_includes: v("price_includes"), warranty_terms: v("warranty_terms"), payment_terms: v("payment_terms"), notes: v("notes"),
    earliest_start: v("earliest_start"), valid_until: v("valid_until"),
    duration_days: v("duration_days") ? Number(v("duration_days")) : undefined,
    materials_included: f.materials_included === "yes" ? true : f.materials_included === "no" ? false : undefined,
  };
  if (out.price_mode === "range") { out.price_low = money(f.price_low); out.price_high = money(f.price_high); }
  else out.price_total = money(f.price_total);
  if (v("deposit_amount")) out.deposit_amount = money(f.deposit_amount);
  if (v("deposit_percent")) out.deposit_percent = clean(f.deposit_percent).replace(/%$/, "");
  return out;
}

/** Plain-text summary shown after sending (rendered with textContent). */
export function summary(kind, fields) {
  if (kind === "decline") return [`You declined${fields.decline_reason ? ` (${DECLINE_REASONS[fields.decline_reason]})` : ""}.`];
  if (kind === "site_visit") return ["You asked for a site visit.", ...fields.visit_times.map((t) => `Time that works: ${t}`)];
  const price = fields.price_mode === "range" ? `$${fields.price_low} to $${fields.price_high}` : `$${fields.price_total}`;
  return [`Your quote: ${price}`, `Includes: ${fields.price_includes}`];
}

export const MAX_PDF_BYTES = 5 * 1024 * 1024;
export function pdfProblem(file) {
  if (!file) return null;
  if (file.type && file.type !== "application/pdf") return "Attach a PDF file.";
  if (file.size > MAX_PDF_BYTES) return "The PDF must be 5 MB or smaller.";
  return null;
}
