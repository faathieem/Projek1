// ===================================================
// 1. Setup Variabel dan Elemen
// ===================================================
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const focusPointsDisplay = document.getElementById('focus-points');
const turbulenceStatus = document.getElementById('turbulence-status');
const logMessage = document.getElementById('log-message');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

const breakModal = document.getElementById('break-modal');
const breakChallengeText = document.getElementById('break-challenge-text');
const breakTimerDisplay = document.getElementById('break-timer');
const continueBtn = document.getElementById('continue-btn');

// Konstanta Waktu (45 menit fokus / 10 menit istirahat)
const FOCUS_DURATION_SEC = 45 * 60; 
const BREAK_DURATION_SEC = 10 * 60;

let totalSeconds = FOCUS_DURATION_SEC;
let intervalId;
let focusPoints = 0;
let isFocusSession = true; // Status: true = Fokus, false = Break
let isPaused = true;
let accuracyLog = 0; // Hitungan turbulensi

// ===================================================
// 2. Data Misi dan Challenge
// ===================================================
const missionName = "Menyelesaikan Bab Trigonometri";
document.getElementById('mission-display').textContent = Misi: ${missionName} (Tingkat: Berat);

const microBreakChallenges = [
    "1 menit peregangan leher dan bahu. Jauhkan mata dari layar!",
    "2 menit melihat ke luar jendela. Temukan 3 benda berwarna hijau.",
    "3 menit meditasi suara alam (tutup mata, dengarkan lingkunganmu).",
    "4 menit minum air putih sambil berjalan bolak-balik. Hindari ponsel!",
    "5 menit menggambar doodle konyol di kertas bekas."
];

// ===================================================
// 3. Fungsi Utama Timer
// ===================================================
function updateTimer() {
    if (totalSeconds <= 0) {
        clearInterval(intervalId);
        
        if (isFocusSession) {
            // Sesi Fokus Selesai (Langkah 5)
            startBreak();
        } else {
            // Sesi Break Selesai
            finishMission();
        }
        return;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
    breakTimerDisplay.textContent = ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')};

    if (isFocusSession) {
        // Tambah Poin Fokus (Langkah 4)
        focusPoints += 1; 
        focusPointsDisplay.textContent = focusPoints;
    }

    totalSeconds--;
}

// ===================================================
// 4. Deteksi Turbulensi (Keluar Tab/Jendela)
// ===================================================

// Fungsi yang dipanggil saat user meninggalkan tab (window.onblur)
function handleTurbulence() {
    if (!isPaused && isFocusSession) {
        // Hanya kurangi poin jika sedang fokus dan timer berjalan
        focusPoints -= 10; // Penalti keras untuk 'Turbulensi'!
        accuracyLog++;
        focusPointsDisplay.textContent = focusPoints;
        turbulenceStatus.textContent = "⚠️ TURBULENSI! Poin -10. Kembali ke Kokpit!";
        logMessage.textContent = Akurasi fokus berkurang. Total: ${accuracyLog} kali.;
        
        // Membunyikan suara peringatan (jika ada file audio)
        // const alarm = new Audio('alarm.mp3'); 
        // alarm.play(); 
    }
}

// Fungsi yang dipanggil saat user kembali ke tab (window.onfocus)
function handleStabilize() {
    if (!isPaused && isFocusSession) {
        turbulenceStatus.textContent = "Status: Stabil. Lanjutkan Misi.";
    }
}

// Hubungkan event ke window
window.addEventListener('blur', handleTurbulence);
window.addEventListener('focus', handleStabilize);


// ===================================================
// 5. Transisi & Laporan Misi
// ===================================================

// Mulai Sesi Fokus
function startMission() {
    if (isPaused) {
        // Mulai timer (1000ms = 1 detik)
        intervalId = setInterval(updateTimer, 1000); 
        logMessage.textContent = "TERBANG DIMULAI! Jaga Ketinggian Fokus.";
        isPaused = false;
        startBtn.disabled = true;
    }
}

// Mulai Sesi Istirahat (Langkah 5)
function startBreak() {
    isFocusSession = false;
    totalSeconds = BREAK_DURATION_SEC;
    
    // Tampilkan Modal Micro-Break
    breakModal.style.display = 'block';
    
    // Pilih Micro-Break Challenge acak
    const challenge = microBreakChallenges[Math.floor(Math.random() * microBreakChallenges.length)];
    breakChallengeText.textContent = challenge;
    
    logMessage.textContent = "Penting! Lakukan Micro-Break Challenge yang muncul di layar.";
    
    // Mulai timer istirahat
    intervalId = setInterval(updateTimer, 1000); 
}

// Sesi Break Selesai -> Reset untuk Misi Baru
function finishMission() {
    // Tampilkan Laporan Penerbangan (Langkah 6)
    const report = `
        Misi Selesai: ${missionName}
        Total Poin Fokus: ${focusPoints}
        Akurasi Fokus (Gagal Tab): ${accuracyLog} kali
        Lencana: ${accuracyLog <= 5 ? "Pilot Konsisten" : "Pilot Tangguh"}
    `;
    logMessage.innerHTML = <h3>✅ LAPORAN PENERBANGAN:</h3><pre>${report}</pre>;
    
    resetMission(false); // Reset tapi jangan hapus log
}

// Tombol Reset (MENDARAT)
function resetMission(fullReset = true) {
    clearInterval(intervalId);
    isPaused = true;
    isFocusSession = true;
    startBtn.disabled = false;
    breakModal.style.display = 'none'; // Tutup modal
    
    if (fullReset) {
        totalSeconds = FOCUS_DURATION_SEC;
        focusPoints = 0;
        accuracyLog = 0;
        focusPointsDisplay.textContent = 0;
        logMessage.textContent = "Misi Dibatalkan. Siap Lepas Landas Ulang.";
    }

    // Perbarui Tampilan
    minutesDisplay.textContent = '45';
    secondsDisplay.textContent = '00';
    turbulenceStatus.textContent = "Status: Stabil.";
}

// ===================================================
// 6. Event Listeners
// ===================================

startBtn.addEventListener('click', startMission);
resetBtn.addEventListener('click', () => resetMission(true));
continueBtn.addEventListener('click', () => {
    // Reset dan kembali ke kondisi awal fokus (jika ingin melanjutkan ke misi baru)
    resetMission(true); 
    logMessage.textContent = "Misi Baru Siap Diatur! (Sesi sebelumnya tercatat).";
});
