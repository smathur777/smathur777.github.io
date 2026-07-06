"use strict";
const STORAGE_KEY = "smathur777-visitor-log";
const MAX_ENTRIES = 25;
function isVisitEntry(value) {
    if (!value || typeof value !== "object") {
        return false;
    }
    const entry = value;
    return (typeof entry.time === "string" &&
        typeof entry.path === "string" &&
        typeof entry.userAgent === "string" &&
        typeof entry.language === "string" &&
        typeof entry.screen === "string" &&
        typeof entry.timezone === "string");
}
function getRequiredElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing required element: #${id}`);
    }
    return element;
}
function loadEntries() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const value = JSON.parse(raw);
        return Array.isArray(value) ? value.filter(isVisitEntry) : [];
    }
    catch {
        return [];
    }
}
function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
function collectEntry() {
    return {
        time: new Date().toISOString(),
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        language: navigator.language || "unknown",
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    };
}
function upsertCurrentVisit(entries) {
    const entry = collectEntry();
    const trimmed = [entry, ...entries].slice(0, MAX_ENTRIES);
    saveEntries(trimmed);
    return trimmed;
}
function formatTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
function render(entries) {
    const summary = getRequiredElement("summary");
    const tableBody = getRequiredElement("visit-log");
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
getRequiredElement("clear-log").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    render([]);
});
