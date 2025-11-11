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


// Variabel Kontrol
let totalSeconds = 0;
let focusDurationSec = 0;
let breakDurationSec = 0;
let intervalId;
let focusPoints = 0;
let isFocusSession = true;
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
// 2. Fungsi Utama Timer
// ===================================================

// Mengupdate tampilan timer
function renderTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedTime = ${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')};
    
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(secs).padStart(2, '0');
    breakTimerDisplay.textContent = formattedTime; // Update timer di modal
}

// Logika hitungan mundur
function updateTimer() {
    if (totalSeconds <= 0) {
        clearInterval(intervalId);
        isRunning = false;
        
        if (isFocusSession) {
            startBreak();
        } else {
            // Break selesai
            continueBtn.disabled = false; // Aktifkan tombol LANJUTKAN MISI
            breakTimerDisplay.textContent = "00:00";
            statusDisplay.textContent = Status: ISTIRAHAT SELESAI. Tekan LANJUTKAN.;
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

// Fungsi menjalankan timer
function runTimer() {
    if (isRunning) return; // Mencegah multiple interval
    
    isRunning = true;
    intervalId = setInterval(updateTimer, 1000);
    logMessage.textContent = isFocusSession ? "TERBANG DIMULAI! Jaga Ketinggian Fokus." : "ISTIRAHAT DIMULAI!";
    
    startBtn.disabled = true;
    resetBtn.disabled = false;
}

// ===================================================
// 3. Transisi Sesi
// ===================================================

// Atur Misi Awal
function setupMission(event) {
    event.preventDefault(); // Mencegah form submission default
    
    currentTask = taskInput.value.trim();
    const focusMinutes = parseInt(focusMinInput.value);
    const breakMinutes = parseInt(breakMinInput.value);

    // Validasi dasar (HTML 'required' dan 'min' seharusnya sudah membantu)
    if (!currentTask || focusMinutes < 5 || breakMinutes < 1) {
        alert("Pilot, pastikan semua input terisi dengan benar!");
        return;
    }
    
    focusDurationSec = focusMinutes * 60;
    breakDurationSec = breakMinutes * 60;
    
    // Set sesi awal (Fokus)
    totalSeconds = focusDurationSec;
    isFocusSession = true;
    
    // Update Tampilan Misi
    missionDisplay.textContent = Misi: ${currentTask};
    statusDisplay.textContent = Status: SIAP TERBANG.;
    renderTimer(totalSeconds);
    
    // Kontrol UI
    startBtn.disabled = false; // Aktifkan tombol TERBANG
    resetBtn.disabled = true;
    logMessage.textContent = "Siap Lepas Landas! Tekan 'TERBANG' untuk memulai.";
    
    // Nonaktifkan pengaturan sampai misi di-reset/selesai
    taskInput.disabled = true;
    focusMinInput.disabled = true;
    breakMinInput.disabled = true;
    setupBtn.disabled = true;
}

// Mulai Sesi Istirahat
function startBreak() {
    isFocusSession = false;
    totalSeconds = breakDurationSec; 
    continueBtn.disabled = true; // Nonaktifkan tombol sampai break selesai

    // Tampilkan Modal Break
    breakModal.style.display = 'block';
    const challenge = microBreakChallenges[Math.floor(Math.random() * microBreakChallenges.length)];
    breakChallengeText.textContent = challenge;
    
    logMessage.textContent = "🛬 Waktunya Micro-Break. Lakukan challenge di modal!";
    
    // Mulai timer break
    runTimer();
}

// Laporan Penerbangan
function finishMission() {
    breakModal.style.display = 'none'; // Tutup break modal
    
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

// Tombol Reset (MENDARAT)
function resetMission(fullReset = true) {
    clearInterval(intervalId);
    isRunning = false;
    isFocusSession = true;

    startBtn.disabled = true;
    resetBtn.disabled = true;
    breakModal.style.display = 'none'; 
    reportModal.style.display = 'none';
    
    // Aktifkan kembali pengaturan
    taskInput.disabled = false;
    focusMinInput.disabled = false;
    breakMinInput.disabled = false;
    setupBtn.disabled = false;

    if (fullReset) {
        // Reset skor dan timer ke nilai input
        totalSeconds = focusMinInput.value * 60;
        focusPoints = 0;
        accuracyLog = 0;
        focusPointsDisplay.textContent = 0;
        missionDisplay.textContent = Misi: Belum diatur.;
        statusDisplay.textContent = "Status: Atur Misi & Siap Terbang.";
        logMessage.textContent = "Misi Dibatalkan. Siap Lepas Landas Ulang.";
    } else {
         // Reset setelah finish, siap untuk misi baru
        totalSeconds = focusMinInput.value * 60;
        focusPoints = 0;
        accuracyLog = 0;
        focusPointsDisplay.textContent = 0;
        missionDisplay.textContent = Misi: Belum diatur.;
        statusDisplay.textContent = "Status: Atur Misi & Siap Terbang.";
        logMessage.textContent = "Misi sebelumnya selesai. Atur Misi Baru.";
    }
    
    renderTimer(totalSeconds);
    turbulenceStatus.textContent = "Status: Stabil.";
}

// ===================================================
// 4. Logika Turbulensi (Window Focus)
// ===================================================

function handleTurbulence() {
    if (isRunning && isFocusSession) {
        focusPoints = Math.max(0, focusPoints - 10); // Pastikan poin tidak negatif
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
// 5. Event Listeners
// ===================================================
missionForm.addEventListener('submit', setupMission);
startBtn.addEventListener('click', runTimer);
resetBtn.addEventListener('click', () => resetMission(true));
continueBtn.addEventListener('click', finishMission);
closeReportBtn.addEventListener('click', () => {
    reportModal.style.display = 'none';
});

// Listener Turbulensi
window.addEventListener('blur', handleTurbulence);
window.addEventListener('focus', handleStabilize);

// Inisialisasi Tampilan Awal
renderTimer(parseInt(focusMinInput.value) * 60);
focusPointsDisplay.textContent = focusPoints;
