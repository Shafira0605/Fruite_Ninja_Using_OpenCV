class Blade {
    constructor(color = 'rgba(200, 200, 255, 0.4)') {
        this.history = [];
        this.maxHistory = 12;
        this.width = 10;
        this.velocity = 0;
        this.color = color; // Warna jejak pedang
    }

    update(x, y) {
        if (x === null || y === null) return;
        this.history.unshift({ x, y });

        if (this.history.length > 1) {
            const dx = this.history[0].x - this.history[1].x;
            const dy = this.history[0].y - this.history[1].y;
            this.velocity = Math.sqrt(dx * dx + dy * dy);
        } else {
            this.velocity = 0;
        }

        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
    }

    draw(ctx) {
        if (this.history.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 1; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.lineWidth = this.width + 4;
        ctx.strokeStyle = this.color;
        ctx.stroke();

        ctx.lineWidth = this.width;
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }

    fade() {
        if (this.history.length > 0) this.history.pop();
        this.velocity = 0;
    }
}

// Helper matematika untuk mendeteksi persilangan (tabrakan) garis pedang dan lingkaran buah
function dist2(v, w) {
    const sqrDist = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    return sqrDist === 0 ? 0.0001 : sqrDist; // Hindari bagi nol
}

class Fruit {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = -(Math.random() * 6 + 14);
        this.gravity = 0.35;
        this.angle = 0;
        this.angularVelocity = (Math.random() - 0.5) * 0.2;
        this.size = 88; // Ukuran seimbang untuk HP & Laptop
        this.image = new Image();
        // Memakai jalur relative baru karena assets sudah ada di dalam web_build
        this.image.src = `assets/fruits/${type}.png`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.angle += this.angularVelocity;
    }

    draw(ctx) {
        if (this.image.complete && this.image.naturalHeight !== 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    // Mendeteksi tebasan pedang
    checkSlice(blade) {
        // Jika tebasan terlalu lambat, jangan potong
        if (blade.history.length < 2 || blade.velocity < 15) return false;

        const p1 = blade.history[0]; // Ujung pedang saat ini
        const p2 = blade.history[1]; // Ujung pedang 1 frame yang lalu

        // Rumus jarak titik (tengah buah) ke segmen garis (pedang)
        const l2 = dist2(p1, p2);
        let t = ((this.x - p1.x) * (p2.x - p1.x) + (this.y - p1.y) * (p2.y - p1.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);

        const distanceToLine = Math.sqrt((this.x - closestX) ** 2 + (this.y - closestY) ** 2);

        // Jika jarak garis pedang kurang dari jari-jari buah, maka KENA TEBAS!
        return distanceToLine < (this.size / 2);
    }
}

class Bomb extends Fruit {
    constructor(x, y) {
        super(x, y, 'bomb');
        this.size = 92; // Ukuran seimbang untuk HP & Laptop
    }
}

// === SPRINT 4: EFEK TEBASAN (VISUAL) === //

class SlicedFruit {
    constructor(x, y, type, direction, swordVelocity) {
        this.x = x;
        this.y = y;
        this.type = type;

        // Membelah ke kiri (direction -1) atau kanan (direction 1)
        this.vx = (Math.random() * 2 + 2) * direction + (swordVelocity * 0.05 * direction);
        this.vy = -Math.random() * 5 - 2;
        this.gravity = 0.4;
        this.angle = 0;
        this.angularVelocity = (Math.random() * 0.2 + 0.1) * direction;

        this.size = 88; // Ukuran seimbang untuk HP & Laptop
        this.image = new Image();
        const halfNum = direction === -1 ? '1' : '2';
        this.image.src = `assets/fruits/${type}_half_${halfNum}.png`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.angle += this.angularVelocity;
    }

    draw(ctx) {
        if (this.image.complete && this.image.naturalHeight !== 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }
}

class Splash {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.particles = [];

        // Buat 15 titik partikel air/jus
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: 0, y: 0,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 1.0 // Umur partikel dari 1.0 sampai 0.0
            });
        }
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04; // Perlahan memudar
        });
        // Hapus partikel yang sudah mati (transparan)
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        this.particles.forEach(p => {
            // Gambar lingkaran jus dengan alpha (transparansi) sesuai sisa umur
            ctx.fillStyle = `rgba(${this.color}, ${p.life})`;
            ctx.beginPath();
            ctx.arc(this.x + p.x, this.y + p.y, Math.random() * 5 + 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

class ComboText {
    constructor(x, y, text, color = '#F5D108') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.scale = 1.6;
        this.targetScale = 1.0;
        this.alpha = 1.0;
        this.vy = -1.2;
    }

    update() {
        this.y += this.vy;
        if (this.scale > this.targetScale) {
            this.scale -= 0.05;
        }
        this.alpha -= 0.02;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.textAlign = 'center';
        ctx.font = `bold ${Math.round(42 * this.scale)}px 'Ninja', cursive`;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
