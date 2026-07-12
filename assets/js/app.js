const currentUser = {
  name: "Super Admin",
  role: "superadmin"
};

const seedStores = [
  { id: "toko-g", name: "TOKO G" },
  { id: "toko-s", name: "TOKO S" },
  { id: "toko-d", name: "TOKO D" },
  { id: "toko-p", name: "TOKO P" },
  { id: "toko-k", name: "TOKO K" }
];

function safeParse(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Data ${key} rusak, memakai data awal.`, error);
    return fallback;
  }
}

let stores = [...seedStores];
let activeStoreId = localStorage.getItem("lpv2_activeStoreId") || "all";

if (
  activeStoreId !== "all" &&
  !stores.some(store => store.id === activeStoreId)
) {
  activeStoreId = "all";
}

const seedWallets = seedStores.flatMap((store, index) => [
  {
    id: `${store.id}-ledger`,
    name: "Ledger",
    type: "Crypto",
    balance: 0,
    color: "blue",
    storeId: store.id
  },
  {
    id: `${store.id}-bca`,
    name: "BCA",
    type: "Bank",
    balance: 0,
    color: "green",
    storeId: store.id
  },
  {
    id: `${store.id}-kas`,
    name: "Kas",
    type: "Kas",
    balance: 0,
    color: "orange",
    storeId: store.id
  }
]);

const seedTransactions = [
  {
    id: 1,
    date: "2024-04-24",
    note: "Saldo awal",
    wallet: "Ledger",
    type: "in",
    amount: 30000,
    rate: 16300,
    reference: "",
    storeId: "toko-g"
  },
  {
    id: 2,
    date: "2024-04-24",
    note: "Transfer masuk",
    wallet: "Ledger",
    type: "in",
    amount: 31336.39,
    rate: 16300,
    reference: "",
    storeId: "toko-g"
  },
  {
    id: 3,
    date: "2024-04-24",
    note: "Transfer masuk",
    wallet: "BCA",
    type: "in",
    amount: 7001,
    rate: 16300,
    reference: "",
    storeId: "toko-g"
  },
  {
    id: 4,
    date: "2024-04-25",
    note: "Transfer masuk",
    wallet: "Ledger",
    type: "in",
    amount: 9231.47,
    rate: 16300,
    reference: "",
    storeId: "toko-g"
  },
  {
    id: 5,
    date: "2024-04-27",
    note: "Pengeluaran operasional",
    wallet: "Kas",
    type: "out",
    amount: 30000,
    rate: 16300,
    reference: "",
    storeId: "toko-g"
  },
  {
    id: 6,
    date: "2024-04-27",
    note: "Pengeluaran",
    wallet: "Kas",
    type: "out",
    amount: 2000,
    rate: 16300,
    reference: "",
    storeId: "toko-g"
  },
  {
    id: 7,
    date: "2024-05-01",
    note: "Transfer masuk",
    wallet: "BCA",
    type: "in",
    amount: 2000,
    rate: 16333,
    reference: "",
    storeId: "toko-g"
  },
  {
    id: 8,
    date: "2024-05-02",
    note: "Pengeluaran",
    wallet: "Kas",
    type: "out",
    amount: 5000,
    rate: 16333,
    reference: "",
    storeId: "toko-g"
  }
];

const defaultSettings = {
  appName: "Ledger Pro",
  defaultRate: 16300,
  dateFormat: "id-ID",
  currency: "USD",
  theme: "light"
};

let wallets = safeParse("lpv2_wallets", structuredClone(seedWallets));
let transactions = safeParse(
  "lpv2_transactions",
  structuredClone(seedTransactions)
);
let settings = safeParse(
  "lpv2_settings",
  structuredClone(defaultSettings)
);
let editingId = null;

wallets = wallets.map(wallet => ({
  ...wallet,
  storeId:
    !wallet.storeId || wallet.storeId === "toko-utama"
      ? "toko-g"
      : wallet.storeId
}));

transactions = transactions.map(transaction => ({
  ...transaction,
  storeId:
    !transaction.storeId || transaction.storeId === "toko-utama"
      ? "toko-g"
      : transaction.storeId
}));

seedStores.forEach(store => {
  [
    { name: "Ledger", type: "Crypto", color: "blue" },
    { name: "BCA", type: "Bank", color: "green" },
    { name: "Kas", type: "Kas", color: "orange" }
  ].forEach(defaultWallet => {
    const exists = wallets.some(
      wallet =>
        wallet.storeId === store.id &&
        wallet.name.toLowerCase() === defaultWallet.name.toLowerCase()
    );

    if (!exists) {
      wallets.push({
        id: `${store.id}-${defaultWallet.name.toLowerCase()}-${Date.now()}`,
        name: defaultWallet.name,
        type: defaultWallet.type,
        balance: 0,
        color: defaultWallet.color,
        storeId: store.id
      });
    }
  });
});

const meta = {
  dashboard: ["Dashboard", "Ringkasan kondisi keuangan."],
  ledger: ["Ledger", "Kelola seluruh transaksi."],
  cashin: ["Cash In", "Tambah dan pantau uang masuk."],
  cashout: ["Cash Out", "Tambah dan pantau uang keluar."],
  wallets: ["Wallet", "Kelola bank, crypto wallet, dan kas."],
  reports: ["Laporan", "Rekap keuangan bulanan."],
  settings: ["Pengaturan", "Atur preferensi aplikasi."]
};

function save() {
  localStorage.setItem("lpv2_wallets", JSON.stringify(wallets));
  localStorage.setItem("lpv2_transactions", JSON.stringify(transactions));
  localStorage.setItem("lpv2_settings", JSON.stringify(settings));
  localStorage.setItem("lpv2_stores", JSON.stringify(stores));
  localStorage.setItem("lpv2_activeStoreId", activeStoreId);
}

save();

function usd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(value || 0));
}

function idr(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function dateLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    settings.dateFormat || "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message) {
  const element = document.getElementById("toast");
  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 2200);
}

function getStoreName(storeId) {
  return stores.find(store => store.id === storeId)?.name || "TOKO G";
}

function getFilteredTransactions() {
  if (activeStoreId === "all") return transactions;

  return transactions.filter(
    transaction => transaction.storeId === activeStoreId
  );
}

function getFilteredWallets() {
  if (activeStoreId === "all") return wallets;

  return wallets.filter(wallet => wallet.storeId === activeStoreId);
}

function rows() {
  let balance = 0;

  return [...getFilteredTransactions()]
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date) ||
        Number(a.id) - Number(b.id)
    )
    .map(transaction => {
      balance +=
        transaction.type === "in"
          ? Number(transaction.amount)
          : -Number(transaction.amount);

      return {
        ...transaction,
        balance,
        idrBalance: balance * Number(transaction.rate || 0)
      };
    });
}

function walletBalance(wallet) {
  const transactionBalance = transactions
    .filter(
      transaction =>
        transaction.storeId === wallet.storeId &&
        transaction.wallet === wallet.name
    )
    .reduce(
      (total, transaction) =>
        total +
        (transaction.type === "in"
          ? Number(transaction.amount)
          : -Number(transaction.amount)),
      0
    );

  return transactionBalance + Number(wallet.balance || 0);
}

function monthly() {
  const result = {};

  getFilteredTransactions().forEach(transaction => {
    const monthKey = transaction.date.slice(0, 7);

    if (!result[monthKey]) {
      result[monthKey] = {
        month: monthKey,
        in: 0,
        out: 0,
        count: 0
      };
    }

    result[monthKey].count += 1;
    result[monthKey][transaction.type] += Number(transaction.amount);
  });

  return Object.values(result).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}

function injectStoreStyles() {
  if (document.getElementById("multiStoreStyles")) return;

  const style = document.createElement("style");
  style.id = "multiStoreStyles";
  style.textContent = `
    .store-selector {
      min-width: 155px;
      height: 42px;
      padding: 0 36px 0 12px;
      border: 1px solid var(--border, #d9dee7);
      border-radius: 9px;
      background: var(--card, #fff);
      color: var(--text, #172033);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    .store-name-small {
      display: block;
      margin-top: 3px;
      color: var(--muted, #6b778c);
      font-size: 11px;
      font-weight: 600;
    }

    @media (max-width: 760px) {
      .store-selector {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
}

function ensureStoreSelector() {
  let selector = document.getElementById("storeSelector");

  if (!selector) {
    const exportButton = document.getElementById("exportAll");
    const actions = exportButton?.parentElement;

    if (!actions) return null;

    selector = document.createElement("select");
    selector.id = "storeSelector";
    selector.className = "store-selector";
    selector.setAttribute("aria-label", "Pilih toko");
    actions.insertBefore(selector, exportButton);
  }

  return selector;
}

function populateStores() {
  const selector = ensureStoreSelector();
  if (!selector) return;

  selector.innerHTML = "";

  if (currentUser.role === "superadmin") {
    selector.add(new Option("Semua Toko", "all"));
  }

  stores.forEach(store => {
    selector.add(new Option(store.name, store.id));
  });

  selector.value = activeStoreId;

  selector.onchange = event => {
    activeStoreId = event.target.value;
    save();
    render();

    toast(
      activeStoreId === "all"
        ? "Menampilkan semua toko."
        : `Dashboard ${getStoreName(activeStoreId)}`
    );
  };
}

function showPage(page) {
  document
    .querySelectorAll(".page")
    .forEach(element => element.classList.remove("active"));

  document
    .querySelectorAll(".nav-item")
    .forEach(element => element.classList.remove("active"));

  document.getElementById(`${page}Page`)?.classList.add("active");
  document
    .querySelector(`[data-page="${page}"]`)
    ?.classList.add("active");

  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");

  if (pageTitle && meta[page]) pageTitle.textContent = meta[page][0];
  if (pageSubtitle && meta[page]) {
    pageSubtitle.textContent = meta[page][1];
  }

  const hideTransactionButton =
    page === "settings" || page === "wallets";

  const openButton = document.getElementById("openTransactionModal");
  const exportButton = document.getElementById("exportAll");

  if (openButton) {
    openButton.style.display = hideTransactionButton ? "none" : "";
  }

  if (exportButton) {
    exportButton.style.display = page === "settings" ? "none" : "";
  }

  if (page === "dashboard") drawChart();
}

function render() {
  const filteredTransactions = getFilteredTransactions();
  const filteredWallets = getFilteredWallets();
  const calculatedRows = rows();

  const last = calculatedRows.at(-1) || {
    balance: 0,
    idrBalance: 0,
    rate: settings.defaultRate
  };

  const totalIn = filteredTransactions
    .filter(transaction => transaction.type === "in")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    );

  const totalOut = filteredTransactions
    .filter(transaction => transaction.type === "out")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    );

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  setText("dashUsd", usd(last.balance));
  setText("dashIdr", idr(last.idrBalance));
  setText("dashIn", usd(totalIn));
  setText("dashOut", usd(totalOut));
  setText("summaryCount", filteredTransactions.length);
  setText(
    "summaryLargest",
    usd(
      Math.max(
        0,
        ...filteredTransactions.map(transaction =>
          Number(transaction.amount)
        )
      )
    )
  );
  setText("summaryRate", idr(last.rate));
  setText("summaryWallets", filteredWallets.length);

  renderRecent(calculatedRows);
  renderLedger(calculatedRows);
  renderWallets();
  renderQuickLists();
  renderReports();
  populateWallets();
  drawChart();
}

function storeLabel(transaction) {
  if (activeStoreId !== "all") return "";

  return `<span class="store-name-small">${esc(
    getStoreName(transaction.storeId)
  )}</span>`;
}

function renderRecent(calculatedRows) {
  const body = document.getElementById("recentBody");
  if (!body) return;

  body.innerHTML = "";

  [...calculatedRows]
    .reverse()
    .slice(0, 5)
    .forEach(transaction => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${dateLabel(transaction.date)}</td>
        <td>
          ${esc(transaction.note)}
          ${storeLabel(transaction)}
        </td>
        <td>${esc(transaction.wallet)}</td>
        <td>
          <span class="badge ${transaction.type}">
            ${transaction.type === "in" ? "MASUK" : "KELUAR"}
          </span>
        </td>
        <td class="${transaction.type === "in" ? "green" : "red"}">
          ${usd(transaction.amount)}
        </td>
        <td><strong>${usd(transaction.balance)}</strong></td>
      `;

      body.appendChild(row);
    });
}

function renderLedger(calculatedRows = rows()) {
  const search =
    document.getElementById("searchLedger")?.value.toLowerCase() || "";
  const walletFilter =
    document.getElementById("filterWallet")?.value || "";
  const typeFilter =
    document.getElementById("filterType")?.value || "";
  const dateFilter =
    document.getElementById("filterDate")?.value || "";

  const body = document.getElementById("ledgerBody");
  if (!body) return;

  body.innerHTML = "";

  calculatedRows
    .filter(
      transaction =>
        (!search ||
          transaction.note.toLowerCase().includes(search) ||
          getStoreName(transaction.storeId)
            .toLowerCase()
            .includes(search)) &&
        (!walletFilter || transaction.wallet === walletFilter) &&
        (!typeFilter || transaction.type === typeFilter) &&
        (!dateFilter || transaction.date === dateFilter)
    )
    .forEach(transaction => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${dateLabel(transaction.date)}</td>
        <td>
          ${esc(transaction.note)}
          ${storeLabel(transaction)}
        </td>
        <td>${esc(transaction.wallet)}</td>
        <td>${idr(transaction.rate)}</td>
        <td class="green">
          ${transaction.type === "in" ? usd(transaction.amount) : "-"}
        </td>
        <td class="red">
          ${transaction.type === "out" ? usd(transaction.amount) : "-"}
        </td>
        <td><strong>${usd(transaction.balance)}</strong></td>
        <td>${idr(transaction.idrBalance)}</td>
        <td>
          <div class="action-group">
            <button class="icon-action" onclick="editTx(${transaction.id})">
              Edit
            </button>
            <button class="icon-action delete" onclick="deleteTx(${transaction.id})">
              Hapus
            </button>
          </div>
        </td>
      `;

      body.appendChild(row);
    });
}

function renderWallets() {
  const container = document.getElementById("walletCards");
  if (!container) return;

  container.innerHTML = "";

  getFilteredWallets().forEach(wallet => {
    const card = document.createElement("article");
    card.className = "metric wallet-card";

    card.innerHTML = `
      <div class="wallet-top">
        <div>
          <span>
            ${esc(wallet.type)}
            ${
              activeStoreId === "all"
                ? ` • ${esc(getStoreName(wallet.storeId))}`
                : ""
            }
          </span>
          <h3>${esc(wallet.name)}</h3>
        </div>
        <span class="wallet-dot ${wallet.color}"></span>
      </div>
      <strong>${usd(walletBalance(wallet))}</strong>
      <small>Saldo wallet</small>
    `;

    container.appendChild(card);
  });
}

function renderQuickLists() {
  const filteredTransactions = getFilteredTransactions();
  const cashInList = document.getElementById("cashInList");
  const cashOutList = document.getElementById("cashOutList");

  if (!cashInList || !cashOutList) return;

  cashInList.innerHTML = "";
  cashOutList.innerHTML = "";

  filteredTransactions
    .filter(transaction => transaction.type === "in")
    .slice(-6)
    .reverse()
    .forEach(transaction => {
      cashInList.innerHTML += `
        <div class="transaction-item">
          <div>
            <strong>${esc(transaction.note)}</strong>
            <small>
              ${dateLabel(transaction.date)} • ${esc(transaction.wallet)}
              ${
                activeStoreId === "all"
                  ? ` • ${esc(getStoreName(transaction.storeId))}`
                  : ""
              }
            </small>
          </div>
          <strong class="green">${usd(transaction.amount)}</strong>
        </div>
      `;
    });

  filteredTransactions
    .filter(transaction => transaction.type === "out")
    .slice(-6)
    .reverse()
    .forEach(transaction => {
      cashOutList.innerHTML += `
        <div class="transaction-item">
          <div>
            <strong>${esc(transaction.note)}</strong>
            <small>
              ${dateLabel(transaction.date)} • ${esc(transaction.wallet)}
              ${
                activeStoreId === "all"
                  ? ` • ${esc(getStoreName(transaction.storeId))}`
                  : ""
              }
            </small>
          </div>
          <strong class="red">${usd(transaction.amount)}</strong>
        </div>
      `;
    });
}

function renderReports() {
  const summary = monthly();
  const body = document.getElementById("reportBody");

  if (body) {
    body.innerHTML = "";

    summary.forEach(item => {
      const net = item.in - item.out;
      const label = new Date(
        `${item.month}-01T00:00:00`
      ).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric"
      });

      body.innerHTML += `
        <tr>
          <td>${label}</td>
          <td class="green">${usd(item.in)}</td>
          <td class="red">${usd(item.out)}</td>
          <td class="${net >= 0 ? "green" : "red"}">${usd(net)}</td>
          <td>${item.count}</td>
        </tr>
      `;
    });
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const current = summary.find(item => item.month === currentMonth) || {
    in: 0,
    out: 0
  };

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  setText("reportIn", usd(current.in));
  setText("reportOut", usd(current.out));
  setText("reportNet", usd(current.in - current.out));
}

function populateWallets() {
  const walletOptions = getFilteredWallets()
    .map(
      wallet =>
        `<option value="${esc(wallet.name)}">${esc(wallet.name)}${
          activeStoreId === "all"
            ? ` — ${esc(getStoreName(wallet.storeId))}`
            : ""
        }</option>`
    )
    .join("");

  document.querySelectorAll('select[name="wallet"]').forEach(select => {
    const oldValue = select.value;
    select.innerHTML = walletOptions;

    if (
      oldValue &&
      [...select.options].some(option => option.value === oldValue)
    ) {
      select.value = oldValue;
    }
  });

  const filter = document.getElementById("filterWallet");

  if (filter) {
    const oldValue = filter.value;
    filter.innerHTML =
      '<option value="">Semua wallet</option>' + walletOptions;

    if (
      oldValue &&
      [...filter.options].some(option => option.value === oldValue)
    ) {
      filter.value = oldValue;
    }
  }
}

function drawChart() {
  const canvas = document.getElementById("cashflowChart");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 700;
  const height = 240;

  canvas.width = width * ratio;
  canvas.height = height * ratio;

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const summary = monthly().slice(-8);
  const maximum = Math.max(
    1,
    ...summary.flatMap(item => [item.in, item.out])
  );

  const padding = 34;
  const chartHeight = height - 60;
  const chartWidth = width - padding * 2;
  const styles = getComputedStyle(document.body);

  context.strokeStyle = styles.getPropertyValue("--border").trim() || "#ddd";
  context.fillStyle = styles.getPropertyValue("--muted").trim() || "#777";
  context.font = "12px Arial";

  for (let index = 0; index <= 4; index += 1) {
    const y = 18 + (chartHeight / 4) * index;
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding, y);
    context.stroke();
  }

  if (!summary.length) {
    context.fillText("Belum ada data", padding, 100);
    return;
  }

  const groupWidth = chartWidth / summary.length;

  summary.forEach((item, index) => {
    const barX = padding + index * groupWidth + groupWidth * 0.18;
    const barWidth = groupWidth * 0.24;
    const inHeight = (item.in / maximum) * chartHeight;
    const outHeight = (item.out / maximum) * chartHeight;

    context.fillStyle = "#16803d";
    context.fillRect(
      barX,
      18 + chartHeight - inHeight,
      barWidth,
      inHeight
    );

    context.fillStyle = "#c62828";
    context.fillRect(
      barX + barWidth + 5,
      18 + chartHeight - outHeight,
      barWidth,
      outHeight
    );

    context.fillStyle =
      styles.getPropertyValue("--muted").trim() || "#777";

    context.fillText(
      new Date(`${item.month}-01`).toLocaleDateString("id-ID", {
        month: "short"
      }),
      barX,
      height - 16
    );
  });
}

function requireSelectedStore() {
  if (activeStoreId !== "all") return true;

  alert("Pilih salah satu toko dulu sebelum menambah data.");
  return false;
}

function openModal(item = null) {
  if (!item && !requireSelectedStore()) return;

  editingId = item?.id || null;

  const form = document.getElementById("transactionForm");
  if (!form) return;

  const title = document.getElementById("transactionModalTitle");
  if (title) {
    title.textContent = item ? "Edit Transaksi" : "Tambah Transaksi";
  }

  form.date.value =
    item?.date || new Date().toISOString().slice(0, 10);
  form.wallet.value =
    item?.wallet || getFilteredWallets()[0]?.name || "";
  form.type.value = item?.type || "in";
  form.rate.value = item?.rate || settings.defaultRate;
  form.note.value = item?.note || "";
  form.amount.value = item?.amount || "";
  form.reference.value = item?.reference || "";

  document.getElementById("transactionModal")?.classList.add("show");
}

function closeModal() {
  document.getElementById("transactionModal")?.classList.remove("show");
  editingId = null;
}

function saveTx(data, typeOverride = null) {
  const currentItem = editingId
    ? transactions.find(transaction => transaction.id === editingId)
    : null;

  const storeId = currentItem?.storeId || activeStoreId;

  if (storeId === "all") {
    alert("Pilih salah satu toko dulu.");
    return false;
  }

  const transaction = {
    date: data.get("date"),
    wallet: data.get("wallet"),
    type: typeOverride || data.get("type"),
    rate: Number(data.get("rate")),
    note: String(data.get("note") || "").trim(),
    amount: Number(data.get("amount")),
    reference: String(data.get("reference") || "").trim(),
    storeId
  };

  if (
    !transaction.date ||
    !transaction.wallet ||
    !transaction.note ||
    !transaction.rate ||
    !transaction.amount
  ) {
    alert("Lengkapi semua data wajib.");
    return false;
  }

  if (editingId) {
    transactions = transactions.map(item =>
      item.id === editingId
        ? { ...item, ...transaction }
        : item
    );
  } else {
    transaction.id = transactions.length
      ? Math.max(...transactions.map(item => Number(item.id) || 0)) + 1
      : 1;

    transactions.push(transaction);
  }

  const wasEditing = Boolean(editingId);

  save();
  render();
  toast(
    wasEditing
      ? "Transaksi diperbarui."
      : `Transaksi ditambahkan ke ${getStoreName(storeId)}.`
  );

  return true;
}

window.editTx = id => {
  const transaction = transactions.find(item => item.id === id);
  if (transaction) openModal(transaction);
};

window.deleteTx = id => {
  const transaction = transactions.find(item => item.id === id);

  if (
    transaction &&
    confirm(`Hapus transaksi "${transaction.note}"?`)
  ) {
    transactions = transactions.filter(item => item.id !== id);
    save();
    render();
    toast("Transaksi dihapus.");
  }
};

function exportCsv(name, dataRows) {
  const csv = dataRows
    .map(row =>
      row
        .map(value => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = name;
  anchor.click();

  URL.revokeObjectURL(url);
}

function exportAll() {
  const filteredTransactions = getFilteredTransactions();

  exportCsv(
    activeStoreId === "all"
      ? "ledger-pro-semua-toko.csv"
      : `ledger-pro-${activeStoreId}.csv`,
    [
      [
        "Toko",
        "Tanggal",
        "Keterangan",
        "Wallet",
        "Tipe",
        "Rate",
        "Nominal"
      ],
      ...filteredTransactions.map(transaction => [
        getStoreName(transaction.storeId),
        transaction.date,
        transaction.note,
        transaction.wallet,
        transaction.type,
        transaction.rate,
        transaction.amount
      ])
    ]
  );
}

function exportReport() {
  exportCsv("ledger-pro-report.csv", [
    ["Bulan", "Masuk", "Keluar", "Net", "Jumlah"],
    ...monthly().map(item => [
      item.month,
      item.in,
      item.out,
      item.in - item.out,
      item.count
    ])
  ]);
}

function applyTheme() {
  document.body.classList.toggle(
    "dark",
    settings.theme === "dark"
  );

  const toggle = document.getElementById("themeToggle");

  if (toggle) {
    toggle.textContent =
      settings.theme === "dark"
        ? "☀️ Light mode"
        : "🌙 Dark mode";
  }

  setTimeout(drawChart, 20);
}

function bindEvents() {
  document.getElementById("loginButton")?.addEventListener("click", () => {
    document.getElementById("loginScreen")?.classList.add("hidden");
    document.getElementById("app")?.classList.remove("hidden");
    render();
  });

  document.getElementById("logoutButton")?.addEventListener("click", () => {
    document.getElementById("app")?.classList.add("hidden");
    document.getElementById("loginScreen")?.classList.remove("hidden");
  });

  document.getElementById("sidebarNav")?.addEventListener("click", event => {
    const button = event.target.closest(".nav-item");
    if (button) showPage(button.dataset.page);
  });

  document.querySelectorAll("[data-jump]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.jump);
    });
  });

  document
    .getElementById("openTransactionModal")
    ?.addEventListener("click", () => openModal());

  document
    .getElementById("closeTransactionModal")
    ?.addEventListener("click", closeModal);

  document
    .getElementById("cancelTransactionModal")
    ?.addEventListener("click", closeModal);

  document
    .getElementById("transactionForm")
    ?.addEventListener("submit", event => {
      event.preventDefault();

      if (saveTx(new FormData(event.target))) {
        closeModal();
      }
    });

  document
    .getElementById("cashInForm")
    ?.addEventListener("submit", event => {
      event.preventDefault();

      if (!requireSelectedStore()) return;

      if (saveTx(new FormData(event.target), "in")) {
        event.target.reset();
        event.target.date.value = new Date()
          .toISOString()
          .slice(0, 10);
        event.target.rate.value = settings.defaultRate;
      }
    });

  document
    .getElementById("cashOutForm")
    ?.addEventListener("submit", event => {
      event.preventDefault();

      if (!requireSelectedStore()) return;

      if (saveTx(new FormData(event.target), "out")) {
        event.target.reset();
        event.target.date.value = new Date()
          .toISOString()
          .slice(0, 10);
        event.target.rate.value = settings.defaultRate;
      }
    });

  document
    .getElementById("walletForm")
    ?.addEventListener("submit", event => {
      event.preventDefault();

      if (!requireSelectedStore()) return;

      const data = new FormData(event.target);
      const name = String(data.get("name") || "").trim();

      if (
        wallets.some(
          wallet =>
            wallet.storeId === activeStoreId &&
            wallet.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        alert("Nama wallet sudah ada di toko ini.");
        return;
      }

      wallets.push({
        id: `${activeStoreId}-${Date.now()}`,
        name,
        type: data.get("type"),
        balance: Number(data.get("balance")) || 0,
        color: data.get("color"),
        storeId: activeStoreId
      });

      save();
      render();
      event.target.reset();
      toast(`Wallet ditambahkan ke ${getStoreName(activeStoreId)}.`);
    });

  [
    "searchLedger",
    "filterWallet",
    "filterType",
    "filterDate"
  ].forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => {
      renderLedger();
    });
  });

  document
    .getElementById("exportAll")
    ?.addEventListener("click", exportAll);

  document
    .getElementById("exportReport")
    ?.addEventListener("click", exportReport);

  document
    .getElementById("themeToggle")
    ?.addEventListener("click", () => {
      settings.theme =
        settings.theme === "dark" ? "light" : "dark";
      save();
      applyTheme();
    });

  document
    .getElementById("settingsForm")
    ?.addEventListener("submit", event => {
      event.preventDefault();

      const data = new FormData(event.target);

      settings.appName =
        data.get("appName") || "Ledger Pro";
      settings.defaultRate =
        Number(data.get("defaultRate")) || 16300;
      settings.dateFormat = data.get("dateFormat");
      settings.currency = data.get("currency");

      const brand = document.querySelector(".brand strong");
      if (brand) brand.textContent = settings.appName;

      save();
      render();
      toast("Pengaturan disimpan.");
    });

  document
    .getElementById("resetDemo")
    ?.addEventListener("click", () => {
      if (!confirm("Reset semua data demo?")) return;

      wallets = structuredClone(seedWallets);
      transactions = structuredClone(seedTransactions);
      settings = structuredClone(defaultSettings);
      activeStoreId = "all";

      save();
      location.reload();
    });

  window.addEventListener("resize", drawChart);
}

function initialize() {
  injectStoreStyles();
  ensureStoreSelector();
  populateStores();
  bindEvents();

  document
    .querySelectorAll('input[type="date"]')
    .forEach(input => {
      if (!input.value) {
        input.value = new Date().toISOString().slice(0, 10);
      }
    });

  const brand = document.querySelector(".brand strong");
  if (brand) brand.textContent = settings.appName;

  const settingsForm = document.getElementById("settingsForm");

  if (settingsForm) {
    if (settingsForm.elements.appName) {
      settingsForm.elements.appName.value = settings.appName;
    }
    if (settingsForm.elements.defaultRate) {
      settingsForm.elements.defaultRate.value = settings.defaultRate;
    }
    if (settingsForm.elements.dateFormat) {
      settingsForm.elements.dateFormat.value = settings.dateFormat;
    }
    if (settingsForm.elements.currency) {
      settingsForm.elements.currency.value = settings.currency;
    }
  }

  applyTheme();
  populateWallets();
  render();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
