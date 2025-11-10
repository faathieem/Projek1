// ===================================================
// 1. Setup Variabel dan Elemen (Termasuk Input Baru)
// ===================================================
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const focusPointsDisplay = document.getElementById('focus-points');
const turbulenceStatus = document.getElementById('turbulence-status');
const logMessage = document.getElementById('log-message');
const statusDisplay = document.getElementById('status-display'); // Elemen Status Baru
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

// Input Formulir Misi Baru
const taskInput = document.getElementById('task-input');
const focusMinInput = document.getElementById('focus-min-input');
const breakMinInput = document.getElementById('break-min-input');
const missionDisplay = document.getElementById('mission-display');

const breakModal = document.getElementById('break-modal');
const breakChallengeText = document.getElementById('break-challenge-text');
const breakTimerDisplay = document.getElementById('break-timer');
const continueBtn = document.getElementById('continue-btn');

// Variabel Kontrol
let totalSeconds = 0;
let focusDurationSec = 0;
let breakDurationSec = 0;
let intervalId;
let focusPoints = 0;
let isFocusSession = true; // Status: true = Fokus, false = Break
let isPaused = true;
let accuracyLog = 0; // Hitungan turbulensi

// Data Misi dan Challenge
const microBreakChallenges = [
    "1 menit peregangan leher dan bahu. Jauhkan mata dari layar!",
    "2 menit melihat ke luar jendela. Temukan 3 benda berwarna hijau.",
    "3 menit meditasi suara alam (tutup mata, dengarkan lingkunganmu).",
    "4 menit minum air putih sambil berjalan bolak-balik. Hindari ponsel!",
    "5 menit menggambar doodle konyol di kertas bekas."
];

// Inisialisasi Tampilan Awal
missionDisplay.textContent = Misi: Belum diatur.;
statusDisplay.textContent = Status: Masukkan data misi.;
minutesDisplay.textContent = String(focusMinInput.value).padStart(2, '0');
secondsDisplay.textContent = '00';


