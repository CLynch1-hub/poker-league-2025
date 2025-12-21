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
        row.forEach(cell => {
          const td = document.createElement("td");
          td.textContent = cell;
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
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      sections.forEach(sec => {
        if (sec.id === target) sec.classList.add("active");
        else sec.classList.remove("active");
      });
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

  // NEW: Load leaderboard from Leaderboard.csv
  createTable("leaderboard-table", "data/Leaderboard.csv");
});
