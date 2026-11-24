export type TaskStatus = "queued" | "running" | "approval" | "verifying" | "done" | "blocked" | "skipped";

export const TASKS: { title: string; what: string; why: string; data: string; result: string }[] = [
  ["Creating business profile", "Saving name, audience and products.", "Every later step reads from this profile.", "Your blueprint", "Profile saved."],
  ["Preparing brand identity", "Choosing colours, type and a wordmark.", "Keeps your store and receipts consistent.", "Brand direction", "Indigo + sand palette, wordmark ready."],
  ["Generating storefront", "Filling the Fashion template with your copy.", "Templates are tested for speed and checkout.", "Blueprint, brand", "6 pages: Home, Shop, Product, About, Contact, Policies."],
  ["Creating product catalogue", "Writing listings and suggesting prices.", "Customers need products to buy.", "Product list, pricing", "5 products, 1 digital. Prices in NGN."],
  ["Configuring commerce", "Connecting checkout and your ledger.", "Orders count as paid only after confirmation.", "Currencies: NGN, USD", "Checkout active. Ledger created."],
  ["Preparing domain", "Quoting adireandco.com for your approval.", "A custom address builds trust.", "Business name", "adireandco.com registered. DNS and HTTPS verified."],
  ["Preparing launch", "Checking links, policies and mobile layout.", "Catches issues before customers do.", "Storefront, catalogue", "Store published."],
].map(([title, what, why, data, result]) => ({ title, what, why, data, result }));

export type AnswerKey = "idea" | "audience" | "type" | "budget" | "name" | "cat";

export const QS: { q: string; key: Exclude<AnswerKey, "cat">; chips: string[]; ph: string }[] = [
  { q: "Hi Funmi — I'm your Launchmate agent. What would you like to sell?", key: "idea", chips: ["Hand-dyed adire bags and scarves", "Skincare products", "Digital templates"], ph: "Describe your products…" },
  { q: "Lovely. Who are your customers?", key: "audience", chips: ["Young professionals in Lagos", "Gift buyers across Nigeria", "Diaspora customers abroad"], ph: "Who do you want to serve?" },
  { q: "Will you sell physical items, digital downloads, or both?", key: "type", chips: ["Physical only", "Both physical and digital", "Digital only"], ph: "Physical, digital or both" },
  { q: "Roughly how much can you spend to get started? This covers things like your domain.", key: "budget", chips: ["Under ₦50,000", "₦50,000 – ₦150,000", "Over ₦150,000"], ph: "Your starting budget" },
  { q: "Last one — do you have a name in mind? Here are a few ideas.", key: "name", chips: ["Adire & Co.", "Indigo Lane", "Eleko Studio"], ph: "Your business name" },
];

export const FINAL_MSG = "Thanks — here's your business blueprint. Edit anything that's off, then approve and I'll start building.";

export const CTX: [AnswerKey, string][] = [
  ["name", "Business name"], ["idea", "What you sell"], ["audience", "Target audience"],
  ["type", "Product type"], ["budget", "Budget"], ["cat", "Category"],
];

export const PAY: Record<string, [string, string]> = {
  Paid: ["#E9F4EE", "#1F6B43"],
  "Pending payment": ["#FBF3E6", "#8A5E1C"],
  Refunded: ["#F1F2F1", "#5E6862"],
};