// ===================================================
// 2. Fungsi Utama Timer (Tidak Berubah)
// ===================================================
function updateTimer() {
    if (totalSeconds <= 0) {
        clearInterval(intervalId);
        
        if (isFocusSession) {
            // Sesi Fokus Selesai -> Mulai Break
            startBreak();
        } else {
            // Sesi Break Selesai -> Selesaikan Misi
            finishMission();
        }
        return;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Update tampilan timer utama dan timer break
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
    breakTimerDisplay.textContent = ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')};

    if (isFocusSession) {
        focusPoints += 1; // Tambah Poin Fokus
        focusPointsDisplay.textContent = focusPoints;
        statusDisplay.textContent = Status: FOKUS! (${minutes}m tersisa); // Update Status
    } else {
        statusDisplay.textContent = Status: ISTIRAHAT (${minutes}m tersisa); // Update Status Break
    }

    totalSeconds--;
}

// ... (Fungsi handleTurbulence dan handleStabilize sama persis) ...
function handleTurbulence() {
    if (!isPaused && isFocusSession) {
        focusPoints -= 10; 
        accuracyLog++;
        focusPointsDisplay.textContent = focusPoints;
        turbulenceStatus.textContent = "⚠️ TURBULENSI! Poin -10. Kembali ke Kokpit!";
        logMessage.textContent = Akurasi fokus berkurang. Total: ${accuracyLog} kali.;
    }
}
function handleStabilize() {
    if (!isPaused && isFocusSession) {
        turbulenceStatus.textContent = "Status: Stabil. Lanjutkan Misi.";
    }
}
window.addEventListener('blur', handleTurbulence);
window.addEventListener('focus', handleStabilize);


// ===================================================
// 3. Transisi & Laporan Misi (Logika Baru di startMission)
// ===================================================

// Fungsi untuk menyiapkan dan memulai sesi fokus
function startMission() {
    const task = taskInput.value.trim();
    const focusMinutes = parseInt(focusMinInput.value);
    const breakMinutes = parseInt(breakMinInput.value);

    // Validasi input
    if (task === "" || focusMinutes < 5 || breakMinutes < 1) {
        alert("Pilot, pastikan Nama Tugas dan Durasi waktu fokus/istirahat terisi dengan benar!");
        return;
    }

    // Atur Waktu Fokus dan Break dari Input
    focusDurationSec = focusMinutes * 60;
    breakDurationSec = breakMinutes * 60;
    totalSeconds = focusDurationSec;
    
    // Update Tampilan Misi
    missionDisplay.textContent = Misi: ${task};
    statusDisplay.textContent = Status: Siap diaktifkan.;
    minutesDisplay.textContent = String(focusMinutes).padStart(2, '0');
    secondsDisplay.textContent = '00';
    
    // Mulai Timer
    if (isPaused) {
        intervalId = setInterval(updateTimer, 1000); 
        logMessage.textContent = "TERBANG DIMULAI! Jaga Ketinggian Fokus.";
        isPaused = false;
        startBtn.disabled = true;
        resetBtn.disabled = false; // Aktifkan tombol MENDARAT
        
        // Nonaktifkan pengaturan selama misi berjalan
        taskInput.disabled = true;
        focusMinInput.disabled = true;
        breakMinInput.disabled = true;
    }
}

// Mulai Sesi Istirahat
function startBreak() {
    isFocusSession = false;
    totalSeconds = breakDurationSec; // Gunakan durasi break dari input
    
    breakModal.style.display = 'block';
    const challenge = microBreakChallenges[Math.floor(Math.random() * microBreakChallenges.length)];
    breakChallengeText.textContent = challenge;
    
    logMessage.textContent = "Penting! Lakukan Micro-Break Challenge yang muncul di layar.";
    
    intervalId = setInterval(updateTimer, 1000); 
}

// Sesi Break Selesai -> Reset untuk Misi Baru
function finishMission() {
    // Ambil data tugas terakhir
    const finalTask = missionDisplay.textContent.replace('Misi: ', '');
    
    const report = `
        Misi Selesai: ${finalTask}
        Durasi Fokus: ${focusDurationSec / 60} Menit
        Total Poin Fokus: ${focusPoints}
        Akurasi Fokus (Gagal Tab): ${accuracyLog} kali
        Lencana: ${accuracyLog <= 5 ? "Pilot Konsisten" : "Pilot Tangguh"}
    `;
    logMessage.innerHTML = <h3>✅ LAPORAN PENERBANGAN:</h3><pre>${report}</pre>;
    
    resetMission(false); // Reset visual, jangan hapus log
}

// Tombol Reset (MENDARAT)
function resetMission(fullReset = true) {
    clearInterval(intervalId);
    isPaused = true;
    isFocusSession = true;
    startBtn.disabled = false;
    resetBtn.disabled = true;
    breakModal.style.display = 'none'; 
    
    // Aktifkan kembali pengaturan
    taskInput.disabled = false;
    focusMinInput.disabled = false;
    breakMinInput.disabled = false;
    
    if (fullReset) {
        // Reset skor dan timer ke nilai input
        totalSeconds = focusMinInput.value * 60;
        focusPoints = 0;
        accuracyLog = 0;
        focusPointsDisplay.textContent = 0;
        minutesDisplay.textContent = String(focusMinInput.value).padStart(2, '0');
        secondsDisplay.textContent = '00';
        logMessage.textContent = "Misi Dibatalkan. Siap Lepas Landas Ulang.";
        missionDisplay.textContent = Misi: ${taskInput.value.trim() || 'Belum diatur.'};
        statusDisplay.textContent = "Status: Siap diaktifkan.";
    }
    turbulenceStatus.textContent = "Status: Stabil.";
}

// ===================================================
// 4. Event Listeners
// ===================================
startBtn.addEventListener('click', startMission);
resetBtn.addEventListener('click', () => resetMission(true));
continueBtn.addEventListener('click', () => {
    // Ketika Micro-Break selesai, tampilkan laporan dan reset
    finishMission();
});
