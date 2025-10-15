document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMEN DOM ---
    const balanceAmountEl = document.getElementById('balance-amount');
    const transactionForm = document.getElementById('transaction-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const transactionListEl = document.getElementById('transaction-list');
    
    // Elemen Target Tabungan
    const setTargetBtn = document.getElementById('set-target-btn');
    const targetModal = document.getElementById('target-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const targetForm = document.getElementById('target-form');
    const targetAmountInput = document.getElementById('target-amount');
    const savingsProgressTextEl = document.getElementById('savings-progress-text');
    const savingsTargetTextEl = document.getElementById('savings-target-text');
    const savingsProgressBar = document.getElementById('savings-progress-bar');
    
    // Elemen Laporan Mingguan
    const weeklyIncomeEl = document.getElementById('weekly-income');
    const weeklyExpenseEl = document.getElementById('weekly-expense');


    // --- STATE APLIKASI ---
    // Mengambil data dari localStorage atau menggunakan array kosong jika tidak ada
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let savingsTarget = JSON.parse(localStorage.getItem('savingsTarget')) || 0;


    // --- FUNGSI ---

    // Fungsi untuk memformat angka menjadi format Rupiah
    const formatToRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Fungsi untuk menyimpan data ke localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('savingsTarget', JSON.stringify(savingsTarget));
    };

    // Fungsi untuk merender daftar transaksi di UI
    const renderTransactions = () => {
        transactionListEl.innerHTML = ''; // Kosongkan daftar sebelum merender ulang

        if (transactions.length === 0) {
            transactionListEl.innerHTML = '<li class="no-transactions">Belum ada transaksi.</li>';
            return;
        }

        transactions.forEach((transaction, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="transaction-desc">${transaction.description}</span>
                <div>
                    <span class="transaction-amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-'} ${formatToRupiah(transaction.amount)}</span>
                    <button class="delete-btn" onclick="deleteTransaction(${index})">Hapus</button>
                </div>
            `;
            transactionListEl.appendChild(li);
        });
    };

    // Fungsi untuk menghapus transaksi
    window.deleteTransaction = (index) => {
        transactions.splice(index, 1);
        updateAll();
    };

    // Fungsi untuk memperbarui total saldo
    const updateBalance = () => {
        const total = transactions.reduce((acc, transaction) => {
            return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
        }, 0);
        balanceAmountEl.textContent = formatToRupiah(total);
        return total;
    };
    
    // Fungsi untuk memperbarui progres target tabungan
    const updateSavingsProgress = (currentBalance) => {
        savingsTargetTextEl.textContent = `Target: ${formatToRupiah(savingsTarget)}`;
        savingsProgressTextEl.textContent = `Tersimpan: ${formatToRupiah(currentBalance > 0 ? currentBalance : 0)}`;

        if (savingsTarget > 0) {
            const progress = Math.max(0, (currentBalance / savingsTarget) * 100);
            savingsProgressBar.style.width = `${Math.min(progress, 100)}%`;
        } else {
            savingsProgressBar.style.width = '0%';
        }
    };
    
    // Fungsi untuk membuat laporan mingguan
    const generateWeeklyReport = () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyTransactions = transactions.filter(t => new Date(t.date) >= oneWeekAgo);
        
        const weeklyIncome = weeklyTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const weeklyExpense = weeklyTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        weeklyIncomeEl.textContent = formatToRupiah(weeklyIncome);
        weeklyExpenseEl.textContent = formatToRupiah(weeklyExpense);
    };


    // Fungsi untuk memperbarui semua komponen UI
    const updateAll = () => {
        const currentBalance = updateBalance();
        renderTransactions();
        updateSavingsProgress(currentBalance);
        generateWeeklyReport();
        saveToLocalStorage();
    };

    // --- EVENT LISTENERS ---

    // Event listener untuk form tambah transaksi
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = document.querySelector('input[name="type"]:checked').value;

        if (description === '' || isNaN(amount) || amount <= 0) {
            alert('Silakan masukkan deskripsi dan jumlah yang valid.');
            return;
        }

        const newTransaction = {
            description,
            amount,
            type,
            date: new Date().toISOString()
        };

        transactions.push(newTransaction);
        
        // Reset form
        descriptionInput.value = '';
        amountInput.value = '';

        updateAll();
    });

    // Event listener untuk membuka modal target
    setTargetBtn.addEventListener('click', () => {
        targetModal.style.display = 'block';
        targetAmountInput.value = savingsTarget > 0 ? savingsTarget : '';
    });

    // Event listener untuk menutup modal
    closeModalBtn.addEventListener('click', () => {
        targetModal.style.display = 'none';
    });
    
    // Menutup modal jika klik di luar konten
    window.addEventListener('click', (e) => {
        if (e.target == targetModal) {
            targetModal.style.display = 'none';
        }
    });

    // Event listener untuk form set target
    targetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTarget = parseFloat(targetAmountInput.value);

        if (isNaN(newTarget) || newTarget < 0) {
            alert('Silakan masukkan jumlah target yang valid.');
            return;
        }

        savingsTarget = newTarget;
        targetModal.style.display = 'none';
        updateAll();
    });

    // --- INISIALISASI ---
    // Panggil updateAll() saat halaman pertama kali dimuat
    updateAll();
});
