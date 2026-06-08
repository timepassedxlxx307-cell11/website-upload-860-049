(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function initPlayer(player) {
    var video = player.querySelector("video");
    var playButton = player.querySelector(".js-play-video");
    var message = player.querySelector(".js-player-message");
    var source = player.getAttribute("data-src") || (video && video.getAttribute("data-src"));
    var hlsInstance = null;
    var prepared = false;

    if (!video || !playButton || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function prepareNative() {
      video.src = source;
      prepared = true;
      return Promise.resolve();
    }

    function prepareHls() {
      return new Promise(function (resolve, reject) {
        if (!window.Hls || !window.Hls.isSupported()) {
          reject(new Error("hls-not-supported"));
          return;
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          prepared = true;
          resolve();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage("播放源加载异常，请刷新页面后重试。");
          }
        });
      });
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }

      setMessage("正在加载播放源…");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        return prepareNative();
      }

      return prepareHls().catch(function () {
        return prepareNative();
      });
    }

    function startPlayback() {
      prepare().then(function () {
        video.controls = true;
        player.classList.add("is-ready");
        return video.play();
      }).then(function () {
        player.classList.add("is-playing");
        setMessage("");
      }).catch(function () {
        video.controls = true;
        player.classList.add("is-ready");
        setMessage("浏览器已阻止自动播放，请使用视频控件继续播放。");
      });
    }

    playButton.addEventListener("click", startPlayback);

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
      setMessage("");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        player.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll(".js-video-player").forEach(initPlayer);
  });
})();
