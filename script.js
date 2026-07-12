const STORAGE_KEY = "ledgerProTransactions";

const defaultTransactions = [
  {
    id: 1,
    date: "2024-04-24",
    description: "Saldo awal",
    type: "masuk",
    rate: 16300,
    amount: 30000,
    reference: ""
  },
  {
    id: 2,
    date: "2024-04-24",
    description: "Transfer masuk",
    type: "masuk",
    rate: 16300,
    amount: 31336.39,
    reference: ""
  },
  {
    id: 3,
    date: "2024-04-27",
    description: "Pengeluaran",
    type: "keluar",
    rate: 16300,
    amount: 30000,
    reference: ""
  },
  {
    id: 4,
    date: "2024-05-01",
    description: "Transfer masuk",
    type: "masuk",
    rate: 16333,
    amount: 2000,
    reference: ""
  },
  {
    id: 5,
    date: "2024-05-02",
    description: "Pengeluaran",
    type: "keluar",
    rate: 16333,
    amount: 5000,
    reference: ""
  }
];

let transactions = loadTransactions();
let transactionIdToDelete = null;

const transactionTableBody =
  document.getElementById("transactionTableBody");

const totalSaldoUsd =
  document.getElementById("totalSaldoUsd");

const totalSaldoIdr =
  document.getElementById("totalSaldoIdr");

const totalUangMasuk =
  document.getElementById("totalUangMasuk");

const totalUangKeluar =
  document.getElementById("totalUangKeluar");

const transactionCount =
  document.getElementById("transactionCount");

const searchInput =
  document.getElementById("searchInput");

const transactionTypeFilter =
  document.getElementById("transactionTypeFilter");

const dateFilter =
  document.getElementById("dateFilter");

const transactionModal =
  document.getElementById("transactionModal");

const deleteModal =
  document.getElementById("deleteModal");

const transactionForm =
  document.getElementById("transactionForm");

const transactionDate =
  document.getElementById("transactionDate");

const transactionType =
  document.getElementById("transactionType");

const transactionDescription =
  document.getElementById("transactionDescription");

const transactionRate =
  document.getElementById("transactionRate");

const transactionAmount =
  document.getElementById("transactionAmount");

const transactionReference =
  document.getElementById("transactionReference");

document
  .getElementById("openTransactionModal")
  .addEventListener("click", openTransactionModal);

document
  .getElementById("closeTransactionModal")
  .addEventListener("click", closeTransactionModal);

document
  .getElementById("cancelTransaction")
  .addEventListener("click", closeTransactionModal);

document
  .getElementById("cancelDelete")
  .addEventListener("click", closeDeleteModal);

document
  .getElementById("confirmDelete")
  .addEventListener("click", confirmDeleteTransaction);

document
  .getElementById("exportButton")
  .addEventListener("click", exportTransactionsToCsv);

transactionForm.addEventListener(
  "submit",
  handleTransactionSubmit
);

searchInput.addEventListener(
  "input",
  renderApplication
);

transactionTypeFilter.addEventListener(
  "change",
  renderApplication
);

dateFilter.addEventListener(
  "change",
  renderApplication
);

transactionModal.addEventListener(
  "click",
  function (event) {
    if (event.target === transactionModal) {
      closeTransactionModal();
    }
  }
);

deleteModal.addEventListener(
  "click",
  function (event) {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  }
);

document.addEventListener(
  "keydown",
  function (event) {
    if (event.key === "Escape") {
      closeTransactionModal();
      closeDeleteModal();
    }
  }
);

function loadTransactions() {
  const savedData =
    localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return [...defaultTransactions];
  }

  try {
    const parsedData =
      JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [...defaultTransactions];
    }

    return parsedData;
  } catch (error) {
    console.error(
      "Gagal membaca data transaksi:",
      error
    );

    return [...defaultTransactions];
  }
}

function saveTransactions() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(transactions)
  );
}

function getCalculatedTransactions() {
  let currentBalance = 0;

  return [...transactions]
    .sort(function (firstItem, secondItem) {
      const firstDate =
        new Date(firstItem.date);

      const secondDate =
        new Date(secondItem.date);

      if (
        firstDate.getTime() ===
        secondDate.getTime()
      ) {
        return firstItem.id - secondItem.id;
      }

      return firstDate - secondDate;
    })
    .map(function (transaction) {
      const amount =
        Number(transaction.amount);

      const rate =
        Number(transaction.rate);

      if (transaction.type === "masuk") {
        currentBalance += amount;
      } else {
        currentBalance -= amount;
      }

      return {
        ...transaction,
        balanceUsd: currentBalance,
        balanceIdr: currentBalance * rate
      };
    });
}

