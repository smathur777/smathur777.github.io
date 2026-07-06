const STORAGE_KEY = "smathur777-visitor-log";
const MAX_ENTRIES = 25;

interface VisitEntry {
  time: string;
  path: string;
  userAgent: string;
  language: string;
  screen: string;
  timezone: string;
}

function isVisitEntry(value: unknown): value is VisitEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.time === "string" &&
    typeof entry.path === "string" &&
    typeof entry.userAgent === "string" &&
    typeof entry.language === "string" &&
    typeof entry.screen === "string" &&
    typeof entry.timezone === "string"
  );
}

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required element: #${id}`);
  }
  return element as T;
}

function loadEntries(): VisitEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(isVisitEntry) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: VisitEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function collectEntry(): VisitEntry {
  return {
    time: new Date().toISOString(),
    path: window.location.pathname,
    userAgent: navigator.userAgent,
    language: navigator.language || "unknown",
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
  };
}

function upsertCurrentVisit(entries: VisitEntry[]): VisitEntry[] {
  const entry = collectEntry();
  const trimmed = [entry, ...entries].slice(0, MAX_ENTRIES);
  saveEntries(trimmed);
  return trimmed;
}

function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function render(entries: VisitEntry[]): void {
  const summary = getRequiredElement<HTMLElement>("summary");
  const tableBody = getRequiredElement<HTMLTableSectionElement>("visit-log");
  tableBody.innerHTML = "";

  summary.textContent = `saved ${entries.length} recent visit${entries.length === 1 ? "" : "s"} in this browser`;

  if (entries.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "nothing saved yet.";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("tr");

    const timeCell = document.createElement("td");
    timeCell.textContent = formatTime(entry.time);

    const pathCell = document.createElement("td");
    pathCell.textContent = entry.path;

    const detailsCell = document.createElement("td");
    detailsCell.textContent = `${entry.language} | ${entry.timezone} | ${entry.screen}`;

    row.appendChild(timeCell);
    row.appendChild(pathCell);
    row.appendChild(detailsCell);
    tableBody.appendChild(row);
  });
}

const entries = upsertCurrentVisit(loadEntries());
render(entries);

getRequiredElement<HTMLButtonElement>("clear-log").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  render([]);
});