export interface Order {
  id: string; customer: string; product: string; total: string; pay: string; ful: string; city: string; confirm: string; agent: string;
}
export const ORDERS: Order[] = [
  ["#LM-1048", "Tolu Adebayo", "Indigo Market Tote", "₦18,500", "Paid", "Processing", "Yaba, Lagos", "Confirmed by payment provider · 10:42", "Drafted dispatch label; awaiting pickup booking."],
  ["#LM-1047", "Kemi Bello", "Eleko Silk Scarf ×2", "₦64,000", "Paid", "Fulfilled", "Lekki, Lagos", "Confirmed by payment provider · 09:16", "Sent delivery update to customer."],
  ["#LM-1046", "Daniel Mensah", "Adire Pattern Pack", "$12.00", "Paid", "Delivered", "Accra, Ghana", "Confirmed by payment provider · USD", "Issued protected download link (expires in 72h)."],
  ["#LM-1045", "Ngozi Eze", "Kampala Pillow Cover", "₦14,000", "Pending payment", "Not started", "Enugu", "Not yet confirmed. Customer returned from checkout — still waiting on the provider.", "Will remind customer in 24h if unpaid."],
  ["#LM-1044", "Ade Ogun", "Indigo Market Tote", "₦18,500", "Paid", "Fulfilled", "Ibadan", "Confirmed by payment provider", "—"],
  ["#LM-1043", "Sade Lawal", "Eleko Silk Scarf", "₦32,000", "Refunded", "Cancelled", "Ikeja, Lagos", "Refund confirmed · 18 Nov", "Recorded refund in ledger."],
].map(([id, customer, product, total, pay, ful, city, confirm, agent]) => ({ id, customer, product, total, pay, ful, city, confirm, agent }));

export interface Product { name: string; price: string; type: string; inv: string; pub: string; img: string; low?: boolean; draft?: boolean }
export const PRODUCTS: Product[] = [
  { name: "Indigo Market Tote", price: "₦18,500", type: "Physical", inv: "24 in stock", pub: "Published", img: "tote photo" },
  { name: "Eleko Silk Scarf", price: "₦32,000", type: "Physical", inv: "3 left", pub: "Published", img: "scarf photo", low: true },
  { name: "Kampala Pillow Cover", price: "₦14,000", type: "Physical", inv: "40 in stock", pub: "Published", img: "pillow photo" },
  { name: "Adire Pattern Pack", price: "$12.00", type: "Digital", inv: "Unlimited", pub: "Published", img: "pattern preview" },
  { name: "Weekend Wrap Dress", price: "₦45,000", type: "Physical", inv: "8 in stock", pub: "Draft", img: "dress photo", draft: true },
];

export const REV = [12, 0, 18.5, 32, 18.5, 46.5, 0, 14, 64, 18.5, 32, 50.5, 82.5, 18.5];
export const STAGES = ["Empty plot", "Idea", "Identity", "Storefront", "Products", "Infrastructure", "Live"];

export const NAV: { id: string; label: string; divider?: boolean }[] = [
  { id: "overview", label: "Overview" }, { id: "world", label: "Business World" }, { id: "store", label: "My Store" },
  { id: "products", label: "Products" }, { id: "orders", label: "Orders" }, { id: "finances", label: "Finances" },
  { id: "agent", label: "Business Agent" }, { id: "activity", label: "Activity", divider: true }, { id: "settings", label: "Permissions" },
];

export const TASK_META: Record<TaskStatus, { mark: string; dotBg: string; dotBd: string; label: string; pillBg: string; pillFg: string; fg: string; anim: string }> = {
  done: { mark: "✓", dotBg: "#26734D", dotBd: "#26734D", label: "Done", pillBg: "#E9F4EE", pillFg: "#1F6B43", fg: "#202723", anim: "none" },
  running: { mark: "", dotBg: "#FFFFFF", dotBd: "#26734D", label: "Working", pillBg: "#EEF6F0", pillFg: "#185C3B", fg: "#202723", anim: "lmPulse 1.1s infinite" },
  queued: { mark: "", dotBg: "#FFFFFF", dotBd: "#D5DBD6", label: "Queued", pillBg: "#F3F5F2", pillFg: "#78817B", fg: "#78817B", anim: "none" },
  approval: { mark: "!", dotBg: "#C58B34", dotBd: "#C58B34", label: "Needs you", pillBg: "#FBF3E6", pillFg: "#8A5E1C", fg: "#202723", anim: "none" },
  verifying: { mark: "", dotBg: "#FFFFFF", dotBd: "#4285B5", label: "Verifying", pillBg: "#EAF2F8", pillFg: "#2F6A92", fg: "#202723", anim: "lmPulse 1.1s infinite" },
  blocked: { mark: "×", dotBg: "#D94B4B", dotBd: "#D94B4B", label: "Rejected", pillBg: "#FCEEEE", pillFg: "#8E2F2F", fg: "#202723", anim: "none" },
  skipped: { mark: "–", dotBg: "#B4BBB6", dotBd: "#B4BBB6", label: "Skipped", pillBg: "#F3F5F2", pillFg: "#78817B", fg: "#78817B", anim: "none" },
};

