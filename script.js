// 1. Mengambil elemen HTML berdasarkan ID-nya
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const logMessage = document.getElementById('log-message');

// 2. Variabel utama (Durasi Misi: 45 menit)
let totalSeconds = 45 * 60; 
let intervalId; // Untuk menyimpan identitas timer
let isPaused = true;

// 3. Fungsi utama untuk menghitung mundur
function updateTimer() {
    // Jika waktu habis (0 detik)
    if (totalSeconds <= 0) {
        clearInterval(intervalId); // Hentikan timer
        logMessage.textContent = "MISI SELESAI! Ambil 10 menit Micro-Break!";
        startBtn.disabled = true;
        pauseBtn.disabled = true;
        return;
    }

    // Hitung sisa menit dan detik
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Tampilkan di HTML, pastikan ada nol di depan jika < 10 (misal 05)
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');

    totalSeconds--; // Kurangi 1 detik
}

// 4. Aksi saat tombol "TERBANG" (Start) ditekan
startBtn.addEventListener('click', () => {
    if (isPaused) {
        // Mulai timer dan ulangi setiap 1000 milidetik (1 detik)
        intervalId = setInterval(updateTimer, 1000); 
        logMessage.textContent = "TERBANG DIMULAI! Jaga Ketinggian Fokus.";
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    }
});

// 5. Aksi saat tombol "TUNDA" (Pause) ditekan
pauseBtn.addEventListener('click', () => {
    clearInterval(intervalId); // Hentikan hitungan mundur
    logMessage.textContent = "Peringatan! Turbulensi Terdeteksi. (Jeda)";
    isPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
});

// 6. Aksi saat tombol "MENDARAT" (Reset) ditekan
resetBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    totalSeconds = 45 * 60; // Kembalikan ke 45 menit
    minutesDisplay.textContent = '45';
    secondsDisplay.textContent = '00';
    logMessage.textContent = "Misi Dibatalkan. Siap Lepas Landas Ulang.";
    isPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
});
