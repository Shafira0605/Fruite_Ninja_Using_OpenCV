const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');

function checkOrientation() {
    const orientationOverlay = document.getElementById('orientation-overlay');
    if (!orientationOverlay) return;

    // Cek jika layar dalam posisi Portrait (Tegak) dan ukuran layar HP/Tablet (lebar/tinggi <= 900px)
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = window.innerWidth <= 950 || window.innerHeight <= 950;

    if (isPortrait && isMobile) {
        orientationOverlay.style.display = 'flex';
    } else {
        orientationOverlay.style.display = 'none';
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    checkOrientation();
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 200);
});
resizeCanvas();

// P1 Biru, P2 Merah
const blade1 = new Blade('rgba(100, 200, 255, 0.6)');
const blade2 = new Blade('rgba(255, 100, 100, 0.6)');

let isPlaying = false;
let frameCount = 0;
let lastTime = performance.now();
let activeFruits = [];
let activeSplashes = [];
let activeComboTexts = [];

const fruitTypes = ['apple', 'banana', 'coconut', 'orange', 'pineapple', 'watermelon'];

function getFruitColor(type) {
    const colors = {
        'apple': '255, 0, 0',
        'banana': '255, 255, 0',
        'coconut': '255, 255, 255',
        'orange': '255, 165, 0',
        'pineapple': '255, 255, 0',
        'watermelon': '255, 0, 0'
    };
    return colors[type] || '255, 255, 255';
}

function startGameLoop() {
    if (!isPlaying) {
        isPlaying = true;
        lastTime = performance.now();
        gameLoop();
    }
}