export const WORLD_OBJECTS: { key: string; label: string; status: string; route: string }[] = [
  { key: "store", label: "Storefront", status: "Published", route: "store" },
  { key: "products", label: "Product display", status: "5 products", route: "products" },
  { key: "orders", label: "Orders dock", status: "2 to fulfil", route: "orders" },
  { key: "payments", label: "Payments", status: "Checkout active", route: "finances" },
  { key: "finance", label: "Finance ledger", status: "Up to date", route: "finances" },
  { key: "domain", label: "Domain", status: "adireandco.com · HTTPS", route: "store" },
];

export const ACTIVITY_FULL = [
  ["Today 10:43", "Drafted dispatch label for #LM-1048", "Done", "Not required", "—"],
  ["Today 09:20", "Sent delivery update to Kemi Bello", "Done", "Not required", "—"],
  ["20 Nov 14:05", "Registered adireandco.com", "Verified", "Approved by Funmi", "tx 0x9f3…a21"],
  ["20 Nov 14:07", "Configured DNS and HTTPS", "Verified", "Not required", "—"],
  ["20 Nov 13:58", "Published storefront", "Done", "Approved by Funmi", "—"],
  ["18 Nov 16:30", "Refunded #LM-1043", "Done", "Approved by Funmi", "ref RF-2231"],
  ["18 Nov 11:12", "Tried to renew stock without approval", "Blocked", "Policy: ask first", "—"],
].map(([time, t, outcome, approval, ref]) => ({ time, t, outcome, approval, ref }));

export const RULE_LABELS = ["Any purchase or payment", "Publishing storefront changes", "Refunding a customer", "Replying to customer messages"];

export function agentReply(text: string): string {
  if (/order/i.test(text)) return "Today you have 2 orders: #LM-1048 (₦18,500, paid, processing) and #LM-1047 (₦64,000, paid, fulfilled). One older order is still waiting on payment.";
  if (/revenue|summar/i.test(text)) return "This week: ₦201,000 from 9 verified orders, and $36.00 from 3 digital sales. I keep the two currencies separate.";
  if (/domain/i.test(text)) return "adireandco.com is connected and HTTPS is verified. It renews on 21 Nov 2027 for 16.98 USD — I'll ask before renewing.";
  return "On it. I'll prepare this and show you the result before anything goes live.";
}

