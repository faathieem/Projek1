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

// Modal dan Kontrol Break/Report
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
let isFocusSession = true; 
let isRunning = false;
let accuracyLog = 0; 
let currentTask = "";

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

function renderTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedTime = ${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')};
    
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(secs).padStart(2, '0');
    breakTimerDisplay.textContent = formattedTime; 
}

function updateTimer() {
    if (totalSeconds <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        isRunning = false;
        
        if (isFocusSession) {
            startBreak(); 
        } else {
            continueBtn.disabled = false; 
            breakTimerDisplay.textContent = "00:00";
            statusDisplay.textContent = Status: ISTIRAHAT SELESAI. Tekan LANJUTKAN.;
            logMessage.textContent = "Tekan LANJUTKAN MISI untuk melihat Laporan Penerbangan.";
        }
        return;
    }
    
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

function runTimer() {
    if (isRunning || !currentTask) return; 

    isRunning = true;
    intervalId = setInterval(updateTimer, 1000);
    logMessage.textContent = isFocusSession ? "TERBANG DIMULAI! Jaga Ketinggian Fokus." : "ISTIRAHAT DIMULAI!";
    
    startBtn.disabled = true;
    resetBtn.disabled = false;
}

// ===================================================
// 3. Kontrol Misi (Setup, Transisi, Reset)
// ===================================================

/**
 * 🔥 PERBAIKAN FUNGSI KRITIS: setupMission 🔥
 * Memastikan validasi dan update UI berjalan sempurna.
 */
function setupMission(event) {
    // 1. MENCEGAH REFRESH HALAMAN (Penting!)
    event.preventDefault(); 
    
    const inputTask = taskInput.value.trim();
    const focusMinutes = parseInt(focusMinInput.value);
    const breakMinutes = parseInt(breakMinInput.value);

    // 2. VALIDASI YANG LEBIH JELAS
    if (!inputTask) {
        alert("Pilot, harap isi Nama Tugas yang akan dikerjakan.");
        return;
    }
    if (focusMinutes < 5 || isNaN(focusMinutes)) {
        alert("Pilot, durasi Fokus harus minimal 5 menit.");
        return;
    }
    if (breakMinutes < 1 || isNaN(breakMinutes)) {
        alert("Pilot, durasi Istirahat harus minimal 1 menit.");
        return;
    }
    
    // 3. SET VARIABEL GLOBAL
    currentTask = inputTask;
    focusDurationSec = focusMinutes * 60;
    breakDurationSec = breakMinutes * 60;
    
    // Set Sesi Awal (Fokus)
    totalSeconds = focusDurationSec;
    isFocusSession = true;
    
    // 4. UPDATE TAMPILAN
    missionDisplay.textContent = Misi: ${currentTask};
    statusDisplay.textContent = Status: SIAP TERBANG.;
    renderTimer(totalSeconds);
    
    // 5. KONTROL UI DAN INPUT
    startBtn.disabled = false; // AKTIFKAN TOMBOL TERBANG
    resetBtn.disabled = false;
    logMessage.textContent = "Siap Lepas Landas! Tekan 'TERBANG' untuk memulai.";
    
    taskInput.disabled = true;
    focusMinInput.disabled = true;
    breakMinInput.disabled = true;
    setupBtn.disabled = true;
}

function startBreak() {
    isFocusSession = false;
    totalSeconds = breakDurationSec; 
    
    breakModal.style.display = 'block';
    const challenge = microBreakChallenges[Math.floor(Math.random() * microBreakChallenges.length)];
    breakChallengeText.textContent = challenge;
    
    logMessage.textContent = "🛬 Waktunya Micro-Break. Lakukan challenge di modal!";
    
    runTimer();
}

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

    // Reset status tanpa menghapus log/report
    resetMission(false); 
}

function resetMission(fullReset = true) {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    
    isRunning = false;
    isFocusSession = true;

    taskInput.disabled = false;
    focusMinInput.disabled = false;
    breakMinInput.disabled = false;
    setupBtn.disabled = false;

    breakModal.style.display = 'none'; 
    
    focusPoints = 0;
    accuracyLog = 0;
    focusPointsDisplay.textContent = 0;
    turbulenceStatus.textContent = "Status: Stabil.";
    
    if (fullReset) {
        currentTask = "";
        totalSeconds = parseInt(focusMinInput.value) * 60;
        missionDisplay.textContent = Misi: Belum diatur.;
        statusDisplay.textContent = "Status: Atur Misi & Siap Terbang.";
        logMessage.textContent = "Misi Dibatalkan. Atur misi baru.";
        
        startBtn.disabled = true;
        resetBtn.disabled = false; 
    } else {
        totalSeconds = parseInt(focusMinInput.value) * 60;
        missionDisplay.textContent = Misi: Belum diatur.;
        statusDisplay.textContent = "Status: Atur Misi & Siap Terbang.";
        logMessage.textContent = "Tekan TUTUP LAPORAN untuk mengatur Misi Baru.";
        
        startBtn.disabled = true;
        resetBtn.disabled = true;
    }
    
    renderTimer(totalSeconds);
}

// ===================================================
// 4. Logika Turbulensi (Window Focus/Blur)
// ===================================================

function handleTurbulence() {
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

// PASTIKAN MISSION FORM DITEMUKAN DAN LISTENER SUBMIT DITAMBAHKAN
if (missionForm) {
    missionForm.addEventListener('submit', setupMission);
} else {
    console.error("Elemen FORM dengan ID 'mission-form' tidak ditemukan.");
}

startBtn.addEventListener('click', runTimer);

resetBtn.addEventListener('click', () => {
    if (isRunning) {
        if (confirm("Misi sedang berjalan. Apakah Anda yakin ingin MENDARAT (Batal)?")) {
            resetMission(true);
        }
    } else {
        // Jika diklik saat misi siap tapi belum terbang
        resetMission(true);
    }
});

continueBtn.addEventListener('click', finishMission);

closeReportBtn.addEventListener('click', () => {
    reportModal.style.display = 'none';
    resetMission(true); // Reset total setelah laporan ditutup
});

window.addEventListener('blur', handleTurbulence);
window.addEventListener('focus', handleStabilize);

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi awal UI
    const initialMinutes = parseInt(focusMinInput.value) || 45;
    totalSeconds = initialMinutes * 60;
    renderTimer(totalSeconds);
    focusPointsDisplay.textContent = focusPoints;
    logMessage.textContent = "Atur misi dan tekan 'ATUR MISI' untuk memulai persiapan penerbangan.";
    // Pastikan tombol terbang dinonaktifkan di awal
    startBtn.disabled = true; 
});
