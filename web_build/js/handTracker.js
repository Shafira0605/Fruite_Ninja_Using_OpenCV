const videoElement = document.getElementById('input_video');
const loadingText = document.getElementById('loading');

// Variabel global untuk menyimpan data dari kamera agar bisa dibaca oleh game.js
window.currentVideoFrame = null;
window.currentHandsLandmarks = null;

// Deteksi apakah perangkat Mobile / HP
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 900;

// Inisialisasi MediaPipe Hands
const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 2, // Mengizinkan deteksi hingga 2 tangan sekaligus
  modelComplexity: isMobileDevice ? 0 : 1, // Model 0 untuk HP agar loading super cepat (60 FPS)
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

// Callback saat deteksi tangan berhasil
hands.onResults(onResults);

function hideLoadingScreen() {
  if (loadingText && !loadingText.classList.contains('fade-out')) {
      loadingText.classList.add('fade-out');
      setTimeout(() => {
          loadingText.style.display = 'none';
      }, 400);
      
      // Memicu game loop untuk pertama kali saat kamera sudah siap
      if (typeof startGameLoop === 'function') {
          startGameLoop();
      }
  }
}

function onResults(results) {
  hideLoadingScreen();

  // Simpan frame video saat ini
  window.currentVideoFrame = results.image;
  
  // Simpan posisi landmark SEMUA tangan jika terdeteksi
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      window.currentHandsLandmarks = results.multiHandLandmarks; 
  } else {
      window.currentHandsLandmarks = null; 
  }
}

// Inisialisasi dan jalankan Kamera (Instant getUserMedia Permission Prompt)
async function startCamera() {
    try {
        const constraints = {
            video: {
                facingMode: 'user',
                width: { ideal: isMobileDevice ? 854 : 1280 },
                height: { ideal: isMobileDevice ? 480 : 720 }
            },
            audio: false
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        await videoElement.play();

        let isProcessing = false;
        async function processFrame() {
            if (videoElement.readyState >= 2 && !isProcessing) {
                isProcessing = true;
                await hands.send({ image: videoElement });
                isProcessing = false;
            }
            requestAnimationFrame(processFrame);
        }
        processFrame();
    } catch (err) {
        console.warn("Falling back to MediaPipe CameraUtils:", err);
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: isMobileDevice ? 854 : 1280,
            height: isMobileDevice ? 480 : 720
        });
        camera.start();
    }
}

startCamera();
