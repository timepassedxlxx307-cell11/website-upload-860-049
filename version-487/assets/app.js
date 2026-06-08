document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("is-open");
    });
  }

  const slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    const play = () => {
      timer = window.setInterval(() => show(current + 1), 5200);
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    };

    if (slides.length > 1) {
      prev?.addEventListener("click", () => {
        show(current - 1);
        restart();
      });

      next?.addEventListener("click", () => {
        show(current + 1);
        restart();
      });

      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          show(index);
          restart();
        });
      });

      play();
    }
  }

  const input = document.querySelector("[data-filter-input]");

  if (input) {
    const cards = Array.from(document.querySelectorAll("[data-filter-card]"));
    const empty = document.querySelector("[data-filter-empty]");
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (query) {
      input.value = query;
    }

    const filterCards = () => {
      const value = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.getAttribute("data-filter-text") || card.textContent || "").toLowerCase();
        const matched = !value || text.includes(value);
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    input.addEventListener("input", filterCards);
    filterCards();
  }
});