function checkMenuInteraction(blade, stateToTrigger) {
    if (blade.velocity > 15 && blade.history.length > 0) {
        const head = blade.history[0];

        if (ui.state === "WELCOME") {
            if (head.y > canvas.height / 2 - 150 && head.y < canvas.height / 2 + 150) {
                ui.state = "MODE_SELECT";
                playSound('start');
                blade.history = [];
                return true;
            }
        }
        else if (ui.state === "MODE_SELECT") {
            const s = ui.getScale(canvas.width, canvas.height);

            // Cek Hitbox Tombol BACK (x: 20*s to 150*s, y: canvas.height - 75*s to -27*s)
            if (head.x > 20 * s && head.x < 150 * s &&
                head.y > canvas.height - 75 * s && head.y < canvas.height - 27 * s) {
                ui.state = "WELCOME";
                playSound('splat');
                blade.history = [];
                return true;
            }

            // Cek Hitbox 1 PLAYER (canvasWidth / 4 - 110 to +110, y: -40 to +20)
            if (head.x > canvas.width / 4 - 110 * s && head.x < canvas.width / 4 + 110 * s &&
                head.y > canvas.height / 2 - 40 * s && head.y < canvas.height / 2 + 20 * s) {
                ui.mode = "1P";
                ui.state = "DIFFICULTY_SELECT";
                playSound('splat');
                blade.history = [];
                return true;
            }
            // Cek Hitbox 2 PLAYERS ((canvasWidth / 4) * 3 - 120 to +120, y: -40 to +20)
            else if (head.x > (canvas.width / 4) * 3 - 120 * s && head.x < (canvas.width / 4) * 3 + 120 * s &&
                head.y > canvas.height / 2 - 40 * s && head.y < canvas.height / 2 + 20 * s) {
                ui.mode = "2P";
                ui.state = "DIFFICULTY_SELECT";
                playSound('splat');
                blade.history = [];
                return true;
            }
        }
        else if (ui.state === "DIFFICULTY_SELECT") {
            const s = ui.getScale(canvas.width, canvas.height);

            // Cek Hitbox Tombol BACK (x: 20*s to 150*s, y: canvas.height - 75*s to -27*s)
            if (head.x > 20 * s && head.x < 150 * s &&
                head.y > canvas.height - 75 * s && head.y < canvas.height - 27 * s) {
                ui.state = "MODE_SELECT";
                playSound('splat');
                blade.history = [];
                return true;
            }

            let selectedDiff = null;

            // EASY (canvasWidth / 4 - 80 to +80, y: -40 to +20)
            if (head.x > canvas.width / 4 - 80 * s && head.x < canvas.width / 4 + 80 * s &&
                head.y > canvas.height / 2 - 40 * s && head.y < canvas.height / 2 + 20 * s) {
                selectedDiff = "Easy";
            }
            // MEDIUM (canvasWidth / 2 - 90 to +90, y: -40 to +20)
            else if (head.x > canvas.width / 2 - 90 * s && head.x < canvas.width / 2 + 90 * s &&
                head.y > canvas.height / 2 - 40 * s && head.y < canvas.height / 2 + 20 * s) {
                selectedDiff = "Medium";
            }
            // HARD ((canvasWidth / 4) * 3 - 80 to +80, y: -40 to +20)
            else if (head.x > (canvas.width / 4) * 3 - 80 * s && head.x < (canvas.width / 4) * 3 + 80 * s &&
                head.y > canvas.height / 2 - 40 * s && head.y < canvas.height / 2 + 20 * s) {
                selectedDiff = "Hard";
            }

            if (selectedDiff) {
                ui.difficulty = selectedDiff;

                // Mulai Game!
                ui.state = ui.mode === "1P" ? "GAME_1P" : "GAME_2P";
                ui.score1 = 0;
                ui.score2 = 0;
                ui.totalScore1 = 0;
                ui.totalScore2 = 0;
                ui.lives1 = 3;
                ui.lives2 = 3;
                ui.timeLeft = 30;
                ui.currentRound = 1;
                ui.roundWins1 = 0;
                ui.roundWins2 = 0;
                ui.isNewHighScore = false;
                frameCount = 0; // Reset waktu game agar spawn rate mulai dari lambat
                activeFruits = [];
                activeSplashes = [];
                activeComboTexts = [];
                playSound('start');
                blade.history = [];
                return true;
            }
        }
        else if (ui.state === "OVER_1P" || ui.state === "WINNER_2P") {
            // Tombol hanya bisa ditebas jika sudah lewat 5 detik
            if (ui.resultTimer >= 5) {
                // Hitbox tombol SLASH TO CONTINUE (canvas.width/2 - 140 to +140, y: canvas.height/2 + 75 to +125)
                if (head.x > canvas.width / 2 - 140 && head.x < canvas.width / 2 + 140 &&
                    head.y > canvas.height / 2 + 75 && head.y < canvas.height / 2 + 125) {
                    ui.state = "WELCOME";
                    ui.resultTimer = 0;
                    playSound('start');
                    blade.history = [];
                    return true;
                }
            }
        }
    }
    return false;
}

function getDifficultySettings() {
    if (ui.difficulty === "Easy") return { spawnRate: 70, bombChance: 0.05 };
    if (ui.difficulty === "Medium") return { spawnRate: 50, bombChance: 0.15 };
    if (ui.difficulty === "Hard") return { spawnRate: 30, bombChance: 0.25 };
    return { spawnRate: 50, bombChance: 0.15 };
}

