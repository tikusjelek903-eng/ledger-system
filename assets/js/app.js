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

const seedWallets = seedStores.flatMap(store => [
  {
    id: `${store.id}-utama-ledger-usd`,
    ownerName: "Rekening Utama",
    institution: "Ledger",
    accountNumber: "",
    currency: "USD",
    name: "Rekening Utama — Ledger",
    type: "Crypto",
    balance: 0,
    color: "blue",
    storeId: store.id
  },
  {
    id: `${store.id}-utama-binance-usdt`,
    ownerName: "Rekening Utama",
    institution: "Binance",
    accountNumber: "",
    currency: "USDT",
    name: "Rekening Utama — Binance",
    type: "Crypto",
    balance: 0,
    color: "blue",
    storeId: store.id
  },
  {
    id: `${store.id}-utama-bca-idr`,
    ownerName: "Rekening Utama",
    institution: "BCA",
    accountNumber: "",
    currency: "IDR",
    name: "Rekening Utama — BCA",
    type: "Bank",
    balance: 0,
    color: "green",
    storeId: store.id
  },
  {
    id: `${store.id}-kas-idr`,
    ownerName: "Kas",
    institution: "Kas",
    accountNumber: "",
    currency: "IDR",
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
    currency: "USD",
    paymentAmount: 30000,
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
    currency: "USD",
    paymentAmount: 31336.39,
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
    currency: "USD",
    paymentAmount: 7001,
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
    currency: "USD",
    paymentAmount: 9231.47,
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
    currency: "USD",
    paymentAmount: 30000,
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
    currency: "USD",
    paymentAmount: 2000,
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
    currency: "USD",
    paymentAmount: 2000,
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
    currency: "USD",
    paymentAmount: 5000,
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

transactions = transactions.map(transaction => {
  const rate = Number(transaction.rate || settings.defaultRate || 0);
  const storedUsd = Number(transaction.amount || 0);
  const storedIdr = Number(transaction.amountIdr);
  const rawCurrency = String(
    transaction.currency || transaction.paymentCurrency || "USD"
  ).toUpperCase();

  const currency = ["USD", "USDT", "IDR"].includes(rawCurrency)
    ? rawCurrency
    : "USD";

  const amountUsd = Number.isFinite(storedUsd) ? storedUsd : 0;
  const amountIdr =
    Number.isFinite(storedIdr) && storedIdr >= 0
      ? storedIdr
      : Math.round(amountUsd * rate);

  const savedPaymentAmount = Number(transaction.paymentAmount);
  const paymentAmount =
    Number.isFinite(savedPaymentAmount) && savedPaymentAmount >= 0
      ? savedPaymentAmount
      : currency === "IDR"
        ? amountIdr
        : amountUsd;

  return {
    ...transaction,
    currency,
    paymentAmount,
    rate,
    amount: amountUsd,
    amountIdr,
    storeId:
      !transaction.storeId || transaction.storeId === "toko-utama"
        ? "toko-g"
        : transaction.storeId
  };
});

function inferredAccountCurrency(wallet, relatedCurrencies = []) {
  const explicit = String(wallet.currency || "").toUpperCase();
  if (["USD", "USDT", "IDR"].includes(explicit)) return explicit;

  if (relatedCurrencies.length === 1) return relatedCurrencies[0];

  const source = `${wallet.name || ""} ${wallet.type || ""}`.toLowerCase();
  if (source.includes("usdt") || source.includes("binance")) return "USDT";
  if (source.includes("bca") || source.includes("bank") || source.includes("kas")) {
    return "IDR";
  }

  return "USD";
}

const migratedWallets = [];

wallets.forEach((wallet, walletIndex) => {
  const storeId =
    !wallet.storeId || wallet.storeId === "toko-utama"
      ? "toko-g"
      : wallet.storeId;

  const legacyName = String(
    wallet.legacyName || wallet.name || wallet.institution || "Rekening"
  ).trim();

  const relatedCurrencies = [
    ...new Set(
      transactions
        .filter(transaction =>
          transaction.storeId === storeId &&
          (
            transaction.walletId === wallet.id ||
            transaction.wallet === legacyName ||
            transaction.wallet === wallet.name
          )
        )
        .map(transaction => transaction.currency)
        .filter(currency => ["USD", "USDT", "IDR"].includes(currency))
    )
  ];

  const explicitCurrency = String(wallet.currency || "").toUpperCase();
  const currencies = ["USD", "USDT", "IDR"].includes(explicitCurrency)
    ? [...new Set([explicitCurrency, ...relatedCurrencies])]
    : relatedCurrencies.length
      ? relatedCurrencies
      : [inferredAccountCurrency(wallet, relatedCurrencies)];

  const institution = String(
    wallet.institution ||
    wallet.bank ||
    wallet.platform ||
    legacyName ||
    "Rekening"
  ).trim();

  const defaultOwner =
    institution.toLowerCase() === "kas"
      ? "Kas"
      : "Rekening Utama";

  const ownerName = String(
    wallet.ownerName ||
    wallet.accountOwner ||
    defaultOwner
  ).trim();

  const accountNumber = String(
    wallet.accountNumber ||
    wallet.accountNo ||
    wallet.number ||
    ""
  ).trim();

  currencies.forEach((currency, currencyIndex) => {
    const displayName =
      ownerName.toLowerCase() === institution.toLowerCase()
        ? ownerName
        : `${ownerName} — ${institution}`;

    migratedWallets.push({
      ...wallet,
      id:
        currencyIndex === 0
          ? String(wallet.id || `${storeId}-rekening-${walletIndex}`)
          : `${wallet.id || `${storeId}-rekening-${walletIndex}`}-${currency.toLowerCase()}`,
      legacyId: wallet.legacyId || wallet.id || null,
      legacyName,
      ownerName,
      institution,
      accountNumber,
      currency,
      name: displayName,
      type: wallet.type || (currency === "USDT" ? "Crypto" : "Bank"),
      balance: currencyIndex === 0 ? Number(wallet.balance || 0) : 0,
      color: wallet.color || (currency === "IDR" ? "green" : "blue"),
      storeId
    });
  });
});

wallets = migratedWallets;

seedWallets.forEach(seedWallet => {
  const exists = wallets.some(wallet =>
    wallet.storeId === seedWallet.storeId &&
    wallet.ownerName.toLowerCase() === seedWallet.ownerName.toLowerCase() &&
    wallet.institution.toLowerCase() === seedWallet.institution.toLowerCase() &&
    wallet.currency === seedWallet.currency
  );

  if (!exists) {
    wallets.push(structuredClone(seedWallet));
  }
});

transactions = transactions.map(transaction => {
  const matchingWallet =
    wallets.find(wallet =>
      wallet.storeId === transaction.storeId &&
      wallet.currency === transaction.currency &&
      (
        wallet.id === transaction.walletId ||
        wallet.legacyId === transaction.walletId ||
        wallet.legacyName === transaction.wallet ||
        wallet.name === transaction.wallet ||
        wallet.institution === transaction.wallet
      )
    ) ||
    wallets.find(wallet =>
      wallet.storeId === transaction.storeId &&
      wallet.currency === transaction.currency
    );

  if (!matchingWallet) return transaction;

  return {
    ...transaction,
    walletId: matchingWallet.id,
    wallet:
      matchingWallet.ownerName.toLowerCase() ===
      matchingWallet.institution.toLowerCase()
        ? matchingWallet.ownerName
        : `${matchingWallet.ownerName} — ${matchingWallet.institution}`
  };
});

const meta = {
  dashboard: ["Dashboard", "Ringkasan kondisi keuangan."],
  ledger: ["Ledger", "Kelola seluruh transaksi."],
  cashin: ["Cash In", "Tambah dan pantau uang masuk."],
  cashout: ["Cash Out", "Tambah dan pantau uang keluar."],
  wallets: ["Rekening", "Kelola rekening berdasarkan pemilik, bank/platform, dan mata uang."],
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

function usdt(value) {
  return `USDT ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(Number(value || 0))}`;
}


function transactionCurrency(transaction) {
  const currency = String(transaction?.currency || "USD").toUpperCase();
  return ["USD", "USDT", "IDR"].includes(currency) ? currency : "USD";
}

function transactionPaymentAmount(transaction) {
  const saved = Number(transaction?.paymentAmount);

  if (Number.isFinite(saved)) return saved;

  return transactionCurrency(transaction) === "IDR"
    ? transactionIdr(transaction)
    : transactionUsd(transaction);
}

function transactionUsd(transaction) {
  const rate = Number(transaction?.rate || settings.defaultRate || 0);
  const currency = transactionCurrency(transaction);
  const paymentAmount = transactionPaymentAmount(transaction);

  if (currency === "USD") return paymentAmount;
  if (currency === "USDT") return paymentAmount;
  return rate > 0 ? paymentAmount / rate : 0;
}

function transactionUsdt(transaction) {
  return transactionCurrency(transaction) === "USDT"
    ? transactionPaymentAmount(transaction)
    : 0;
}


function transactionIdr(transaction) {
  const rate = Number(transaction?.rate || settings.defaultRate || 0);
  const currency = transactionCurrency(transaction);
  const paymentAmount = transactionPaymentAmount(transaction);

  if (currency === "IDR") return paymentAmount;
  return Math.round(paymentAmount * rate);
}

function actualUsdAmount(transaction) {
  return transactionCurrency(transaction) === "USD"
    ? transactionPaymentAmount(transaction)
    : 0;
}

function actualUsdtAmount(transaction) {
  return transactionCurrency(transaction) === "USDT"
    ? transactionPaymentAmount(transaction)
    : 0;
}


function actualIdrAmount(transaction) {
  return transactionCurrency(transaction) === "IDR"
    ? transactionPaymentAmount(transaction)
    : 0;
}

function dualMoneyHtml(usdValue, usdtValue, idrValue) {
  return `
    <span class="money-primary">${usd(usdValue)}</span>
    <span class="money-usdt">${usdt(usdtValue)}</span>
    <span class="money-secondary">${idr(idrValue)}</span>
  `;
}

function paymentMoneyHtml(transaction) {
  const currency = transactionCurrency(transaction);
  const paymentAmount = transactionPaymentAmount(transaction);

  if (currency === "IDR") {
    return `
      <span class="money-primary">${idr(paymentAmount)}</span>
      <span class="money-secondary">Pembayaran IDR</span>
    `;
  }

  if (currency === "USDT") {
    return `
      <span class="money-primary">${usdt(paymentAmount)}</span>
      <span class="money-secondary">Pembayaran USDT</span>
    `;
  }

  return `
    <span class="money-primary">${usd(paymentAmount)}</span>
    <span class="money-secondary">Pembayaran USD</span>
  `;
}

function setDualDashboardValue(id, usdValue, usdtValue, idrValue) {
  const element = document.getElementById(id);
  if (!element) return;

  element.textContent = usd(usdValue);

  const parent = element.parentElement;
  if (!parent) return;

  let usdtLine = parent.querySelector(`[data-usdt-money="${id}"]`);
  if (!usdtLine) {
    usdtLine = document.createElement("small");
    usdtLine.dataset.usdtMoney = id;
    usdtLine.className = "dashboard-usdt-value";
    element.insertAdjacentElement("afterend", usdtLine);
  }
  usdtLine.textContent = usdt(usdtValue);

  let idrLine = parent.querySelector(`[data-secondary-money="${id}"]`);
  if (!idrLine) {
    idrLine = document.createElement("small");
    idrLine.dataset.secondaryMoney = id;
    idrLine.className = "dashboard-idr-value";
    usdtLine.insertAdjacentElement("afterend", idrLine);
  }
  idrLine.textContent = idr(idrValue);
}

function setCombinedIdrDashboardValue(
  id,
  combinedIdr,
  usdAmount,
  usdtAmount,
  nativeIdrAmount,
  rate
) {
  const element = document.getElementById(id);
  if (!element) return;

  element.textContent = idr(combinedIdr);

  const parent = element.parentElement;
  if (!parent) return;

  let secondary = parent.querySelector(
    `[data-secondary-money="${id}"]`
  );

  if (!secondary) {
    secondary = document.createElement("small");
    secondary.dataset.secondaryMoney = id;
    secondary.className = "dashboard-idr-value";
    element.insertAdjacentElement("afterend", secondary);
  }

  secondary.textContent =
    `${usd(usdAmount)} + ${usdt(usdtAmount)} × ${idr(rate)} + ${idr(nativeIdrAmount)}`;
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

function accountDisplayName(wallet, includeCurrency = false) {
  if (!wallet) return "Rekening tidak ditemukan";

  const owner = String(wallet.ownerName || "Rekening").trim();
  const institution = String(wallet.institution || wallet.name || "").trim();
  const base =
    owner.toLowerCase() === institution.toLowerCase() || !institution
      ? owner
      : `${owner} — ${institution}`;

  return includeCurrency
    ? `${base} — ${wallet.currency || "USD"}`
    : base;
}

function maskedAccountNumber(value) {
  const number = String(value || "").replace(/\s+/g, "");
  if (!number) return "";
  if (number.length <= 4) return number;
  return `•••• ${number.slice(-4)}`;
}

function getWalletById(walletId) {
  return wallets.find(wallet => String(wallet.id) === String(walletId)) || null;
}

function getTransactionWallet(transaction) {
  return (
    getWalletById(transaction?.walletId) ||
    wallets.find(wallet =>
      wallet.storeId === transaction?.storeId &&
      wallet.currency === transactionCurrency(transaction) &&
      (
        wallet.name === transaction?.wallet ||
        wallet.legacyName === transaction?.wallet ||
        wallet.institution === transaction?.wallet
      )
    ) ||
    null
  );
}

function transactionAccountLabel(transaction) {
  const wallet = getTransactionWallet(transaction);
  return wallet
    ? accountDisplayName(wallet)
    : String(transaction?.wallet || "Rekening");
}

function transactionBelongsToWallet(transaction, wallet) {
  if (!transaction || !wallet) return false;

  if (transaction.walletId) {
    return String(transaction.walletId) === String(wallet.id);
  }

  return (
    transaction.storeId === wallet.storeId &&
    transactionCurrency(transaction) === wallet.currency &&
    (
      transaction.wallet === wallet.name ||
      transaction.wallet === wallet.legacyName ||
      transaction.wallet === wallet.institution
    )
  );
}

function accountBalance(wallet) {
  const openingBalance = Number(wallet?.balance || 0);

  const movement = transactions
    .filter(transaction =>
      transactionBelongsToWallet(transaction, wallet) &&
      transactionCurrency(transaction) === wallet.currency
    )
    .reduce(
      (total, transaction) =>
        total +
        (transaction.type === "in"
          ? transactionPaymentAmount(transaction)
          : -transactionPaymentAmount(transaction)),
      0
    );

  return openingBalance + movement;
}

function accountBalanceText(wallet) {
  const balance = accountBalance(wallet);

  if (wallet.currency === "IDR") return idr(balance);
  if (wallet.currency === "USDT") return usdt(balance);
  return usd(balance);
}

function totalAccountBalance(currency) {
  return getFilteredWallets()
    .filter(wallet => wallet.currency === currency)
    .reduce((total, wallet) => total + accountBalance(wallet), 0);
}


function rows() {
  let balanceUsd = 0;
  let balanceUsdt = 0;
  let balanceIdr = 0;

  return [...getFilteredTransactions()]
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date) ||
        Number(a.id) - Number(b.id)
    )
    .map(transaction => {
      const direction = transaction.type === "in" ? 1 : -1;

      balanceUsd += direction * actualUsdAmount(transaction);
      balanceUsdt += direction * actualUsdtAmount(transaction);
      balanceIdr += direction * actualIdrAmount(transaction);

      return {
        ...transaction,
        balance: balanceUsd,
        usdtBalance: balanceUsdt,
        idrBalance: balanceIdr
      };
    });
}

function walletBalance(wallet) {
  return wallet?.currency === "USD" ? accountBalance(wallet) : 0;
}

function walletBalanceUsdt(wallet) {
  return wallet?.currency === "USDT" ? accountBalance(wallet) : 0;
}


function walletBalanceIdr(wallet) {
  return wallet?.currency === "IDR" ? accountBalance(wallet) : 0;
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
        inUsdt: 0,
        outUsdt: 0,
        inIdr: 0,
        outIdr: 0,
        count: 0
      };
    }

    result[monthKey].count += 1;
    const currency = transactionCurrency(transaction);
    const amount = transactionPaymentAmount(transaction);

    if (currency === "IDR") {
      result[monthKey][`${transaction.type}Idr`] += amount;
    } else if (currency === "USDT") {
      result[monthKey][`${transaction.type}Usdt`] += amount;
    } else {
      result[monthKey][transaction.type] += amount;
    }
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
    .currency-separation-note {
      display: block;
      margin-top: 4px;
      color: var(--muted, #6b778c);
      font-size: 11px;
      font-weight: 600;
    }

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

    .money-primary {
      display: block;
      font-weight: 700;
      line-height: 1.25;
    }

    .money-usdt,
    .dashboard-usdt-value {
      display: block;
      margin-top: 3px;
      color: #0f766e;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.25;
    }

    .money-secondary,
    .dashboard-idr-value {
      display: block;
      margin-top: 3px;
      color: var(--muted, #6b778c);
      font-size: 11px;
      font-weight: 700;
      line-height: 1.25;
    }

    .green .money-secondary,
    .red .money-secondary {
      color: inherit;
      opacity: 0.78;
    }

    .wallet-money {
      margin-top: 10px;
    }

    .wallet-money .money-primary {
      font-size: 20px;
    }

    .payment-currency-field select,
    .payment-amount-field input {
      width: 100%;
    }

    .payment-currency-field select {
      height: 42px;
      padding: 0 12px;
      border: 1px solid var(--border, #d9dee7);
      border-radius: 8px;
      background: var(--card, #fff);
      color: var(--text, #172033);
      font-weight: 700;
    }

    .currency-helper {
      display: block;
      margin-top: 5px;
      color: var(--muted, #6b778c);
      font-size: 11px;
      line-height: 1.35;
    }


    .account-form-field {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin-bottom: 14px;
    }

    .account-form-field label {
      font-weight: 700;
    }

    .account-form-field input,
    .account-form-field select {
      width: 100%;
      min-height: 42px;
      padding: 0 12px;
      border: 1px solid var(--border, #d9dee7);
      border-radius: 8px;
      background: var(--card, #fff);
      color: var(--text, #172033);
      font-weight: 600;
    }

    .account-card h3 {
      margin-bottom: 5px;
    }

    .account-currency-badge {
      display: inline-flex;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(15, 118, 110, 0.10);
      color: #0f766e;
      font-size: 11px;
      font-weight: 800;
    }

    .account-balance strong {
      font-size: 22px;
    }

    @media (max-width: 760px) {
      .store-selector {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
}


function ensureUsdtDashboardCard() {
  if (document.getElementById("dashUsdt")) return;

  const usdValue = document.getElementById("dashUsd");
  const usdCard = usdValue?.closest(".metric, article, .card");
  if (!usdCard || !usdCard.parentElement) return;

  const card = usdCard.cloneNode(true);
  card.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));

  const label = card.querySelector("span");
  const value = card.querySelector("h2, strong");
  const small = card.querySelector("small");

  if (label) label.textContent = "Saldo USDT";
  if (value) {
    value.id = "dashUsdt";
    value.textContent = usdt(0);
  }
  if (small) small.textContent = "Saldo berjalan";

  usdCard.insertAdjacentElement("afterend", card);
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

function numericValue(value) {
  const normalized = String(value ?? "")
    .replaceAll(".", "")
    .replace(",", ".")
    .trim();

  const direct = Number(value);
  if (Number.isFinite(direct)) return direct;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fieldWrapper(input) {
  return (
    input.closest(
      ".form-field, .field, .form-group, .input-group, .control"
    ) || input.parentElement
  );
}

function updatePaymentField(form) {
  if (!form) return;

  const currencySelect = form.querySelector('[name="currency"]');
  const amountInput = form.querySelector('[name="amount"]');
  const amountWrapper = amountInput ? fieldWrapper(amountInput) : null;
  const amountLabel = amountWrapper?.querySelector("label");
  const helper = form.querySelector(".currency-helper");
  const rawCurrency = String(currencySelect?.value || "USD").toUpperCase();
  const currency = ["USD", "USDT", "IDR"].includes(rawCurrency)
    ? rawCurrency
    : "USD";

  if (!amountInput) return;

  if (amountLabel) amountLabel.textContent = `Nominal Pembayaran ${currency}`;

  amountInput.step = currency === "IDR" ? "1" : "0.01";
  amountInput.inputMode = currency === "IDR" ? "numeric" : "decimal";
  amountInput.placeholder =
    currency === "IDR"
      ? "Contoh: 500000"
      : currency === "USDT"
        ? "Contoh: 1000.00"
        : "Contoh: 50.00";

  if (helper) {
    helper.textContent =
      currency === "IDR"
        ? "Pembayaran dicatat sebagai IDR dan tidak masuk ke saldo USD/USDT."
        : currency === "USDT"
          ? "Pembayaran dicatat sebagai USDT dan dipisahkan dari saldo USD."
          : "Pembayaran dicatat sebagai USD dan dipisahkan dari saldo USDT.";
  }
}


function fieldLabel(input, text) {
  const wrapper = fieldWrapper(input);
  const label = wrapper?.querySelector("label");
  if (label) label.textContent = text;
}

function createAccountField(name, label, controlHtml, className = "") {
  const wrapper = document.createElement("div");
  wrapper.className = `account-form-field ${className}`.trim();
  wrapper.innerHTML = `
    <label>${label}</label>
    ${controlHtml}
  `;
  return wrapper;
}

function injectAccountFields() {
  const form = document.getElementById("walletForm");
  if (!form || form.dataset.accountFieldsReady === "true") return;

  form.dataset.accountFieldsReady = "true";

  const ownerInput = form.querySelector('[name="name"]');
  const typeInput = form.querySelector('[name="type"]');
  const balanceInput = form.querySelector('[name="balance"]');
  const colorInput = form.querySelector('[name="color"]');

  if (!ownerInput || !balanceInput) return;

  fieldLabel(ownerInput, "Nama Pemilik Rekening");
  ownerInput.placeholder = "Contoh: Andi / Budi / PT ABC";
  ownerInput.required = true;

  if (typeInput) {
    fieldLabel(typeInput, "Jenis Rekening");
  }

  fieldLabel(balanceInput, "Saldo Awal");
  balanceInput.placeholder = "0";

  if (colorInput) {
    fieldLabel(colorInput, "Warna Penanda");
  }

  const balanceWrapper = fieldWrapper(balanceInput);

  const institutionField = createAccountField(
    "institution",
    "Bank / Platform",
    `
      <input
        type="text"
        name="institution"
        placeholder="Contoh: BCA, Mandiri, Binance"
        required
      >
    `
  );

  const accountNumberField = createAccountField(
    "accountNumber",
    "Nomor Rekening / Akun",
    `
      <input
        type="text"
        name="accountNumber"
        placeholder="Opsional"
        autocomplete="off"
      >
    `
  );

  const currencyField = createAccountField(
    "accountCurrency",
    "Mata Uang Rekening",
    `
      <select name="accountCurrency" required>
        <option value="IDR">IDR — Rupiah Indonesia</option>
        <option value="USD">USD — Dolar Amerika</option>
        <option value="USDT">USDT — Tether</option>
      </select>
      <small class="currency-helper">
        Transaksi pada rekening ini otomatis memakai mata uang tersebut.
      </small>
    `
  );

  balanceWrapper?.insertAdjacentElement("beforebegin", institutionField);
  institutionField.insertAdjacentElement("afterend", accountNumberField);
  accountNumberField.insertAdjacentElement("afterend", currencyField);

  const accountCurrency = form.querySelector('[name="accountCurrency"]');
  if (accountCurrency) {
    accountCurrency.addEventListener("change", () => {
      const symbol =
        accountCurrency.value === "IDR"
          ? "Contoh: 150000000"
          : "Contoh: 15000";
      balanceInput.placeholder = symbol;
    });
  }
}

function syncPaymentCurrencyWithWallet(form) {
  if (!form) return;

  const walletSelect = form.querySelector('[name="wallet"]');
  const currencySelect = form.querySelector('[name="currency"]');
  const helper = currencySelect
    ?.closest(".payment-currency-field")
    ?.querySelector(".currency-helper");

  if (!walletSelect || !currencySelect) return;

  const wallet = getWalletById(walletSelect.value);

  if (!wallet) {
    currencySelect.disabled = false;
    return;
  }

  currencySelect.value = wallet.currency;
  currencySelect.disabled = true;

  if (helper) {
    helper.textContent =
      `Mata uang mengikuti rekening ${accountDisplayName(wallet)} (${wallet.currency}).`;
  }

  updatePaymentField(form);
}

function injectCurrencyFields() {
  ["transactionForm", "cashInForm", "cashOutForm"].forEach(formId => {
    const form = document.getElementById(formId);
    if (!form) return;

    const amountInput = form.querySelector('[name="amount"]');
    const rateInput = form.querySelector('[name="rate"]');

    if (!amountInput || !rateInput) return;

    const rateWrapper = fieldWrapper(rateInput);
    const rateLabel = rateWrapper?.querySelector("label");
    if (rateLabel) rateLabel.textContent = "Rate USD/USDT ke IDR";

    form.querySelectorAll('[name="amountIdr"]').forEach(input => {
      const wrapper = fieldWrapper(input);
      if (wrapper?.classList.contains("currency-field-generated")) {
        wrapper.remove();
      } else {
        input.remove();
      }
    });

    const amountWrapper = fieldWrapper(amountInput);
    amountWrapper?.classList.add("payment-amount-field");

    let currencySelect = form.querySelector('[name="currency"]');

    if (!currencySelect) {
      const currencyWrapper = document.createElement("div");
      currencyWrapper.className = `${
        amountWrapper?.className || ""
      } payment-currency-field`.trim();

      currencyWrapper.innerHTML = `
        <label>Mata Uang Pembayaran</label>
        <select name="currency" aria-label="Mata uang pembayaran">
          <option value="USD">USD — Dolar Amerika</option>
          <option value="USDT">USDT — Tether</option>
          <option value="IDR">IDR — Rupiah Indonesia</option>
        </select>
        <small class="currency-helper"></small>
      `;

      amountWrapper?.insertAdjacentElement("beforebegin", currencyWrapper);
      currencySelect = form.querySelector('[name="currency"]');
    }

    if (!currencySelect) return;

    if (form.dataset.paymentCurrencyBound !== "true") {
      form.dataset.paymentCurrencyBound = "true";

      currencySelect.addEventListener("change", () => {
        amountInput.value = "";
        updatePaymentField(form);
      });
    }

    if (!currencySelect.value) currencySelect.value = "USD";
    updatePaymentField(form);
  });
}

function fillCurrencyFields(form, transaction = null) {
  if (!form) return;

  const currencySelect = form.querySelector('[name="currency"]');
  const amountInput = form.querySelector('[name="amount"]');

  if (!currencySelect || !amountInput) return;

  const currency = transaction
    ? transactionCurrency(transaction)
    : "USD";

  currencySelect.value = currency;
  amountInput.value = transaction
    ? transactionPaymentAmount(transaction)
    : "";

  updatePaymentField(form);
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
    usdtBalance: 0,
    idrBalance: 0,
    rate: settings.defaultRate
  };

  const currentRate = Number(last.rate || settings.defaultRate || 0);

  const sum = (type, currency) =>
    filteredTransactions
      .filter(
        transaction =>
          transaction.type === type &&
          transactionCurrency(transaction) === currency
      )
      .reduce(
        (total, transaction) =>
          total + transactionPaymentAmount(transaction),
        0
      );

  const totalInUsd = sum("in", "USD");
  const totalOutUsd = sum("out", "USD");
  const totalInUsdt = sum("in", "USDT");
  const totalOutUsdt = sum("out", "USDT");
  const totalInIdr = sum("in", "IDR");
  const totalOutIdr = sum("out", "IDR");

  const combinedTotalInIdr =
    totalInIdr + (totalInUsd + totalInUsdt) * currentRate;
  const combinedTotalOutIdr =
    totalOutIdr + (totalOutUsd + totalOutUsdt) * currentRate;

  const largest = currency =>
    Math.max(
      0,
      ...filteredTransactions
        .filter(transaction => transactionCurrency(transaction) === currency)
        .map(transaction => transactionPaymentAmount(transaction))
    );

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  ensureUsdtDashboardCard();

  setText("dashUsd", usd(totalAccountBalance("USD")));
  setText("dashUsdt", usdt(totalAccountBalance("USDT")));
  setText("dashIdr", idr(totalAccountBalance("IDR")));

  setCombinedIdrDashboardValue(
    "dashIn",
    combinedTotalInIdr,
    totalInUsd,
    totalInUsdt,
    totalInIdr,
    currentRate
  );

  setCombinedIdrDashboardValue(
    "dashOut",
    combinedTotalOutIdr,
    totalOutUsd,
    totalOutUsdt,
    totalOutIdr,
    currentRate
  );

  setText("summaryCount", filteredTransactions.length);
  setDualDashboardValue(
    "summaryLargest",
    largest("USD"),
    largest("USDT"),
    largest("IDR")
  );
  setText("summaryRate", idr(currentRate));
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
        <td>${esc(transactionAccountLabel(transaction))}</td>
        <td>
          <span class="badge ${transaction.type}">
            ${transaction.type === "in" ? "MASUK" : "KELUAR"}
          </span>
        </td>
        <td class="${transaction.type === "in" ? "green" : "red"}">
          ${paymentMoneyHtml(transaction)}
        </td>
        <td>
          ${dualMoneyHtml(
            transaction.balance,
            transaction.usdtBalance,
            transaction.idrBalance
          )}
        </td>
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
    .filter(transaction => {
      const account = getTransactionWallet(transaction);
      const accountText = transactionAccountLabel(transaction).toLowerCase();

      return (
        (!search ||
          transaction.note.toLowerCase().includes(search) ||
          accountText.includes(search) ||
          getStoreName(transaction.storeId).toLowerCase().includes(search)) &&
        (!walletFilter || String(account?.id || "") === String(walletFilter)) &&
        (!typeFilter || transaction.type === typeFilter) &&
        (!dateFilter || transaction.date === dateFilter)
      );
    })
    .forEach(transaction => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${dateLabel(transaction.date)}</td>
        <td>
          ${esc(transaction.note)}
          ${storeLabel(transaction)}
        </td>
        <td>${esc(transactionAccountLabel(transaction))}</td>
        <td>${idr(transaction.rate)}</td>
        <td class="green">
          ${
            transaction.type === "in"
              ? paymentMoneyHtml(transaction)
              : "-"
          }
        </td>
        <td class="red">
          ${
            transaction.type === "out"
              ? paymentMoneyHtml(transaction)
              : "-"
          }
        </td>
        <td>
          ${dualMoneyHtml(
            transaction.balance,
            transaction.usdtBalance,
            transaction.idrBalance
          )}
        </td>
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
    card.className = "metric wallet-card account-card";

    const numberLine = maskedAccountNumber(wallet.accountNumber);
    const storeLine =
      activeStoreId === "all"
        ? ` • ${esc(getStoreName(wallet.storeId))}`
        : "";

    card.innerHTML = `
      <div class="wallet-top">
        <div>
          <span>
            ${esc(wallet.institution)}
            ${numberLine ? ` • ${esc(numberLine)}` : ""}
            ${storeLine}
          </span>
          <h3>${esc(wallet.ownerName)}</h3>
          <small class="account-currency-badge">${esc(wallet.currency)}</small>
        </div>
        <span class="wallet-dot ${wallet.color}"></span>
      </div>

      <div class="wallet-money account-balance">
        <strong>${accountBalanceText(wallet)}</strong>
      </div>

      <small>Saldo terakhir rekening</small>
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

  const itemHtml = transaction => `
    <div class="transaction-item">
      <div>
        <strong>${esc(transaction.note)}</strong>
        <small>
          ${dateLabel(transaction.date)} • ${esc(transactionAccountLabel(transaction))}
          ${
            activeStoreId === "all"
              ? ` • ${esc(getStoreName(transaction.storeId))}`
              : ""
          }
        </small>
      </div>
      <div class="${transaction.type === "in" ? "green" : "red"}">
        ${paymentMoneyHtml(transaction)}
      </div>
    </div>
  `;

  filteredTransactions
    .filter(transaction => transaction.type === "in")
    .slice(-6)
    .reverse()
    .forEach(transaction => {
      cashInList.innerHTML += itemHtml(transaction);
    });

  filteredTransactions
    .filter(transaction => transaction.type === "out")
    .slice(-6)
    .reverse()
    .forEach(transaction => {
      cashOutList.innerHTML += itemHtml(transaction);
    });
}

function renderReports() {
  const summary = monthly();
  const body = document.getElementById("reportBody");

  if (body) {
    body.innerHTML = "";

    summary.forEach(item => {
      const netUsd = item.in - item.out;
      const netUsdt = item.inUsdt - item.outUsdt;
      const netIdr = item.inIdr - item.outIdr;

      const label = new Date(
        `${item.month}-01T00:00:00`
      ).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric"
      });

      body.innerHTML += `
        <tr>
          <td>${label}</td>
          <td class="green">
            ${dualMoneyHtml(item.in, item.inUsdt, item.inIdr)}
          </td>
          <td class="red">
            ${dualMoneyHtml(item.out, item.outUsdt, item.outIdr)}
          </td>
          <td class="${netUsd >= 0 && netUsdt >= 0 && netIdr >= 0 ? "green" : "red"}">
            ${dualMoneyHtml(netUsd, netUsdt, netIdr)}
          </td>
          <td>${item.count}</td>
        </tr>
      `;
    });
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const current = summary.find(item => item.month === currentMonth) || {
    in: 0,
    out: 0,
    inUsdt: 0,
    outUsdt: 0,
    inIdr: 0,
    outIdr: 0
  };

  setDualDashboardValue(
    "reportIn",
    current.in,
    current.inUsdt,
    current.inIdr
  );
  setDualDashboardValue(
    "reportOut",
    current.out,
    current.outUsdt,
    current.outIdr
  );
  setDualDashboardValue(
    "reportNet",
    current.in - current.out,
    current.inUsdt - current.outUsdt,
    current.inIdr - current.outIdr
  );
}

function populateWallets() {
  const availableWallets = getFilteredWallets();

  const walletOptions = availableWallets
    .map(wallet => {
      const number = maskedAccountNumber(wallet.accountNumber);
      const store =
        activeStoreId === "all"
          ? ` — ${getStoreName(wallet.storeId)}`
          : "";

      return `
        <option value="${esc(wallet.id)}">
          ${esc(accountDisplayName(wallet))}${
            number ? ` — ${esc(number)}` : ""
          } — ${esc(wallet.currency)}${esc(store)}
        </option>
      `;
    })
    .join("");

  document.querySelectorAll('select[name="wallet"]').forEach(select => {
    const oldValue = select.value;
    const oldWallet =
      getWalletById(oldValue) ||
      availableWallets.find(wallet =>
        wallet.name === oldValue ||
        wallet.legacyName === oldValue ||
        wallet.institution === oldValue
      );

    select.innerHTML = walletOptions;

    const preferredId = oldWallet?.id || availableWallets[0]?.id || "";

    if (
      preferredId &&
      [...select.options].some(
        option => String(option.value) === String(preferredId)
      )
    ) {
      select.value = preferredId;
    }

    if (select.dataset.accountCurrencyBound !== "true") {
      select.dataset.accountCurrencyBound = "true";
      select.addEventListener("change", () => {
        syncPaymentCurrencyWithWallet(select.form);
      });
    }

    syncPaymentCurrencyWithWallet(select.form);
  });

  const filter = document.getElementById("filterWallet");

  if (filter) {
    const oldValue = filter.value;
    filter.innerHTML =
      '<option value="">Semua rekening</option>' + walletOptions;

    if (
      oldValue &&
      [...filter.options].some(
        option => String(option.value) === String(oldValue)
      )
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
  const hasUsd = summary.some(item => item.in > 0 || item.out > 0);
  const hasUsdt = summary.some(item => item.inUsdt > 0 || item.outUsdt > 0);
  const chartCurrency = hasUsd ? "USD" : hasUsdt ? "USDT" : "IDR";

  const getValues = item => {
    if (chartCurrency === "USD") return [item.in, item.out];
    if (chartCurrency === "USDT") return [item.inUsdt, item.outUsdt];
    return [item.inIdr, item.outIdr];
  };

  const maximum = Math.max(1, ...summary.flatMap(getValues));
  const padding = 34;
  const chartHeight = height - 60;
  const chartWidth = width - padding * 2;
  const styles = getComputedStyle(document.body);

  context.strokeStyle = styles.getPropertyValue("--border").trim() || "#ddd";
  context.fillStyle = styles.getPropertyValue("--muted").trim() || "#777";
  context.font = "12px Arial";
  context.fillText(`Grafik ${chartCurrency}`, padding, 12);

  for (let index = 0; index <= 4; index += 1) {
    const y = 24 + (chartHeight / 4) * index;
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
    const [incoming, outgoing] = getValues(item);
    const barX = padding + index * groupWidth + groupWidth * 0.18;
    const barWidth = groupWidth * 0.24;
    const inHeight = (incoming / maximum) * chartHeight;
    const outHeight = (outgoing / maximum) * chartHeight;

    context.fillStyle = "#16803d";
    context.fillRect(barX, 24 + chartHeight - inHeight, barWidth, inHeight);
    context.fillStyle = "#c62828";
    context.fillRect(
      barX + barWidth + 5,
      24 + chartHeight - outHeight,
      barWidth,
      outHeight
    );

    context.fillStyle = styles.getPropertyValue("--muted").trim() || "#777";
    context.fillText(
      new Date(`${item.month}-01`).toLocaleDateString("id-ID", { month: "short" }),
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

  const itemWallet = item ? getTransactionWallet(item) : null;
  form.wallet.value =
    itemWallet?.id || getFilteredWallets()[0]?.id || "";

  form.type.value = item?.type || "in";
  form.rate.value = item?.rate || settings.defaultRate;
  form.note.value = item?.note || "";
  form.reference.value = item?.reference || "";

  fillCurrencyFields(form, item);
  syncPaymentCurrencyWithWallet(form);

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

  const wallet = getWalletById(data.get("wallet"));

  if (!wallet || wallet.storeId !== storeId) {
    alert("Pilih rekening yang valid untuk toko ini.");
    return false;
  }

  const rate = Number(data.get("rate")) || Number(settings.defaultRate) || 0;
  const currency = wallet.currency;
  const paymentAmount = numericValue(data.get("amount"));

  const amountUsd =
    currency === "IDR"
      ? rate > 0
        ? Number((paymentAmount / rate).toFixed(6))
        : 0
      : paymentAmount;

  const amountIdr =
    currency === "IDR"
      ? Math.round(paymentAmount)
      : Math.round(paymentAmount * rate);

  const transaction = {
    date: data.get("date"),
    walletId: wallet.id,
    wallet: accountDisplayName(wallet),
    type: typeOverride || data.get("type"),
    currency,
    paymentAmount,
    rate,
    note: String(data.get("note") || "").trim(),
    amount: amountUsd,
    amountIdr,
    reference: String(data.get("reference") || "").trim(),
    storeId
  };

  if (
    !transaction.date ||
    !transaction.walletId ||
    !transaction.note ||
    !transaction.rate ||
    transaction.paymentAmount <= 0
  ) {
    alert("Lengkapi data wajib dan isi nominal pembayaran.");
    return false;
  }

  if (editingId) {
    transactions = transactions.map(item =>
      item.id === editingId ? { ...item, ...transaction } : item
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
      : `${currency} ditambahkan ke ${accountDisplayName(wallet)}.`
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
        "Pemilik Rekening",
        "Bank / Platform",
        "Nomor Rekening",
        "Mata Uang Rekening",
        "Tipe",
        "Nominal Pembayaran",
        "Rate USD/USDT ke IDR",
        "Nilai Setara USD",
        "Nilai USDT Asli",
        "Nilai Setara IDR"
      ],
      ...filteredTransactions.map(transaction => {
        const wallet = getTransactionWallet(transaction);

        return [
          getStoreName(transaction.storeId),
          transaction.date,
          transaction.note,
          wallet?.ownerName || "",
          wallet?.institution || transaction.wallet,
          wallet?.accountNumber || "",
          transactionCurrency(transaction),
          transaction.type,
          transactionPaymentAmount(transaction),
          transaction.rate,
          transactionUsd(transaction),
          transactionUsdt(transaction),
          transactionIdr(transaction)
        ];
      })
    ]
  );
}

function exportReport() {
  exportCsv("ledger-pro-report.csv", [
    [
      "Bulan",
      "Masuk USD",
      "Masuk USDT",
      "Masuk IDR",
      "Keluar USD",
      "Keluar USDT",
      "Keluar IDR",
      "Net USD",
      "Net USDT",
      "Net IDR",
      "Jumlah"
    ],
    ...monthly().map(item => [
      item.month,
      item.in,
      item.inUsdt,
      item.inIdr,
      item.out,
      item.outUsdt,
      item.outIdr,
      item.in - item.out,
      item.inUsdt - item.outUsdt,
      item.inIdr - item.outIdr,
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
        event.target.date.value = new Date().toISOString().slice(0, 10);
        event.target.rate.value = settings.defaultRate;
        populateWallets();
      }
    });

  document
    .getElementById("cashOutForm")
    ?.addEventListener("submit", event => {
      event.preventDefault();

      if (!requireSelectedStore()) return;

      if (saveTx(new FormData(event.target), "out")) {
        event.target.reset();
        event.target.date.value = new Date().toISOString().slice(0, 10);
        event.target.rate.value = settings.defaultRate;
        populateWallets();
      }
    });

  document
    .getElementById("walletForm")
    ?.addEventListener("submit", event => {
      event.preventDefault();

      if (!requireSelectedStore()) return;

      const data = new FormData(event.target);
      const ownerName = String(data.get("name") || "").trim();
      const institution = String(data.get("institution") || "").trim();
      const accountNumber = String(data.get("accountNumber") || "").trim();
      const currency = String(data.get("accountCurrency") || "IDR").toUpperCase();

      if (!ownerName || !institution) {
        alert("Isi nama pemilik dan bank/platform.");
        return;
      }

      const duplicate = wallets.some(wallet =>
        wallet.storeId === activeStoreId &&
        wallet.ownerName.toLowerCase() === ownerName.toLowerCase() &&
        wallet.institution.toLowerCase() === institution.toLowerCase() &&
        String(wallet.accountNumber || "").toLowerCase() ===
          accountNumber.toLowerCase() &&
        wallet.currency === currency
      );

      if (duplicate) {
        alert("Rekening tersebut sudah ada di toko ini.");
        return;
      }

      const name =
        ownerName.toLowerCase() === institution.toLowerCase()
          ? ownerName
          : `${ownerName} — ${institution}`;

      wallets.push({
        id: `${activeStoreId}-account-${Date.now()}`,
        name,
        ownerName,
        institution,
        accountNumber,
        currency,
        type: data.get("type") || (currency === "USDT" ? "Crypto" : "Bank"),
        balance: numericValue(data.get("balance")),
        color: data.get("color") || (currency === "IDR" ? "green" : "blue"),
        storeId: activeStoreId
      });

      save();
      render();
      event.target.reset();

      const currencyField = event.target.querySelector('[name="accountCurrency"]');
      if (currencyField) currencyField.value = "IDR";

      toast(`${name} (${currency}) ditambahkan ke ${getStoreName(activeStoreId)}.`);
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

      settings.appName = data.get("appName") || "Ledger Pro";
      settings.defaultRate = Number(data.get("defaultRate")) || 16300;
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
  ensureUsdtDashboardCard();
  populateStores();
  injectCurrencyFields();
  injectAccountFields();
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
