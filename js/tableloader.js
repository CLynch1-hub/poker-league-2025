// Simple CSV parser
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  return lines.map(line =>
    line.split(",").map(cell => cell.trim().replace(/^"|"$/g, ""))
  );
}

// Generic table loader
function createTable(containerId, csvPath) {
  fetch(csvPath)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text);
      if (!rows.length) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Header row
      const headerRow = document.createElement("tr");
      rows[0].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);

      // Body rows
      rows.slice(1).forEach(row => {
        if (row.length === 1 && row[0] === "") return;
        const tr = document.createElement("tr");
        row.forEach((cell, i) => {
          const td = document.createElement("td");
          td.textContent = cell;
          // For mobile card layout: label with column header
          td.setAttribute("data-label", rows[0][i] || "");
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.innerHTML = "";
      container.appendChild(table);
    })
    .catch(err => console.error("Error loading CSV:", csvPath, err));
}

// Navigation setup
function setupNav() {
  const buttons = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".content-section");

  buttons.forEach(btn => {
    const target = btn.getAttribute("data-target");
    if (!target) return; // skip dark-mode button etc.

    btn.addEventListener("click", () => {
      // Update active button
      buttons.forEach(b => {
        const t = b.getAttribute("data-target");
        if (t) b.classList.remove("active");
      });
      btn.classList.add("active");

      // Show matching section
      sections.forEach(sec => {
        if (sec.id === target) sec.classList.add("active");
        else sec.classList.remove("active");
      });

      // On mobile, close the menu after selection
      const nav = document.querySelector(".sidebar-nav");
      if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
      }
    });
  });
}

// Initialise on load
document.addEventListener("DOMContentLoaded", () => {
  setupNav();

  // Load all CSV-driven tables
  createTable("structure-table", "data/Game Structure.csv");
  createTable("hosts-table", "data/Hosts.csv");
  createTable("results-table", "data/Player Game Results.csv");
  createTable("players-table", "data/Poker Players.csv");
  createTable("leaderboard-table", "data/Leaderboard.csv");
});
