// ===================================================
// 1. Setup Variabel dan Elemen
// ===================================================
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const focusPointsDisplay = document.getElementById('focus-points');
const turbulenceStatus = document.getElementById('turbulence-status');
const logMessage = document.getElementById('log-message');
const statusDisplay = document.getElementById('status-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

// Input Formulir Misi
const missionForm = document.getElementById('mission-form');
const taskInput = document.getElementById('task-input');
const focusMinInput = document.getElementById('focus-min-input');
const breakMinInput = document.getElementById('break-min-input');
const missionDisplay = document.getElementById('mission-display');
const setupBtn = document.getElementById('setup-btn');

// Modal dan Kontrol Break
const breakModal = document.getElementById('break-modal');
const breakChallengeText = document.getElementById('break-challenge-text');
const breakTimerDisplay = document.getElementById('break-timer');
const continueBtn = document.getElementById('continue-btn');
const reportModal = document.getElementById('report-modal');
const reportDetails = document.getElementById('report-details');
const closeReportBtn = document.getElementById('close-report-btn');


// Variabel Kontrol Global
let totalSeconds = 0;
let focusDurationSec = 0;
let breakDurationSec = 0;
let intervalId = null;
let focusPoints = 0;
let isFocusSession = true; // true = Fokus, false = Break
let isRunning = false;
let accuracyLog = 0; 
let currentTask = "";

// Data Misi dan Challenge
const microBreakChallenges = [
    "1 menit peregangan leher dan bahu. Jauhkan mata dari layar!",
    "2 menit melihat ke luar jendela. Temukan 3 benda berwarna hijau.",
    "3 menit meditasi suara alam (tutup mata, dengarkan lingkunganmu).",
    "4 menit minum air putih sambil berjalan bolak-balik. Hindari ponsel!",
    "5 menit menggambar doodle konyol di kertas bekas."
];

// ===================================================
// 2. Fungsi Utility
// ===================================================

/**
 * Mengupdate tampilan timer utama dan break.
 */
function renderTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedTime = ${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')};
    
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(secs).padStart(2, '0');
    breakTimerDisplay.textContent = formattedTime; 
}

/**
 * Logika hitungan mundur, dipanggil setiap detik.
 */
function updateTimer() {
    if (totalSeconds <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        isRunning = false;
        
        if (isFocusSession) {
            startBreak(); // Fokus Selesai -> Mulai Break
        } else {
            // Break Selesai -> Siap Lapor
            continueBtn.disabled = false; 
            breakTimerDisplay.textContent = "00:00";
            statusDisplay.textContent = Status: ISTIRAHAT SELESAI. Tekan LANJUTKAN.;
            logMessage.textContent = "Tekan LANJUTKAN MISI untuk melihat Laporan Penerbangan.";
        }
        return;
    }
    
    // Logika Poin
    if (isFocusSession) {
        focusPoints += 1; 
        focusPointsDisplay.textContent = focusPoints;
        statusDisplay.textContent = Status: FOKUS! (${Math.ceil(totalSeconds / 60)}m tersisa);
    } else {
        statusDisplay.textContent = Status: ISTIRAHAT (${Math.ceil(totalSeconds / 60)}m tersisa);
    }

    renderTimer(totalSeconds);
    totalSeconds--;
}

/**
 * Memulai Interval Timer.
 */
function runTimer() {
    if (isRunning || !currentTask) return; // Mencegah start ganda atau jika misi belum diatur

    isRunning = true;
    intervalId = setInterval(updateTimer, 1000);
    logMessage.textContent = isFocusSession ? "TERBANG DIMULAI! Jaga Ketinggian Fokus." : "ISTIRAHAT DIMULAI!";
    
    // Kontrol Tombol
    startBtn.disabled = true;
    resetBtn.disabled = false;
}

// ===================================================
// 3. Kontrol Misi (Setup, Transisi, Reset)
// ===================================================

/**
 * Fungsi untuk menyiapkan misi dari input formulir.
 */
function setupMission(event) {
    // PENTING: Mencegah refresh halaman
    event.preventDefault(); 
    
    currentTask = taskInput.value.trim();
    const focusMinutes = parseInt(focusMinInput.value);
    const breakMinutes = parseInt(breakMinInput.value);

    // Validasi input
    if (!currentTask || focusMinutes < 5 || breakMinutes < 1) {
        alert("Pilot, pastikan semua input terisi dengan benar!");
        return;
    }
    
    // Set Durasi
    focusDurationSec = focusMinutes * 60;
    breakDurationSec = breakMinutes * 60;
    
    // Set Sesi Awal (Fokus)
    totalSeconds = focusDurationSec;
    isFocusSession = true;
    
    // Update Tampilan Misi
    missionDisplay.textContent = Misi: ${currentTask};
    statusDisplay.textContent = Status: SIAP TERBANG.;
    renderTimer(totalSeconds);
    
    // Kontrol UI
    startBtn.disabled = false; // Aktifkan tombol TERBANG
    resetBtn.disabled = false;
    logMessage.textContent = "Siap Lepas Landas! Tekan 'TERBANG' untuk memulai.";
    
    // Nonaktifkan pengaturan
    taskInput.disabled = true;
    focusMinInput.disabled = true;
    breakMinInput.disabled = true;
    setupBtn.disabled = true;
}

/**
 * Memulai Sesi Istirahat (Break).
 */
function startBreak() {
    isFocusSession = false;
    totalSeconds = breakDurationSec; 
    
    // Tampilkan Modal Break
    breakModal.style.display = 'block';
    const challenge = microBreakChallenges[Math.floor(Math.random() * microBreakChallenges.length)];
    breakChallengeText.textContent = challenge;
    
    logMessage.textContent = "🛬 Waktunya Micro-Break. Lakukan challenge di modal!";
    
    // Mulai timer break
    runTimer();
}

/**
 * Menampilkan Laporan Penerbangan setelah sesi selesai.
 */
function finishMission() {
    breakModal.style.display = 'none'; 
    
    const finalFocusMinutes = focusDurationSec / 60;
    const badge = accuracyLog <= 5 ? "Pilot Konsisten 🏅" : "Pilot Tangguh 💪";
    
    const report = `
Tugas: ${currentTask}
Durasi Fokus: ${finalFocusMinutes} Menit
Total Poin Fokus: ${focusPoints}
Akurasi Fokus (Turbulensi): ${accuracyLog} kali
Lencana: ${badge}
    `;
    
    reportDetails.textContent = report;
    reportModal.style.display = 'block';
    
    logMessage.textContent = "Misi Selesai. Laporan telah dibuat.";

    // Lakukan reset total setelah laporan dilihat
    resetMission(false); 
}

/**
 * Mereset semua status, skor, dan UI.
 * @param {boolean} fullReset - true jika reset dipicu oleh tombol MENDARAT/Batal.
 */
function resetMission(fullReset = true) {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    
    isRunning = false;
    isFocusSession = true;

    // Aktifkan kembali pengaturan
    taskInput.disabled = false;
    focusMinInput.disabled = false;
    breakMinInput.disabled = false;
    setupBtn.disabled = false;

    // Tutup modal
    breakModal.style.display = 'none'; 
    
    // Reset skor dan variabel
    focusPoints = 0;
    accuracyLog = 0;
    focusPointsDisplay.textContent = 0;
    turbulenceStatus.textContent = "Status: Stabil.";
    
    if (fullReset) {
        // Reset penuh (dibatalkan)
        currentTask = "";
        totalSeconds = parseInt(focusMinInput.value) * 60;
        missionDisplay.textContent = Misi: Belum diatur.;
        statusDisplay.textContent = "Status: Atur Misi & Siap Terbang.";
        logMessage.textContent = "Misi Dibatalkan. Atur misi baru.";
        
        // Kontrol Tombol
        startBtn.disabled = true;
        resetBtn.disabled = false; // Biarkan reset aktif sampai benar-benar reset visual
    } else {
        // Reset parsial (setelah finish/laporan)
        totalSeconds = parseInt(focusMinInput.value) * 60;
        missionDisplay.textContent = Misi: Belum diatur.;
        statusDisplay.textContent = "Status: Atur Misi & Siap Terbang.";
        logMessage.textContent = "Tekan TUTUP LAPORAN untuk mengatur Misi Baru.";
        
        // Kontrol Tombol
        startBtn.disabled = true;
        resetBtn.disabled = true;
    }
    
    renderTimer(totalSeconds);
}

// ===================================================
// 4. Logika Turbulensi (Window Focus/Blur)
// ===================================================

function handleTurbulence() {
    // Hanya berlaku jika timer berjalan dan sedang sesi fokus
    if (isRunning && isFocusSession) {
        focusPoints = Math.max(0, focusPoints - 10); 
        accuracyLog++;
        focusPointsDisplay.textContent = focusPoints;
        turbulenceStatus.textContent = "⚠️ TURBULENSI! Poin -10. Kembali ke Kokpit!";
        logMessage.textContent = Akurasi fokus berkurang. Total: ${accuracyLog} kali.;
    }
}
function handleStabilize() {
    if (isRunning && isFocusSession) {
        turbulenceStatus.textContent = "Status: Stabil. Lanjutkan Misi.";
    }
}

// ===================================================
// 5. Event Listeners dan Inisialisasi
// ===================================================

// Atur Misi
missionForm.addEventListener('submit', setupMission);

// Mulai Terbang/Fokus
startBtn.addEventListener('click', runTimer);

// Tombol MENDARAT (Reset Penuh)
resetBtn.addEventListener('click', () => {
    // Jika tombol MENDARAT diklik saat sedang berjalan:
    if (isRunning) {
        if (confirm("Misi sedang berjalan. Apakah Anda yakin ingin MENDARAT (Batal)?")) {
            resetMission(true);
        }
    } else {
        // Jika diklik saat misi siap (tapi belum terbang)
        resetMission(true);
    }
});

// Lanjutkan Misi (Setelah Break Selesai)
continueBtn.addEventListener('click', finishMission);

// Tutup Laporan
closeReportBtn.addEventListener('click', () => {
    reportModal.style.display = 'none';
    resetMission(true); // Setelah laporan ditutup, reset penuh untuk misi baru
});

// Listener Turbulensi
window.addEventListener('blur', handleTurbulence);
window.addEventListener('focus', handleStabilize);

// Inisialisasi Awal
document.addEventListener('DOMContentLoaded', () => {
    // Set timer awal berdasarkan input default
    const initialMinutes = parseInt(focusMinInput.value) || 45;
    totalSeconds = initialMinutes * 60;
    renderTimer(totalSeconds);
    focusPointsDisplay.textContent = focusPoints;
    logMessage.textContent = "Atur misi dan tekan 'ATUR MISI' untuk memulai persiapan penerbangan.";
});