function getFilteredTransactions(
  calculatedTransactions
) {
  const searchValue =
    searchInput.value
      .trim()
      .toLowerCase();

  const typeValue =
    transactionTypeFilter.value;

  const dateValue =
    dateFilter.value;

  return calculatedTransactions.filter(
    function (transaction) {
      const matchesSearch =
        !searchValue ||
        transaction.description
          .toLowerCase()
          .includes(searchValue) ||
        transaction.reference
          .toLowerCase()
          .includes(searchValue);

      const matchesType =
        !typeValue ||
        transaction.type === typeValue;

      const matchesDate =
        !dateValue ||
        transaction.date === dateValue;

      return (
        matchesSearch &&
        matchesType &&
        matchesDate
      );
    }
  );
}

function renderApplication() {
  const calculatedTransactions =
    getCalculatedTransactions();

  const filteredTransactions =
    getFilteredTransactions(
      calculatedTransactions
    );

  renderSummaryCards(
    calculatedTransactions
  );

  renderTransactionTable(
    filteredTransactions
  );
}

function renderSummaryCards(
  calculatedTransactions
) {
  const totalIncome =
    transactions
      .filter(function (transaction) {
        return transaction.type === "masuk";
      })
      .reduce(function (total, transaction) {
        return (
          total +
          Number(transaction.amount)
        );
      }, 0);

  const totalExpense =
    transactions
      .filter(function (transaction) {
        return transaction.type === "keluar";
      })
      .reduce(function (total, transaction) {
        return (
          total +
          Number(transaction.amount)
        );
      }, 0);

  const lastTransaction =
    calculatedTransactions[
      calculatedTransactions.length - 1
    ];

  const finalBalanceUsd =
    lastTransaction
      ? lastTransaction.balanceUsd
      : 0;

  const finalBalanceIdr =
    lastTransaction
      ? lastTransaction.balanceIdr
      : 0;

  totalSaldoUsd.textContent =
    formatUsd(finalBalanceUsd);

  totalSaldoIdr.textContent =
    formatIdr(finalBalanceIdr);

  totalUangMasuk.textContent =
    formatUsd(totalIncome);

  totalUangKeluar.textContent =
    formatUsd(totalExpense);
}

function renderTransactionTable(
  filteredTransactions
) {
  transactionTableBody.innerHTML = "";

  if (filteredTransactions.length === 0) {
    const emptyRow =
      document.createElement("tr");

    emptyRow.innerHTML = `
      <td colspan="9"
          style="
            text-align:center;
            padding:28px;
            color:#667085;
          ">
        Tidak ada transaksi ditemukan.
      </td>
    `;

    transactionTableBody.appendChild(
      emptyRow
    );

    transactionCount.textContent =
      "0 transaksi";

    return;
  }

  filteredTransactions.forEach(
    function (transaction) {
      const row =
        document.createElement("tr");

      const amountIn =
        transaction.type === "masuk"
          ? formatUsd(transaction.amount)
          : "-";

      const amountOut =
        transaction.type === "keluar"
          ? formatUsd(transaction.amount)
          : "-";

      const statusClass =
        transaction.type === "masuk"
          ? "status-masuk"
          : "status-keluar";

      const statusText =
        transaction.type === "masuk"
          ? "MASUK"
          : "KELUAR";

      row.innerHTML = `
        <td>
          ${formatDate(transaction.date)}
        </td>

        <td>
          <strong>
            ${escapeHtml(
              transaction.description
            )}
          </strong>

          ${
            transaction.reference
              ? `
                <div
                  style="
                    margin-top:4px;
                    color:#667085;
                    font-size:11px;
                  "
                >
                  ${escapeHtml(
                    transaction.reference
                  )}
                </div>
              `
              : ""
          }
        </td>

        <td>
          ${formatIdr(transaction.rate)}
        </td>

        <td class="positive-text">
          ${amountIn}
        </td>

        <td class="negative-text">
          ${amountOut}
        </td>

        <td>
          <strong>
            ${formatUsd(
              transaction.balanceUsd
            )}
          </strong>
        </td>

        <td>
          ${formatIdr(
            transaction.balanceIdr
          )}
        </td>

        <td>
          <span
            class="
              status-badge
              ${statusClass}
            "
          >
            ${statusText}
          </span>
        </td>

        <td>
          <button
            type="button"
            class="action-button"
            data-delete-id="${transaction.id}"
          >
            Hapus
          </button>
        </td>
      `;

      transactionTableBody.appendChild(
        row
      );
    }
  );

  const deleteButtons =
    transactionTableBody.querySelectorAll(
      "[data-delete-id]"
    );

  deleteButtons.forEach(
    function (button) {
      button.addEventListener(
        "click",
        function () {
          const transactionId =
            Number(
              button.dataset.deleteId
            );

          openDeleteModal(
            transactionId
          );
        }
      );
    }
  );

  transactionCount.textContent =
    `${filteredTransactions.length} transaksi`;
}