/* ───────────── isometric "Business World" scene ───────────── */
const C = {
  white: ["#FFFFFF", "#F1F2EE", "#E3E6E0"], off: ["#F4F5F1", "#E6E8E2", "#D8DBD4"], green: ["#3A8A60", "#26734D", "#1D603F"],
  deep: ["#226B47", "#185C3B", "#124A2F"], soft: ["#E4F0E8", "#D3E5D9", "#C3DACB"], indigo: ["#4A5D93", "#34467A", "#2A3A66"],
  indigo2: ["#7A8BB8", "#5D6F9F", "#4D5E8B"], sand: ["#F0E3C6", "#E1CFA8", "#D2BF96"], tan: ["#D6A25A", "#C58B34", "#A9752A"],
  kraft: ["#E2CDA9", "#D0B88F", "#BCA37A"], pole: ["#DDE2DB", "#CDD3CB", "#BCC3BA"], glass: ["#EEF6F0", "#DCEBE1", "#CCE0D3"],
} as const;
type ColorKey = keyof typeof C;
// [x, y, w, d, h, z, color, minStage, maxStage?, group?]
type BoxDef = [number, number, number, number, number, number, ColorKey, number, number?, string?];
const B: BoxDef[] = [
  [-2, -2, 104, 104, 4, -4, "off", 0], [0, 0, 100, 100, 0.4, 0, "white", 0],
  [10, 46, 6, 6, 1, 0.4, "soft", 1, 2], [9.5, 45.5, 7, 7, 7, 6, "green", 1, 2],
  [19, 24, 30, 20, 20, 0.4, "white", 3, 99, "store"], [17, 22, 34, 24, 2, 20.4, "off", 3, 99, "store"], [19, 44, 30, 6, 1.4, 14, "green", 3, 99, "store"],
  [22, 44, 12, 0.6, 9, 4, "glass", 3, 99, "store"], [37, 44, 7, 0.6, 12, 0.4, "deep", 3, 99, "store"],
  [25, 44.5, 18, 1.4, 5, 23, "green", 2, 99, "store"], [27, 45, 1, 1, 3, 20.4, "pole", 2, 99, "store"], [40, 45, 1, 1, 3, 20.4, "pole", 2, 99, "store"],
  [58, 26, 26, 2.5, 17, 0.4, "off", 4, 99, "products"], [59, 30, 24, 4, 0.8, 11, "white", 4, 99, "products"],
  [61, 30.5, 4, 3, 4.5, 11.8, "indigo2", 4, 99, "products"], [68, 30.5, 4, 3, 4.5, 11.8, "indigo", 4, 99, "products"], [75, 31, 3, 3, 3.5, 11.8, "tan", 4, 99, "products"],
  [60, 38, 24, 11, 7, 0.4, "sand", 4, 99, "products"], [62, 41, 5, 2, 6, 7.4, "indigo", 4, 99, "products"], [70, 40, 5, 4, 1.4, 7.4, "indigo2", 4, 99, "products"], [78, 42, 3.5, 3.5, 4, 7.4, "tan", 4, 99, "products"],
  [71, 64, 11, 11, 11, 0.4, "white", 5, 99, "payments"], [70, 63, 13, 13, 1, 11.4, "green", 5, 99, "payments"], [72.5, 67, 8, 5, 0.6, 16, "deep", 5, 99, "payments"],
  [46, 74, 16, 11, 1, 0.4, "white", 5, 99, "finance"], [49, 76, 4, 4, 5, 1.4, "sand", 5, 99, "finance"], [54.5, 75, 4, 4, 3, 1.4, "sand", 5, 99, "finance"], [56, 80, 4, 4, 7, 1.4, "sand", 5, 99, "finance"],
  [27, 68, 8, 8, 1.5, 0.4, "off", 5, 99, "domain"], [30.3, 71.3, 1.4, 1.4, 17, 1.9, "pole", 5, 99, "domain"], [26.5, 67.5, 9, 9, 9, 19, "glass", 5, 99, "domain"],
  [33, 54, 15, 11, 0.5, 0.4, "soft", 6, 99, "orders"], [35, 56, 4.5, 4.5, 3.5, 0.9, "kraft", 6, 99, "orders"], [41, 58.5, 3.8, 3.8, 3, 0.9, "kraft", 6, 99, "orders"], [35.5, 56.5, 3.2, 3.2, 2.6, 4.4, "kraft", 6, 99, "orders"],
];

const u = (v: number) => (v * 0.62).toFixed(2) + "cqmin";

export interface IsoBox {
  x: string; y: string; w: string; d: string; h: string; top: string; front: string; side: string;
  topT: string; frontT: string; sideT: string; op: number; wrapT: string; origin: string;
}

export function boxes(stage: number, focus: string | null): IsoBox[] {
  return B.map(([x, y, w, d, h, z, c, mn, mx = 99, g]) => {
    const on = stage >= mn && stage <= mx;
    const col = C[c];
    const dim = focus && g && g !== focus ? 0.35 : 1;
    return {
      x: u(x), y: u(y), w: u(w), d: u(d), h: u(h), top: col[0], front: col[1], side: col[2],
      topT: `translateZ(${u(z + h)})`, frontT: `translateZ(${u(z)}) rotateX(-90deg)`, sideT: `translateZ(${u(z)}) rotateY(90deg)`,
      op: on ? dim : 0, wrapT: on ? "none" : "scale3d(.6,.6,.6)", origin: `${u(x + w / 2)} ${u(y + d / 2)}`,
    };
  });
}
