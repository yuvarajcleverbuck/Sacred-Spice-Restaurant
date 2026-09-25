export const fonts = {
  display: "PlayfairDisplay-Regular",
  text: "Geist-Regular",
  textMedium: "Geist-Medium",
  textSemiBold: "Geist-SemiBold",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 };
export const radius = { sm: 0, md: 0, lg: 0, pill: 999 };
export const fontSize = { sm: 12, base: 14, lg: 16, xl: 20, "2xl": 24, "3xl": 32 };

export const money = (v: number | undefined | null) => `$${(v ?? 0).toFixed(2)}`;

export const SPICE_LABELS = ["No heat", "Mild", "Medium", "Hot", "Extra hot"];
export const spiceLabel = (g: number) => SPICE_LABELS[Math.max(0, Math.min(4, g))];

export const DIETARY: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  jain: "Jain",
  halal: "Halal",
  gluten_free: "Gluten-free",
  nut_free: "Nut-free",
  dairy_free: "Dairy-free",
};

export const ALLERGENS: Record<string, string> = {
  dairy: "Dairy",
  gluten: "Gluten",
  nuts: "Nuts",
  fish: "Fish",
  shellfish: "Shellfish",
  egg: "Egg",
  soy: "Soy",
  sesame: "Sesame",
};

export const SERVICE_LABELS: Record<string, string> = {
  pickup: "Pickup",
  delivery: "Delivery",
  dine_in: "Dine-in",
  reservation: "Reservations",
};

export const STATUS_LABELS: Record<string, string> = {
  created: "Placed",
  paid: "Paid",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  dispatched: "Dispatched",
  awaiting_pickup: "Ready for pickup",
  served: "Served",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
  confirmed: "Confirmed",
  pending_confirmation: "Tap to confirm",
  checked_in: "Checked in",
};

export function formatTime(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDate(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(isoStr: string) {
  return `${formatDate(isoStr)} · ${formatTime(isoStr)}`;
}

export function ymd(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function hhmmTo12(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${`${m}`.padStart(2, "0")} ${suffix}`;
}
