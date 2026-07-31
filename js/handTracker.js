const videoElement = document.getElementById('input_video');
const loadingText = document.getElementById('loading');

// Variabel global untuk menyimpan data dari kamera agar bisa dibaca oleh game.js
window.currentVideoFrame = null;
window.currentHandLandmarks = null;

// Inisialisasi MediaPipe Hands
const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 2, // Mengizinkan deteksi hingga 2 tangan sekaligus
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// Callback saat deteksi tangan berhasil
hands.onResults(onResults);

function onResults(results) {
  // Sembunyikan tulisan loading setelah kamera/deteksi berjalan
  if (loadingText && !loadingText.classList.contains('fade-out')) {
      loadingText.classList.add('fade-out');
      setTimeout(() => {
          loadingText.style.display = 'none';
      }, 500);
      
      // Memicu game loop untuk pertama kali saat kamera sudah siap
      if (typeof startGameLoop === 'function') {
          startGameLoop();
      }
  }

  // Simpan frame video saat ini
  window.currentVideoFrame = results.image;
  
  // Simpan posisi landmark SEMUA tangan jika terdeteksi
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      window.currentHandsLandmarks = results.multiHandLandmarks; 
  } else {
      window.currentHandsLandmarks = null; 
  }
}

// Inisialisasi dan jalankan Kamera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    // Kirim setiap frame video ke MediaPipe untuk dianalisis
    await hands.send({image: videoElement});
  },
  width: 1280, // Ubah ke 16:9 agar pas dengan layar monitor tanpa harus di-crop
  height: 720
});

camera.start();