function openTransactionModal() {
  transactionDate.value =
    getTodayDate();

  transactionType.value =
    "masuk";

  transactionDescription.value =
    "";

  transactionRate.value =
    "16300";

  transactionAmount.value =
    "";

  transactionReference.value =
    "";

  transactionModal.classList.add(
    "show"
  );

  setTimeout(function () {
    transactionDescription.focus();
  }, 50);
}

function closeTransactionModal() {
  transactionModal.classList.remove(
    "show"
  );
}

function handleTransactionSubmit(
  event
) {
  event.preventDefault();

  const date =
    transactionDate.value;

  const type =
    transactionType.value;

  const description =
    transactionDescription.value
      .trim();

  const rate =
    Number(transactionRate.value);

  const amount =
    Number(transactionAmount.value);

  const reference =
    transactionReference.value
      .trim();

  if (
    !date ||
    !description ||
    !rate ||
    !amount
  ) {
    alert(
      "Mohon lengkapi tanggal, keterangan, rate, dan nominal."
    );

    return;
  }

  if (rate <= 0 || amount <= 0) {
    alert(
      "Rate dan nominal harus lebih besar dari nol."
    );

    return;
  }

  const newTransaction = {
    id: Date.now(),
    date,
    description,
    type,
    rate,
    amount,
    reference
  };

  transactions.push(
    newTransaction
  );

  saveTransactions();

  closeTransactionModal();

  renderApplication();
}

function openDeleteModal(
  transactionId
) {
  transactionIdToDelete =
    transactionId;

  deleteModal.classList.add(
    "show"
  );
}

function closeDeleteModal() {
  transactionIdToDelete = null;

  deleteModal.classList.remove(
    "show"
  );
}

function confirmDeleteTransaction() {
  if (
    transactionIdToDelete === null
  ) {
    return;
  }

  transactions =
    transactions.filter(
      function (transaction) {
        return (
          transaction.id !==
          transactionIdToDelete
        );
      }
    );

  saveTransactions();

  closeDeleteModal();

  renderApplication();
}

function exportTransactionsToCsv() {
  const calculatedTransactions =
    getCalculatedTransactions();

  if (
    calculatedTransactions.length === 0
  ) {
    alert(
      "Belum ada transaksi untuk diexport."
    );

    return;
  }

  const header = [
    "Tanggal",
    "Keterangan",
    "Referensi",
    "Tipe",
    "Rate IDR",
    "Masuk USD",
    "Keluar USD",
    "Saldo USD",
    "Saldo Rupiah"
  ];

  const dataRows =
    calculatedTransactions.map(
      function (transaction) {
        return [
          transaction.date,
          transaction.description,
          transaction.reference,
          transaction.type,
          transaction.rate,
          transaction.type === "masuk"
            ? transaction.amount
            : "",
          transaction.type === "keluar"
            ? transaction.amount
            : "",
          transaction.balanceUsd,
          transaction.balanceIdr
        ];
      }
    );

  const csvRows = [
    header,
    ...dataRows
  ];

  const csvContent =
    csvRows
      .map(function (row) {
        return row
          .map(function (value) {
            const safeValue =
              String(value ?? "")
                .replaceAll('"', '""');

            return `"${safeValue}"`;
          })
          .join(",");
      })
      .join("\n");

  const csvWithBom =
    "\uFEFF" + csvContent;

  const blob =
    new Blob(
      [csvWithBom],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );

  const downloadUrl =
    URL.createObjectURL(blob);

  const downloadLink =
    document.createElement("a");

  downloadLink.href =
    downloadUrl;

  downloadLink.download =
    `ledger-export-${getTodayDate()}.csv`;

  document.body.appendChild(
    downloadLink
  );

  downloadLink.click();

  document.body.removeChild(
    downloadLink
  );

  URL.revokeObjectURL(
    downloadUrl
  );
}

function formatUsd(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(Number(value) || 0);
}

function formatIdr(value) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(Number(value) || 0);
}

function formatDate(dateString) {
  return new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function getTodayDate() {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderApplication();