(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var previous = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function start() {
        if (slides.length <= 1) {
          return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      if (previous) {
        previous.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var keyword = panel.querySelector('[data-filter-keyword]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var empty = panel.querySelector('[data-no-results]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('search');

      if (query && keyword && window.location.pathname.endsWith('index.html')) {
        keyword.value = query;
        var library = document.getElementById('library');
        if (library) {
          setTimeout(function () {
            library.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }

      function apply() {
        var key = normalize(keyword && keyword.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute('data-search'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = true;

          if (key && searchText.indexOf(key) === -1) {
            matched = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }

          card.classList.toggle('hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [keyword, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-button');
      var status = shell.querySelector('.player-status');
      var prepared = false;
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function prepareVideo() {
        var playUrl = video.getAttribute('data-play-url');

        if (!playUrl) {
          setStatus('播放线路暂不可用');
          return Promise.reject(new Error('empty url'));
        }

        if (prepared) {
          return Promise.resolve();
        }

        prepared = true;
        shell.classList.add('is-loading');
        setStatus('正在加载');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = playUrl;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(playUrl);
          hlsInstance.attachMedia(video);
          shell.hlsPlayer = hlsInstance;
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            setTimeout(resolve, 1400);
          });
        }

        video.src = playUrl;
        return Promise.resolve();
      }

      function play() {
        prepareVideo().then(function () {
          return video.play();
        }).then(function () {
          shell.classList.add('is-playing');
          shell.classList.remove('is-loading');
          setStatus('正在播放');
        }).catch(function () {
          shell.classList.remove('is-loading');
          setStatus('点击重试');
        });
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });

      shell.addEventListener('click', function (event) {
        if (event.target === button || button.contains(event.target)) {
          return;
        }
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        shell.classList.remove('is-loading');
        setStatus('正在播放');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
        setStatus('已暂停');
      });

      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
        setStatus('播放结束');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
