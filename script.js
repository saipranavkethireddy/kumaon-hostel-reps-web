// STEP 1: Paste the published Google Sheets CSV URL here when ready.
// Leave blank to use demonstration data while developing.
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2Gp8CITVmooZAu2RbCCbrPbMMwU1MhOUhU2ONA8OYR2f1O587l0h6SBMsC4Wm1BFKgaIypaMVFyij/pub?gid=0&single=true&output=csv";
const PAGE_SIZE = Infinity;
const demoMembers = [
  { Name: "Sample Secretary", Role: "Secretary", Year: "2025-26", Photo: "" },
  { Name: "Sample Warden", Role: "Warden", Year: "2024-25", Photo: "" },
  {
    Name: "Sample Representative",
    Role: "Representative",
    Year: "2023-24",
    Photo: "",
  },
];
let members = [],
  currentRole = "All",
  currentYear = "All",
  query = "",
  page = 1;
const grid = document.querySelector("#member-grid");
const status = document.querySelector("#status");
const pagination = document.querySelector("#pagination");
const search = document.querySelector("#search-input");
const yearSelect = document.querySelector("#year-filter");
const safe = (value) => String(value ?? "").trim();
const placeholder = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#dfe6eb"/><circle cx="200" cy="145" r="60" fill="#aab9c5"/><path d="M70 365c10-95 70-140 130-140s120 45 130 140" fill="#aab9c5"/></svg>')}`;
function normalizeRole(role) {
  const r = safe(role).toLowerCase();
  if (r.includes("warden")) return "Warden";
  if (r.includes("secretary")) return "Secretary";
  if (r.includes("representative")) return "Representative";
  return safe(role) || "Other";
}
function normalize(row) {
  return {
    name: safe(row.Name),
    role: normalizeRole(row.Role),
    year: safe(row.Year),
    photo: safe(row.Photo),
  };
}
function photoUrl(value) {
  if (!value) return placeholder;
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) ? u.href : placeholder;
  } catch {
    return placeholder;
  }
}
function createCard(m) {
  const card = document.createElement("article");
  card.className = "member-card";
  const img = document.createElement("img");
  img.className = "member-photo";
  img.src = photoUrl(m.photo);
  img.alt = `Portrait of ${m.name}`;
  img.loading = "lazy";
  img.onerror = () => {
    img.onerror = null;
    img.src = placeholder;
  };
  const details = document.createElement("div");
  details.className = "member-details";
  const title = document.createElement("h3");
  title.textContent = m.name;
  const role = document.createElement("p");
  role.textContent = m.role;
  const year = document.createElement("p");
  year.textContent = m.year;
  details.append(title, role, year);
  card.append(img, details);
  return card;
}
function refreshYears() {
  const years = [...new Set(members.map((m) => m.year).filter(Boolean))].sort(
    (a, b) => b.localeCompare(a, undefined, { numeric: true }),
  );
  yearSelect.replaceChildren(
    new Option("All years", "All"),
    ...years.map((y) => new Option(y, y)),
  );
  if (years.includes(currentYear)) yearSelect.value = currentYear;
  else currentYear = "All";
}
function render() {
  const matching = members.filter(
    (m) =>
      (currentRole === "All" || m.role === currentRole) &&
      (currentYear === "All" || m.year === currentYear) &&
      `${m.name} ${m.role} ${m.year}`.toLowerCase().includes(query),
  );
  const pages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  page = Math.min(page, pages);
  grid.replaceChildren(
    ...matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(createCard),
  );
  status.textContent = matching.length
    ? `${matching.length} record${matching.length === 1 ? "" : "s"} found`
    : "No matching records found.";
  pagination.replaceChildren();
  if (pages <= 1) return;
  for (let i = 1; i <= pages; i++) {
    const b = document.createElement("button");
    b.className = `page-btn${i === page ? " active" : ""}`;
    b.textContent = i;
    b.setAttribute("aria-label", `Page ${i}`);
    b.setAttribute("aria-current", i === page ? "page" : "false");
    b.addEventListener("click", () => {
      page = i;
      render();
      document.querySelector("#archive").scrollIntoView({ behavior: "smooth" });
    });
    pagination.append(b);
  }
}
async function loadMembers() {
  if (!GOOGLE_SHEET_CSV_URL) {
    members = demoMembers.map(normalize);
    refreshYears();
    render();
    status.textContent +=
      " Demonstration data — connect Google Sheets before launch.";
    return;
  }
  try {
    // Append a timestamp query parameter to bypass Google Sheets and CDN caching
    const separator = GOOGLE_SHEET_CSV_URL.includes("?") ? "&" : "?";
    const cacheBustedUrl = `${GOOGLE_SHEET_CSV_URL}${separator}_t=${Date.now()}`;

    const response = await fetch(cacheBustedUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    if (!window.Papa) throw new Error("CSV parser did not load");
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: "greedy" });
    if (parsed.errors.length) console.warn("CSV warnings", parsed.errors);
    members = parsed.data.map(normalize).filter((m) => m.name);
    refreshYears();
    render();
  } catch (error) {
    console.error("Archive loading failed:", error);
    status.textContent = "Unable to load the archive. Please try again later.";
  }
}
document.querySelectorAll("[data-filter]").forEach((btn) =>
  btn.addEventListener("click", () => {
    currentRole = btn.dataset.filter;
    page = 1;
    document.querySelectorAll("[data-filter]").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    render();
  }),
);
document.querySelectorAll("[data-category-link]").forEach((link) =>
  link.addEventListener("click", () => {
    const btn = document.querySelector(
      `[data-filter="${link.dataset.categoryLink}"]`,
    );
    btn?.click();
  }),
);
search.addEventListener("input", () => {
  query = search.value.trim().toLowerCase();
  page = 1;
  render();
});
yearSelect.addEventListener("change", () => {
  currentYear = yearSelect.value;
  page = 1;
  render();
});
const menu = document.querySelector("#menu-toggle"),
  navLinks = document.querySelector("#nav-links");
menu.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }),
);
loadMembers();
