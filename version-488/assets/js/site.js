(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  document.addEventListener("error", function (event) {
    var target = event.target;
    if (target && target.tagName === "IMG") {
      target.classList.add("image-failed");
    }
  }, true);

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.querySelectorAll(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var next = slider.querySelector("[data-hero-next]");
    var prev = slider.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var targetSelector = form.getAttribute("data-target");
      var list = document.querySelector(targetSelector);
      var empty = document.querySelector("[data-empty-for='" + targetSelector + "']");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
      var fields = Array.prototype.slice.call(form.querySelectorAll("[data-filter-field]"));

      function update() {
        var values = {};
        fields.forEach(function (field) {
          values[field.getAttribute("data-filter-field")] = normalize(field.value);
        });

        var matched = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-keywords"));
          var matchQuery = !values.q || haystack.indexOf(values.q) !== -1;
          var matchYear = !values.year || normalize(card.getAttribute("data-year")) === values.year;
          var matchType = !values.type || normalize(card.getAttribute("data-type")).indexOf(values.type) !== -1;
          var matchGenre = !values.genre || normalize(card.getAttribute("data-genre")).indexOf(values.genre) !== -1 || haystack.indexOf(values.genre) !== -1;
          var matchCategory = !values.category || normalize(card.getAttribute("data-category")) === values.category;
          var visible = matchQuery && matchYear && matchType && matchGenre && matchCategory;

          card.hidden = !visible;
          if (visible) {
            matched += 1;
          }
        });

        if (empty) {
          empty.hidden = matched !== 0;
        }
      }

      form.addEventListener("input", update);
      form.addEventListener("change", update);
      form.addEventListener("reset", function () {
        window.setTimeout(update, 0);
      });

      update();
    });
  }

  function initPlayerScrollLinks() {
    document.querySelectorAll("[data-scroll-player]").forEach(function (link) {
      link.addEventListener("click", function () {
        window.setTimeout(function () {
          var player = document.querySelector(".js-video-player");
          var playButton = document.querySelector(".js-play-video");
          if (player && playButton) {
            player.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 0);
      });
    });
  }

  ready(function () {
    initNavigation();
    initHeroSlider();
    initFilters();
    initPlayerScrollLinks();
  });
})();
