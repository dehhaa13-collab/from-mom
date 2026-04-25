// ============================
// PARTICLES BACKGROUND
// ============================
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };
let w, h;

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Track mouse for subtle interaction
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.fadeDir = Math.random() > 0.5 ? 1 : -1;
        // Gold tones
        const gold = Math.floor(Math.random() * 3);
        if (gold === 0) this.color = '201, 169, 110';      // warm gold
        else if (gold === 1) this.color = '240, 216, 168';  // light gold
        else this.color = '180, 160, 140';                   // muted silver
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        // Gentle breathing
        this.opacity += this.fadeDir * 0.002;
        if (this.opacity > 0.5) this.fadeDir = -1;
        if (this.opacity < 0.05) this.fadeDir = 1;
        // Wrap around
        if (this.x < -10) this.x = w + 10;
        if (this.x > w + 10) this.x = -10;
        if (this.y < -10) this.y = h + 10;
        if (this.y > h + 10) this.y = -10;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
    }
}

// Adaptive particle count
function getParticleCount() {
    const area = w * h;
    return Math.min(Math.floor(area / 12000), 120);
}

function initParticles() {
    particles = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}
initParticles();
window.addEventListener('resize', initParticles);

function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
                const alpha = (1 - dist / maxDist) * 0.08;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

// Mouse connection lines
function drawMouseConnections() {
    if (!mouse.x) return;
    const maxDist = 150;
    for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(240, 216, 168, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
        p.update();
        p.draw();
    }
    drawConnections();
    drawMouseConnections();
    requestAnimationFrame(animate);
}
animate();

// ============================
// NAVIGATION DOTS + SCROLL ANIM
// ============================
const sections = document.querySelectorAll('.section');
const navDots = document.getElementById('navDots');

sections.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
        sections[i].scrollIntoView({ behavior: 'smooth' });
    });
    navDots.appendChild(dot);
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.fade-up').forEach(el => {
                el.classList.add('visible');
            });
            const idx = Array.from(sections).indexOf(entry.target);
            if (idx !== -1) {
                document.querySelectorAll('.nav-dot').forEach((d, i) => {
                    d.classList.toggle('active', i === idx);
                });
            }
        }
    });
}, { threshold: 0.15 });

sections.forEach(s => observer.observe(s));
