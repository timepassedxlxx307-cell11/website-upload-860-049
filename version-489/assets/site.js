(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startHero();
      });
    });
    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  var searchInput = document.getElementById('movieSearch');
  var regionFilter = document.getElementById('regionFilter');
  var typeFilter = document.getElementById('typeFilter');
  var yearFilter = document.getElementById('yearFilter');
  var emptyState = document.querySelector('[data-empty-state]');

  function lower(value) {
    return String(value || '').toLowerCase();
  }

  function filterCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!cards.length) {
      return;
    }
    var keyword = lower(searchInput && searchInput.value);
    var region = regionFilter ? regionFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = lower([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-keywords')
      ].join(' '));
      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okRegion = !region || card.getAttribute('data-region') === region;
      var okType = !type || card.getAttribute('data-type') === type;
      var okYear = !year || card.getAttribute('data-year') === year;
      var ok = okKeyword && okRegion && okType && okYear;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (element) {
    if (element) {
      element.addEventListener('input', filterCards);
      element.addEventListener('change', filterCards);
    }
  });

  document.querySelectorAll('.player-panel').forEach(function (panel) {
    var video = panel.querySelector('video');
    var layer = panel.querySelector('.play-layer');
    var stream = panel.getAttribute('data-stream');
    var hls = null;
    var attached = false;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }
      attached = true;
      video.setAttribute('controls', 'controls');
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = stream;
        video.load();
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      if (layer) {
        layer.classList.add('is-hidden');
      }
      video.play().catch(function () {});
    }

    function start() {
      attachStream();
      playVideo();
    }

    if (layer) {
      layer.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('is-hidden');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
