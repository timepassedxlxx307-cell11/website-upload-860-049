(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll("[data-player-card]").forEach(function (card) {
            var video = card.querySelector("video[data-stream]");
            var button = card.querySelector(".js-play-button");
            var hlsInstance = null;
            var prepared = false;

            function prepare() {
                if (!video || prepared) {
                    return;
                }
                var stream = video.getAttribute("data-stream") || "";
                if (!stream) {
                    return;
                }
                prepared = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                prepare();
                if (!video) {
                    return;
                }
                var promise = video.play();
                card.classList.add("is-playing");
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        card.classList.remove("is-playing");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }

            card.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                if (event.target.closest("button")) {
                    return;
                }
                play();
            });

            if (video) {
                video.addEventListener("play", function () {
                    card.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (video.currentTime === 0 || video.ended) {
                        card.classList.remove("is-playing");
                    }
                });
            }
        });
    });
})();
