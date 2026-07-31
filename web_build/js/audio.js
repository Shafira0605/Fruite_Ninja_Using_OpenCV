const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};

// Fungsi untuk memuat file audio dari server
async function loadAudio(name, url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioBuffers[name] = audioBuffer;
    } catch (e) {
        console.error("Gagal memuat audio:", name, e);
    }
}

// Fungsi untuk memutar suara
function playSound(name) {
    if (!audioBuffers[name]) return;
    
    // AudioContext butuh interaksi pengguna (gesture) sebelum bisa memutar suara
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffers[name];
    source.connect(audioCtx.destination);
    source.start(0);
}

// Memuat suara yang dibutuhkan (menggunakan file asli dari Python)
loadAudio('splat', 'assets/audio/Fruit Splat Score 01 Sound Effect 056561276 Nw Prev.wav');
loadAudio('bomb', 'assets/audio/bomb explosion sound.wav');
loadAudio('start', 'assets/audio/37. U I Game Start.mp3');
loadAudio('over', 'assets/audio/36. U I Game Over.mp3');