function end2PRound(reason) {
    let roundWinner = null;

    if (reason === 'bomb') {
        if (ui.lives1 <= 0 && ui.lives2 > 0) roundWinner = 2;
        else if (ui.lives2 <= 0 && ui.lives1 > 0) roundWinner = 1;
        else roundWinner = 0;
    } else if (reason === 'timer') {
        if (ui.score1 > ui.score2) roundWinner = 1;
        else if (ui.score2 > ui.score1) roundWinner = 2;
        else roundWinner = 0;
    }

    if (roundWinner === 1) {
        ui.roundWins1++;
        ui.roundWinnerText = `PLAYER 1 WINS ROUND ${ui.currentRound}!`;
        ui.roundWinnerColor = "cyan";
    } else if (roundWinner === 2) {
        ui.roundWins2++;
        ui.roundWinnerText = `PLAYER 2 WINS ROUND ${ui.currentRound}!`;
        ui.roundWinnerColor = "lightcoral";
    } else {
        ui.roundWinnerText = `ROUND ${ui.currentRound} TIED!`;
        ui.roundWinnerColor = "yellow";
    }

    // Accumulate total skor kumulatif
    ui.totalScore1 += ui.score1;
    ui.totalScore2 += ui.score2;

    // Cek apakah pertandingan (Best of 3) sudah selesai
    if (ui.roundWins1 >= 2 || ui.roundWins2 >= 2 || ui.currentRound >= 3) {
        ui.state = "WINNER_2P";
        ui.resultTimer = 0;
        playSound('over');
    } else {
        ui.state = "ROUND_TRANSITION";
        ui.roundTransitionTimer = 0;
        playSound('splat');
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    // Kalkulasi Waktu (Delta Time)
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // GAMBAR KAMERA
    if (window.currentVideoFrame) {
        const canvasRatio = canvas.width / canvas.height;
        const videoRatio = window.currentVideoFrame.width / window.currentVideoFrame.height;

        if (canvasRatio > videoRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / videoRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * videoRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(window.currentVideoFrame, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
    }

    // UPDATE POSISI PEDANG DARI DETEKSI TANGAN
    let p1Detected = false;
    let p2Detected = false;

    if (window.currentHandsLandmarks && window.currentHandsLandmarks.length > 0) {
        window.currentHandsLandmarks.forEach(landmarks => {
            const indexFinger = landmarks[8];
            const x = canvas.width - (offsetX + (indexFinger.x * drawWidth));
            const y = offsetY + (indexFinger.y * drawHeight);

            // Logika Pembagian Layar: Kiri P1, Kanan P2
            if (ui.mode === "2P" || ui.state !== "GAME_1P") {
                if (x < canvas.width / 2) {
                    blade1.update(x, y);
                    p1Detected = true;
                } else {
                    blade2.update(x, y);
                    p2Detected = true;
                }
            } else {
                // Di mode 1P, tangan manapun jadi blade1
                blade1.update(x, y);
                p1Detected = true;
            }
        });
    }

    if (!p1Detected) blade1.fade();
    if (!p2Detected) blade2.fade();

    // STATE MESIN GAME (UI & LOGIC)
    if (ui.state === "WELCOME" || ui.state === "MODE_SELECT" || ui.state === "DIFFICULTY_SELECT") {
        ui.draw(ctx, canvas.width, canvas.height);
        checkMenuInteraction(blade1);
        checkMenuInteraction(blade2);
    }
    else if (ui.state === "GAME_1P" || ui.state === "GAME_2P") {
        frameCount++;

        if (ui.state === "GAME_2P") {
            ui.timeLeft -= dt;
            if (ui.timeLeft <= 0) {
                end2PRound('timer');
            }
        }

        const diff = getDifficultySettings();

        // Buat frekuensi bertahap: Dari detik ke-0 langsung cepat dan rame
        let spawnRate;
        let randomChance;
        if (frameCount < 300) {
            spawnRate = Math.max(25, diff.spawnRate - 15); // ~0.5 - 0.7 detik sekali
            randomChance = 0.02;
        } else {
            let extraSpeed = Math.floor((frameCount - 300) / 60) * 2;
            spawnRate = Math.max(12, diff.spawnRate - extraSpeed);
            randomChance = Math.min(0.04, 0.015 + (Math.floor((frameCount - 300) / 300) * 0.005));
        }

        // Memunculkan Buah (Instant burst saat frame === 1)
        const isInstantSpawn = (frameCount === 1);
        if (isInstantSpawn || frameCount % spawnRate === 0 || Math.random() < randomChance) {
            let spawnY = canvas.height + 50;

            if (ui.mode === "2P") {
                // Munculkan di area Kiri (P1)
                let spawnX1 = Math.random() * (canvas.width / 2 - 150) + 75;
                if (!isInstantSpawn && Math.random() < diff.bombChance) {
                    activeFruits.push(new Bomb(spawnX1, spawnY));
                } else {
                    activeFruits.push(new Fruit(spawnX1, spawnY, fruitTypes[Math.floor(Math.random() * fruitTypes.length)]));
                }

                // Munculkan di area Kanan (P2)
                let spawnX2 = (canvas.width / 2) + Math.random() * (canvas.width / 2 - 150) + 75;
                if (!isInstantSpawn && Math.random() < diff.bombChance) {
                    activeFruits.push(new Bomb(spawnX2, spawnY));
                } else {
                    activeFruits.push(new Fruit(spawnX2, spawnY, fruitTypes[Math.floor(Math.random() * fruitTypes.length)]));
                }

                // Jika Instant Spawn saat baru masuk ronde, langsung tambah 1 pasang ekstra!
                if (isInstantSpawn) {
                    let extraX1 = Math.random() * (canvas.width / 2 - 150) + 75;
                    let extraX2 = (canvas.width / 2) + Math.random() * (canvas.width / 2 - 150) + 75;
                    activeFruits.push(new Fruit(extraX1, spawnY + 60, fruitTypes[Math.floor(Math.random() * fruitTypes.length)]));
                    activeFruits.push(new Fruit(extraX2, spawnY + 60, fruitTypes[Math.floor(Math.random() * fruitTypes.length)]));
                }
            } else {
                // Mode 1P: Munculkan acak di seluruh layar
                let spawnX = Math.random() * (canvas.width - 200) + 100;
                if (!isInstantSpawn && Math.random() < diff.bombChance) {
                    activeFruits.push(new Bomb(spawnX, spawnY));
                } else {
                    let type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
                    activeFruits.push(new Fruit(spawnX, spawnY, type));
                }

                if (isInstantSpawn) {
                    let extraX1 = Math.random() * (canvas.width - 200) + 100;
                    let extraX2 = Math.random() * (canvas.width - 200) + 100;
                    activeFruits.push(new Fruit(extraX1, spawnY + 50, fruitTypes[Math.floor(Math.random() * fruitTypes.length)]));
                    activeFruits.push(new Fruit(extraX2, spawnY + 100, fruitTypes[Math.floor(Math.random() * fruitTypes.length)]));
                }
            }
        }

        // Tracking combo per frame
        let p1SlicedCount = 0;
        let p2SlicedCount = 0;
        let p1SumX = 0, p1SumY = 0;
        let p2SumX = 0, p2SumY = 0;

        // Mengecek Tebasan dan Update Buah
        for (let i = activeFruits.length - 1; i >= 0; i--) {
            let f = activeFruits[i];

            let slicedBy = null;
            let sliceVel = 0;

            if (f.checkSlice) {
                if (f.checkSlice(blade1)) { slicedBy = 1; sliceVel = blade1.velocity; }
                else if (f.checkSlice(blade2)) { slicedBy = 2; sliceVel = blade2.velocity; }
            }

            if (slicedBy !== null) {
                if (f.type === 'bomb') {
                    playSound('bomb');
                    ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    if (slicedBy === 1) ui.lives1--;
                    if (slicedBy === 2) ui.lives2--;

                    activeFruits.splice(i, 1);

                    // Cek kekalahan
                    if (ui.state === "GAME_1P" && ui.lives1 <= 0) {
                        ui.state = "OVER_1P";
                        ui.resultTimer = 0;
                        playSound('over');
                    } else if (ui.state === "GAME_2P" && (ui.lives1 <= 0 || ui.lives2 <= 0)) {
                        end2PRound('bomb');
                    }
                    continue;
                } else {
                    playSound('splat');
                    if (slicedBy === 1) {
                        ui.score1++;
                        p1SlicedCount++;
                        p1SumX += f.x;
                        p1SumY += f.y;
                    }
                    if (slicedBy === 2) {
                        ui.score2++;
                        p2SlicedCount++;
                        p2SumX += f.x;
                        p2SumY += f.y;
                    }

                    activeFruits.push(new SlicedFruit(f.x, f.y, f.type, -1, sliceVel));
                    activeFruits.push(new SlicedFruit(f.x, f.y, f.type, 1, sliceVel));
                    activeSplashes.push(new Splash(f.x, f.y, getFruitColor(f.type)));
                    activeFruits.splice(i, 1);
                    continue;
                }
            }

            f.update();

            // Dinding pembatas di tengah untuk mode 2P (agar buah tidak nyebrang)
            if (ui.mode === "2P") {
                const centerLine = canvas.width / 2;
                if (f.x < centerLine && f.x + (f.size / 2) > centerLine) {
                    f.x = centerLine - (f.size / 2);
                    f.vx = -Math.abs(f.vx);
                }
                else if (f.x >= centerLine && f.x - (f.size / 2) < centerLine) {
                    f.x = centerLine + (f.size / 2);
                    f.vx = Math.abs(f.vx);
                }
            }

            // Dinding pembatas layar Kiri dan Kanan (agar buah tidak hilang ke luar layar)
            if (f.x - (f.size / 2) < 0) {
                f.x = f.size / 2;
                f.vx = Math.abs(f.vx);
            } else if (f.x + (f.size / 2) > canvas.width) {
                f.x = canvas.width - (f.size / 2);
                f.vx = -Math.abs(f.vx);
            }

            f.draw(ctx);

            // Hapus yang lewat layar
            if (f.y > canvas.height + 150) {
                activeFruits.splice(i, 1);
            }
        }

        // Cek Combo Player 1 (Minimal 2 Buah)
        if (p1SlicedCount >= 2) {
            let avgX = p1SumX / p1SlicedCount;
            let avgY = p1SumY / p1SlicedCount;
            ui.score1 += p1SlicedCount; // Bonus skor combo
            activeComboTexts.push(new ComboText(avgX, avgY, `${p1SlicedCount}x COMBO!`, 'cyan'));
        }

        // Cek Combo Player 2 (Minimal 2 Buah)
        if (p2SlicedCount >= 2) {
            let avgX = p2SumX / p2SlicedCount;
            let avgY = p2SumY / p2SlicedCount;
            ui.score2 += p2SlicedCount; // Bonus skor combo
            activeComboTexts.push(new ComboText(avgX, avgY, `${p2SlicedCount}x COMBO!`, 'lightcoral'));
        }

        for (let i = activeSplashes.length - 1; i >= 0; i--) {
            let s = activeSplashes[i];
            s.update();
            s.draw(ctx);
            if (s.particles.length === 0) activeSplashes.splice(i, 1);
        }

        for (let i = activeComboTexts.length - 1; i >= 0; i--) {
            let c = activeComboTexts[i];
            c.update();
            c.draw(ctx);
            if (c.alpha <= 0) activeComboTexts.splice(i, 1);
        }

        ui.draw(ctx, canvas.width, canvas.height);
    } 
    else if (ui.state === "ROUND_TRANSITION") {
        ui.roundTransitionTimer += dt;
        ui.draw(ctx, canvas.width, canvas.height);
        
        if (ui.roundTransitionTimer >= 3) {
            ui.currentRound++;
            ui.timeLeft = 30;
            ui.lives1 = 3;
            ui.lives2 = 3;
            ui.score1 = 0;
            ui.score2 = 0;
            frameCount = 0;
            activeFruits = [];
            activeSplashes = [];
            activeComboTexts = [];
            ui.state = "GAME_2P";
            playSound('start');
        }
    }
    else if (ui.state === "OVER_1P" || ui.state === "WINNER_2P") {
        ui.resultTimer += dt;
        ui.draw(ctx, canvas.width, canvas.height);
        checkMenuInteraction(blade1);
        checkMenuInteraction(blade2);
    }

    blade1.draw(ctx);
    if (ui.mode === "2P" || ui.state !== "GAME_1P") {
        blade2.draw(ctx);
    }

    requestAnimationFrame(gameLoop);
}
