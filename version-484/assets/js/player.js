(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        panels.forEach(function (panel) {
            var video = panel.querySelector('video');
            var button = panel.querySelector('[data-play-button]');
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-play');
            var loaded = false;
            var hls = null;
            function load() {
                if (loaded || !source) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
            function play() {
                load();
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        panel.classList.remove('is-playing');
                    });
                }
            }
            button.addEventListener('click', function () {
                play();
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                panel.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                panel.classList.remove('is-playing');
            });
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    });
}());
