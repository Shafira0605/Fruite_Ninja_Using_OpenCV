class UI {
    constructor() {
        this.state = "WELCOME";
        this.score1 = 0;
        this.score2 = 0;
        this.lives1 = 3;
        this.lives2 = 3;
        this.timeLeft = 30; // 30 detik per ronde untuk mode 2P
        this.mode = "1P"; // "1P" atau "2P"
        this.difficulty = "Medium"; // "Easy", "Medium", "Hard"
        this.resultTimer = 0; // Timer penunda tombol di layar akhir game

        // Sistem 3 Sesi (Best-of-3 Rounds)
        this.currentRound = 1;
        this.roundWins1 = 0;
        this.roundWins2 = 0;
        this.totalScore1 = 0;
        this.totalScore2 = 0;
        this.roundTransitionTimer = 0;
        // High Score System
        this.highScore = parseInt(localStorage.getItem('fruit_slice_highscore') || '0');
        this.isNewHighScore = false;
    }

    getScale(w, h) {
        return Math.min(1.0, Math.min(w / 950, h / 540));
    }

    draw(ctx, canvasWidth, canvasHeight) {
        const s = this.getScale(canvasWidth, canvasHeight);

        if (this.state === "WELCOME") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            ctx.textAlign = "center";
            
            // Teks FRUIT SLICE AR
            ctx.shadowColor = "#F5D108";
            ctx.shadowBlur = Math.round(25 * s); // Efek Nyala (Glow)
            ctx.font = `${Math.round(80 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108"; 
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(3, Math.round(6 * s));
            ctx.strokeText("FRUIT SLICE AR", canvasWidth / 2, canvasHeight / 2 - 35 * s);
            ctx.fillText("FRUIT SLICE AR", canvasWidth / 2, canvasHeight / 2 - 35 * s);
            
            // Reset efek shadow agar teks lain tidak ikut nyala berlebihan
            ctx.shadowBlur = 0;

            // Teks BY VISION FORGE
            ctx.font = `${Math.round(18 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "white";
            ctx.lineWidth = Math.max(1, Math.round(2 * s));
            ctx.strokeText("BY VISION FORGE", canvasWidth / 2, canvasHeight / 2 + 15 * s);
            ctx.fillText("BY VISION FORGE", canvasWidth / 2, canvasHeight / 2 + 15 * s);

            // Teks SLASH TO START
            ctx.font = `${Math.round(30 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeText("SLASH TO START", canvasWidth / 2, canvasHeight / 2 + 90 * s);
            ctx.fillText("SLASH TO START", canvasWidth / 2, canvasHeight / 2 + 90 * s);

        } else if (this.state === "MODE_SELECT") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.textAlign = "center";

            // Judul
            ctx.shadowColor = "#F5D108";
            ctx.shadowBlur = Math.round(15 * s);
            ctx.font = `${Math.round(50 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(2, Math.round(4 * s));
            ctx.strokeText("SELECT MODE", canvasWidth / 2, canvasHeight / 4);
            ctx.fillText("SELECT MODE", canvasWidth / 2, canvasHeight / 4);
            ctx.shadowBlur = 0;

            // 1 PLAYER Button
            ctx.shadowColor = "cyan";
            ctx.shadowBlur = Math.round(20 * s);
            ctx.font = `${Math.round(34 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "cyan";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeStyle = "cyan";
            ctx.strokeRect(canvasWidth / 4 - 110 * s, canvasHeight / 2 - 40 * s, 220 * s, 60 * s); // Bounding Box
            
            ctx.strokeStyle = "black";
            ctx.strokeText("1 PLAYER", canvasWidth / 4, canvasHeight / 2 + 5 * s);
            ctx.fillText("1 PLAYER", canvasWidth / 4, canvasHeight / 2 + 5 * s);
            ctx.shadowBlur = 0;

            // 2 PLAYERS Button
            ctx.shadowColor = "red";
            ctx.shadowBlur = Math.round(20 * s);
            ctx.font = `${Math.round(34 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "red";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeStyle = "red";
            ctx.strokeRect((canvasWidth / 4) * 3 - 120 * s, canvasHeight / 2 - 40 * s, 240 * s, 60 * s); // Bounding Box
            
            ctx.strokeStyle = "black";
            ctx.strokeText("2 PLAYERS", (canvasWidth / 4) * 3, canvasHeight / 2 + 5 * s);
            ctx.fillText("2 PLAYERS", (canvasWidth / 4) * 3, canvasHeight / 2 + 5 * s);
            ctx.shadowBlur = 0;

            // Teks instruksi
            ctx.font = `${Math.round(22 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "white";
            ctx.lineWidth = Math.max(1, Math.round(2 * s));
            ctx.strokeText("SLASH TO CHOOSE", canvasWidth / 2, canvasHeight - 60 * s);
            ctx.fillText("SLASH TO CHOOSE", canvasWidth / 2, canvasHeight - 60 * s);

        } else if (this.state === "DIFFICULTY_SELECT") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.textAlign = "center";

            // Judul
            ctx.shadowColor = "#F5D108";
            ctx.shadowBlur = Math.round(15 * s);
            ctx.font = `${Math.round(48 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(2, Math.round(4 * s));
            ctx.strokeText("SELECT DIFFICULTY", canvasWidth / 2, canvasHeight / 4);
            ctx.fillText("SELECT DIFFICULTY", canvasWidth / 2, canvasHeight / 4);
            ctx.shadowBlur = 0;

            // EASY Button
            ctx.shadowColor = "lightgreen";
            ctx.shadowBlur = Math.round(20 * s);
            ctx.font = `${Math.round(30 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "lightgreen";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeStyle = "lightgreen";
            ctx.strokeRect(canvasWidth / 4 - 80 * s, canvasHeight / 2 - 40 * s, 160 * s, 60 * s); // Bounding Box
            
            ctx.strokeStyle = "black";
            ctx.strokeText("EASY", canvasWidth / 4, canvasHeight / 2 + 5 * s);
            ctx.fillText("EASY", canvasWidth / 4, canvasHeight / 2 + 5 * s);
            ctx.shadowBlur = 0;

            // MEDIUM Button
            ctx.shadowColor = "#F5D108";
            ctx.shadowBlur = Math.round(20 * s);
            ctx.font = `${Math.round(30 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeStyle = "#F5D108";
            ctx.strokeRect(canvasWidth / 2 - 90 * s, canvasHeight / 2 - 40 * s, 180 * s, 60 * s); // Bounding Box
            
            ctx.strokeStyle = "black";
            ctx.strokeText("MEDIUM", canvasWidth / 2, canvasHeight / 2 + 5 * s);
            ctx.fillText("MEDIUM", canvasWidth / 2, canvasHeight / 2 + 5 * s);
            ctx.shadowBlur = 0;

            // HARD Button
            ctx.shadowColor = "lightcoral";
            ctx.shadowBlur = Math.round(20 * s);
            ctx.font = `${Math.round(30 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "lightcoral";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeStyle = "lightcoral";
            ctx.strokeRect((canvasWidth / 4) * 3 - 80 * s, canvasHeight / 2 - 40 * s, 160 * s, 60 * s); // Bounding Box
            
            ctx.strokeStyle = "black";
            ctx.strokeText("HARD", (canvasWidth / 4) * 3, canvasHeight / 2 + 5 * s);
            ctx.fillText("HARD", (canvasWidth / 4) * 3, canvasHeight / 2 + 5 * s);
            ctx.shadowBlur = 0;

            // Teks instruksi
            ctx.font = `${Math.round(22 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "white";
            ctx.lineWidth = Math.max(1, Math.round(2 * s));
            ctx.strokeText("SLASH TO CHOOSE", canvasWidth / 2, canvasHeight - 60 * s);
            ctx.fillText("SLASH TO CHOOSE", canvasWidth / 2, canvasHeight - 60 * s);

        } else if (this.state === "GAME_1P") {
            // HUD Kiri Atas: Skor & Rekor Terbaik (BEST)
            ctx.textAlign = "left";
            ctx.shadowColor = "cyan";
            ctx.shadowBlur = Math.round(10 * s);
            ctx.font = `${Math.round(26 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "cyan";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeText("SCORE: " + this.score1, 25 * s, 42 * s);
            ctx.fillText("SCORE: " + this.score1, 25 * s, 42 * s);

            ctx.shadowColor = "#F5D108";
            ctx.shadowBlur = Math.round(8 * s);
            ctx.font = `${Math.round(17 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.strokeText("BEST: " + Math.max(this.score1, this.highScore), 25 * s, 70 * s);
            ctx.fillText("BEST: " + Math.max(this.score1, this.highScore), 25 * s, 70 * s);
            ctx.shadowBlur = 0;

            // HUD Tengah Atas: Badge Difficulty
            ctx.save();
            ctx.textAlign = "center";
            ctx.shadowColor = "#F5D108";
            ctx.shadowBlur = Math.round(10 * s);
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.strokeStyle = "#F5D108";
            ctx.lineWidth = Math.max(1, Math.round(2 * s));
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(canvasWidth / 2 - 60 * s, 12 * s, 120 * s, 32 * s, 16 * s);
            } else {
                ctx.rect(canvasWidth / 2 - 60 * s, 12 * s, 120 * s, 32 * s);
            }
            ctx.fill();
            ctx.stroke();

            ctx.font = `${Math.round(15 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(1, Math.round(2 * s));
            ctx.strokeText(this.difficulty.toUpperCase(), canvasWidth / 2, 34 * s);
            ctx.fillText(this.difficulty.toUpperCase(), canvasWidth / 2, 34 * s);
            ctx.restore();

            // HUD Kanan Atas: Nyawa Hati ❤️❤️❤️
            ctx.textAlign = "right";
            ctx.font = `${Math.round(22 * s)}px 'Segoe UI'`;
            ctx.fillText("❤️".repeat(Math.max(0, this.lives1)), canvasWidth - 25 * s, 42 * s);

        } else if (this.state === "GAME_2P") {
            // Garis pembatas neon bersinar
            ctx.save();
            ctx.shadowColor = "#F5D108";
            ctx.shadowBlur = Math.round(15 * s);
            ctx.beginPath();
            ctx.moveTo(canvasWidth / 2, 0);
            ctx.lineTo(canvasWidth / 2, canvasHeight);
            ctx.lineWidth = Math.max(2, Math.round(4 * s));
            ctx.strokeStyle = "#F5D108";
            ctx.stroke();
            ctx.restore();

            // HUD P1 (Kiri - Cyan)
            ctx.shadowColor = "cyan";
            ctx.shadowBlur = Math.round(10 * s);
            ctx.font = `${Math.round(26 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "cyan";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.textAlign = "left";
            ctx.strokeText("P1 SCORE: " + this.score1, 25 * s, 42 * s);
            ctx.fillText("P1 SCORE: " + this.score1, 25 * s, 42 * s);
            ctx.shadowBlur = 0;
            ctx.font = `${Math.round(18 * s)}px 'Segoe UI'`;
            ctx.fillText("❤️".repeat(this.lives1) + "  " + "👑".repeat(this.roundWins1), 25 * s, 70 * s);

            // HUD P2 (Kanan - Red)
            ctx.shadowColor = "red";
            ctx.shadowBlur = Math.round(10 * s);
            ctx.font = `${Math.round(26 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "lightcoral";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.textAlign = "right";
            ctx.strokeText("P2 SCORE: " + this.score2, canvasWidth - 25 * s, 42 * s);
            ctx.fillText("P2 SCORE: " + this.score2, canvasWidth - 25 * s, 42 * s);
            ctx.shadowBlur = 0;
            ctx.font = `${Math.round(18 * s)}px 'Segoe UI'`;
            ctx.fillText("👑".repeat(this.roundWins2) + "  " + "❤️".repeat(this.lives2), canvasWidth - 25 * s, 70 * s);

            // Timer Badge Kapsul Neon di tengah
            const timeLeftSec = Math.max(0, Math.ceil(this.timeLeft));
            ctx.shadowColor = "#F5D108";
            ctx.shadowBlur = Math.round(15 * s);
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.strokeStyle = "#F5D108";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(canvasWidth / 2 - 50 * s, 8 * s, 100 * s, 38 * s, 8 * s);
            } else {
                ctx.rect(canvasWidth / 2 - 50 * s, 8 * s, 100 * s, 38 * s);
            }
            ctx.fill();
            ctx.stroke();

            ctx.font = `${Math.round(22 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.textAlign = "center";
            ctx.strokeText(timeLeftSec + "s", canvasWidth / 2, 35 * s);
            ctx.fillText(timeLeftSec + "s", canvasWidth / 2, 35 * s);
            ctx.shadowBlur = 0;

            // Indikator Ronde di bawah timer
            ctx.font = `${Math.round(16 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(1, Math.round(2 * s));
            ctx.strokeText("ROUND " + this.currentRound + " / 3", canvasWidth / 2, 65 * s);
            ctx.fillText("ROUND " + this.currentRound + " / 3", canvasWidth / 2, 65 * s);

        } else if (this.state === "ROUND_TRANSITION") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            ctx.textAlign = "center";
            ctx.shadowColor = this.roundWinnerColor;
            ctx.shadowBlur = Math.round(20 * s);
            ctx.font = `${Math.round(45 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = this.roundWinnerColor;
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(2, Math.round(4 * s));
            ctx.strokeText(this.roundWinnerText, canvasWidth / 2, canvasHeight / 2 - 50 * s);
            ctx.fillText(this.roundWinnerText, canvasWidth / 2, canvasHeight / 2 - 50 * s);
            ctx.shadowBlur = 0;

            ctx.font = `${Math.round(24 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeText(`MATCH SCORE - P1: ${this.roundWins1}  |  P2: ${this.roundWins2}`, canvasWidth / 2, canvasHeight / 2 + 10 * s);
            ctx.fillText(`MATCH SCORE - P1: ${this.roundWins1}  |  P2: ${this.roundWins2}`, canvasWidth / 2, canvasHeight / 2 + 10 * s);

            const remainingTime = Math.max(1, Math.ceil(3 - this.roundTransitionTimer));
            ctx.font = `${Math.round(20 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "white";
            ctx.lineWidth = Math.max(1, Math.round(2 * s));
            ctx.strokeText(`NEXT ROUND IN ${remainingTime}s...`, canvasWidth / 2, canvasHeight / 2 + 65 * s);
            ctx.fillText(`NEXT ROUND IN ${remainingTime}s...`, canvasWidth / 2, canvasHeight / 2 + 65 * s);

        } else if (this.state === "OVER_1P") {
            // Cek & simpan High Score baru
            if (this.score1 > this.highScore) {
                this.highScore = this.score1;
                this.isNewHighScore = true;
                localStorage.setItem('fruit_slice_highscore', this.highScore.toString());
            }

            ctx.fillStyle = "rgba(20, 0, 0, 0.85)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            ctx.textAlign = "center";
            ctx.shadowColor = "red";
            ctx.shadowBlur = Math.round(20 * s);
            ctx.font = `${Math.round(55 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "red";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(3, Math.round(5 * s));
            ctx.strokeText("GAME OVER", canvasWidth / 2, canvasHeight / 2 - 60 * s);
            ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2 - 60 * s);
            ctx.shadowBlur = 0;

            if (this.isNewHighScore) {
                ctx.shadowColor = "#39FF14";
                ctx.shadowBlur = Math.round(15 * s);
                ctx.font = `${Math.round(18 * s)}px 'Ninja', cursive`;
                ctx.fillStyle = "#39FF14";
                ctx.strokeStyle = "black";
                ctx.lineWidth = Math.max(1, Math.round(2 * s));
                ctx.strokeText("🎉 NEW HIGH SCORE! 🎉", canvasWidth / 2, canvasHeight / 2 - 20 * s);
                ctx.fillText("🎉 NEW HIGH SCORE! 🎉", canvasWidth / 2, canvasHeight / 2 - 20 * s);
                ctx.shadowBlur = 0;
            }

            ctx.font = `${Math.round(24 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeText("FINAL SCORE: " + this.score1, canvasWidth / 2, canvasHeight / 2 + 15 * s);
            ctx.fillText("FINAL SCORE: " + this.score1, canvasWidth / 2, canvasHeight / 2 + 15 * s);

            ctx.font = `${Math.round(18 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "cyan";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.max(1, Math.round(2 * s));
            ctx.strokeText("BEST SCORE: " + this.highScore, canvasWidth / 2, canvasHeight / 2 + 45 * s);
            ctx.fillText("BEST SCORE: " + this.highScore, canvasWidth / 2, canvasHeight / 2 + 45 * s);

            // Tombol hanya muncul setelah 5 detik
            if (this.resultTimer >= 5) {
                ctx.shadowColor = "#F5D108";
                ctx.shadowBlur = Math.round(15 * s);
                ctx.strokeStyle = "#F5D108";
                ctx.lineWidth = Math.max(2, Math.round(3 * s));
                ctx.strokeRect(canvasWidth / 2 - 130 * s, canvasHeight / 2 + 75 * s, 260 * s, 44 * s); // Bounding Box
                
                ctx.font = `${Math.round(20 * s)}px 'Ninja', cursive`;
                ctx.fillStyle = "#F5D108";
                ctx.strokeStyle = "black";
                ctx.lineWidth = Math.max(1, Math.round(2 * s));
                ctx.strokeText("SLASH TO CONTINUE", canvasWidth / 2, canvasHeight / 2 + 104 * s);
                ctx.fillText("SLASH TO CONTINUE", canvasWidth / 2, canvasHeight / 2 + 104 * s);
                ctx.shadowBlur = 0;
            }

        } else if (this.state === "WINNER_2P") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            ctx.textAlign = "center";
            ctx.font = `${Math.round(45 * s)}px 'Ninja', cursive`;
            ctx.lineWidth = Math.max(3, Math.round(5 * s));
            ctx.strokeStyle = "black";

            let titleText = "";
            let titleColor = "white";
            let shadowCol = "white";

            if (this.roundWins1 > this.roundWins2) {
                titleText = "PLAYER 1 IS CHAMPION! 🏆";
                titleColor = "cyan";
                shadowCol = "cyan";
            } else if (this.roundWins2 > this.roundWins1) {
                titleText = "PLAYER 2 IS CHAMPION! 🏆";
                titleColor = "lightcoral";
                shadowCol = "red";
            } else {
                titleText = "MATCH TIED! 🤝";
                titleColor = "yellow";
                shadowCol = "yellow";
            }

            ctx.shadowColor = shadowCol;
            ctx.shadowBlur = Math.round(20 * s);
            ctx.fillStyle = titleColor;
            ctx.strokeText(titleText, canvasWidth / 2, canvasHeight / 2 - 50 * s);
            ctx.fillText(titleText, canvasWidth / 2, canvasHeight / 2 - 50 * s);
            ctx.shadowBlur = 0;

            ctx.font = `${Math.round(24 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "#F5D108";
            ctx.lineWidth = Math.max(2, Math.round(3 * s));
            ctx.strokeText(`ROUNDS - P1: ${this.roundWins1}  |  P2: ${this.roundWins2}`, canvasWidth / 2, canvasHeight / 2);
            ctx.fillText(`ROUNDS - P1: ${this.roundWins1}  |  P2: ${this.roundWins2}`, canvasWidth / 2, canvasHeight / 2);

            ctx.font = `${Math.round(20 * s)}px 'Ninja', cursive`;
            ctx.fillStyle = "white";
            ctx.strokeText(`TOTAL SCORE - P1: ${this.totalScore1}  |  P2: ${this.totalScore2}`, canvasWidth / 2, canvasHeight / 2 + 40 * s);
            ctx.fillText(`TOTAL SCORE - P1: ${this.totalScore1}  |  P2: ${this.totalScore2}`, canvasWidth / 2, canvasHeight / 2 + 40 * s);

            // Tombol hanya muncul setelah 5 detik
            if (this.resultTimer >= 5) {
                ctx.shadowColor = "#F5D108";
                ctx.shadowBlur = Math.round(15 * s);
                ctx.strokeStyle = "#F5D108";
                ctx.lineWidth = Math.max(2, Math.round(3 * s));
                ctx.strokeRect(canvasWidth / 2 - 130 * s, canvasHeight / 2 + 85 * s, 260 * s, 44 * s); // Bounding Box
                
                ctx.font = `${Math.round(20 * s)}px 'Ninja', cursive`;
                ctx.fillStyle = "#F5D108";
                ctx.strokeStyle = "black";
                ctx.lineWidth = Math.max(1, Math.round(2 * s));
                ctx.strokeText("SLASH TO CONTINUE", canvasWidth / 2, canvasHeight / 2 + 114 * s);
                ctx.fillText("SLASH TO CONTINUE", canvasWidth / 2, canvasHeight / 2 + 114 * s);
                ctx.shadowBlur = 0;
            }
        }
    }
}

const ui = new UI();
