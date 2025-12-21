// Simple CSV parser (no quotes/commas inside cells handling – fine for your data)
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  return lines.map(line =>
    line.split(",").map(cell => cell.trim().replace(/^"|"$/g, ""))
  );
}

function createTable(containerId, csvPath, options = {}) {
  fetch(csvPath)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text);
      if (!rows.length) return;

      const container = document.getElementById(containerId);
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Header
      const headerRow = document.createElement("tr");
      rows[0].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);

      // Body
      rows.slice(1).forEach(row => {
        if (row.length === 1 && row[0] === "") return; // skip blank lines
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

      if (options.onData) {
        options.onData(rows);
      }
    })
    .catch(err => {
      console.error("Error loading CSV", csvPath, err);
    });
}

// Build leaderboard from Player Game Results.csv
function buildLeaderboard(csvPath, containerId) {
  fetch(csvPath)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text);
      if (rows.length < 2) return;

      const header = rows[0];
      const idxPlayerName = header.indexOf("PlayerName");
      const idxBuyIn = header.indexOf("BuyIn");
      const idxRebuy = header.indexOf("Rebuy");
      const idxCashOut = header.indexOf("CashOut");

      const stats = {}; // { playerName: { buyIn, rebuy, cashOut } }

      rows.slice(1).forEach(row => {
        if (!row[idxPlayerName]) return;

        const name = row[idxPlayerName];
        const buyIn = parseEuro(row[idxBuyIn]);
        const rebuy = parseEuro(row[idxRebuy]);
        const cashOut = parseEuro(row[idxCashOut]);

        if (!stats[name]) {
          stats[name] = { buyIn: 0, rebuy: 0, cashOut: 0 };
        }
        stats[name].buyIn += buyIn;
        stats[name].rebuy += rebuy;
        stats[name].cashOut += cashOut;
      });

      const data = Object.entries(stats).map(([name, s]) => {
        const totalSpend = s.buyIn + s.rebuy;
        const profit = s.cashOut - totalSpend;
        return {
          name,
          buyIn: s.buyIn,
          rebuy: s.rebuy,
          cashOut: s.cashOut,
          totalSpend,
          profit
        };
      });

      // Sort by profit descending
      data.sort((a, b) => b.profit - a.profit);

      // Build table
      const container = document.getElementById(containerId);
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      const headerRow = document.createElement("tr");
      ["Player", "Total Buy-in", "Total Rebuy", "Total Cash Out", "Total Spend", "Profit"]
        .forEach(label => {
          const th = document.createElement("th");
          th.textContent = label;
          headerRow.appendChild(th);
        });
      thead.appendChild(headerRow);

      data.forEach(row => {
        const tr = document.createElement("tr");
        const cells = [
          row.name,
          formatEuro(row.buyIn),
          formatEuro(row.rebuy),
          formatEuro(row.cashOut),
          formatEuro(row.totalSpend),
          formatEuro(row.profit)
        ];
        cells.forEach(text => {
          const td = document.createElement("td");
          td.textContent = text;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.innerHTML = "";
      container.appendChild(table);
    });
}

function parseEuro(value) {
  if (!value) return 0;
  // Remove € and commas
  const num = value.replace(/[€£]/g, "").replace(/,/g, "");
  const parsed = parseFloat(num);
  return isNaN(parsed) ? 0 : parsed;
}

function formatEuro(amount) {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount).toFixed(2);
  return sign + "€" + abs;
}

// Section switching
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

  createTable("structure-table", "data/Game Structure.csv");
  createTable("hosts-table", "data/Hosts.csv");
  createTable("results-table", "data/Player Game Results.csv");
  createTable("players-table", "data/Poker Players.csv");
  buildLeaderboard("data/Player Game Results.csv", "leaderboard-table");
});
