const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

class ButterflyCursor {
  constructor({ enabled = true, maxParticles = 28 } = {}) {
    this.enabled =
      enabled &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.maxParticles = maxParticles;
    this.particles = [];
    this.target = { x: window.innerWidth * 0.62, y: window.innerHeight * 0.38 };
    this.current = { ...this.target };
    this.last = { ...this.target };
    this.lastParticle = { ...this.target };
    this.angle = -8;
    this.raf = null;

    if (!this.enabled) return;

    this.createElements();
    this.bindEvents();
    this.animate();
  }

  createElements() {
    this.root = document.createElement("div");
    this.root.className = "butterfly-cursor";
    this.root.setAttribute("aria-hidden", "true");
    this.root.innerHTML = `
      <svg class="butterfly-cursor__svg" viewBox="0 0 96 72" focusable="false">
        <g class="butterfly-cursor__wing butterfly-cursor__wing--left">
          <path d="M45 34 C28 9 13 7 7 19 C2 30 15 43 34 41 C21 49 16 61 29 65 C39 68 45 51 47 40 Z" />
          <path class="butterfly-cursor__cut" d="M17 20 C27 24 34 29 42 38 M18 41 C28 39 35 38 44 38" />
        </g>
        <g class="butterfly-cursor__wing butterfly-cursor__wing--right">
          <path d="M51 35 C66 12 83 10 89 22 C94 34 79 44 60 42 C74 48 80 58 68 64 C57 70 51 51 49 40 Z" />
          <path class="butterfly-cursor__cut" d="M79 23 C68 26 61 31 53 38 M77 43 C66 40 60 39 52 38" />
        </g>
        <path class="butterfly-cursor__body" d="M47 28 C44 34 44 45 48 52 C53 44 53 35 49 28 Z" />
        <path class="butterfly-cursor__ink" d="M43 39 C34 37 28 34 20 29 M53 39 C62 36 69 33 77 28 M42 46 C33 49 28 54 21 61 M54 46 C64 50 69 55 75 62" />
      </svg>
    `;
    document.body.appendChild(this.root);
  }

  bindEvents() {
    window.addEventListener("mousemove", this.handleMove, { passive: true });
    window.addEventListener("blur", this.destroy, { once: true });
  }

  handleMove = (event) => {
    this.target.x = event.clientX;
    this.target.y = event.clientY;
  };

  animate = () => {
    const dx = this.target.x - this.current.x;
    const dy = this.target.y - this.current.y;
    this.current.x += dx * 0.085;
    this.current.y += dy * 0.085;

    const vx = this.current.x - this.last.x;
    const vy = this.current.y - this.last.y;
    const speed = Math.hypot(vx, vy);

    if (speed > 0.12) {
      const targetAngle = Math.atan2(vy, vx) * (180 / Math.PI) + 8;
      this.angle += (targetAngle - this.angle) * 0.08;
    }

    this.root.style.transform = `translate3d(${this.current.x}px, ${this.current.y}px, 0) translate(-50%, -50%) rotate(${this.angle}deg)`;

    if (this.distanceFromLastParticle() > 42 && speed > 0.7) {
      this.createParticle();
      this.lastParticle = { ...this.current };
    }

    this.last = { ...this.current };
    this.raf = requestAnimationFrame(this.animate);
  };

  distanceFromLastParticle() {
    return Math.hypot(this.current.x - this.lastParticle.x, this.current.y - this.lastParticle.y);
  }

  createParticle() {
    const particle = document.createElement("span");
    const size = 2 + Math.random() * 4;
    const driftX = (Math.random() - 0.5) * 34;
    const driftY = -10 - Math.random() * 30;
    const life = 800 + Math.random() * 700;
    const isCross = Math.random() > 0.58;

    particle.className = `butterfly-sparkle${isCross ? " butterfly-sparkle--cross" : ""}`;
    particle.style.left = `${this.current.x + (Math.random() - 0.5) * 12}px`;
    particle.style.top = `${this.current.y + (Math.random() - 0.5) * 12}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.setProperty("--drift-x", `${driftX}px`);
    particle.style.setProperty("--drift-y", `${driftY}px`);
    particle.style.animationDuration = `${life}ms`;

    document.body.appendChild(particle);
    this.particles.push(particle);

    if (this.particles.length > this.maxParticles) {
      this.particles.shift()?.remove();
    }

    window.setTimeout(() => {
      particle.remove();
      this.particles = this.particles.filter((item) => item !== particle);
    }, life + 80);
  }

  destroy = () => {
    window.removeEventListener("mousemove", this.handleMove);
    if (this.raf) cancelAnimationFrame(this.raf);
    this.particles.forEach((particle) => particle.remove());
    this.root?.remove();
  };
}

new ButterflyCursor({ enabled: true });
