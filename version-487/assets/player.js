let hlsConstructorPromise = null;

async function getHlsConstructor() {
  if (window.Hls) {
    return window.Hls;
  }

  if (!hlsConstructorPromise) {
    hlsConstructorPromise = import("./video-vendor-dru42stk.js")
      .then((module) => module.H || null)
      .catch(() => null);
  }

  return hlsConstructorPromise;
}

export function initPlayer(streamUrl) {
  const video = document.querySelector("[data-player]");
  const overlay = document.querySelector("[data-play-overlay]");
  let prepared = false;
  let hls = null;

  if (!video || !streamUrl) {
    return;
  }

  const prepare = async () => {
    if (prepared) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else {
      const Hls = await getHlsConstructor();

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    prepared = true;
  };

  const start = async () => {
    overlay?.classList.add("is-hidden");
    await prepare();
    video.play().catch(() => {});
  };

  overlay?.addEventListener("click", start);
  video.addEventListener("click", () => {
    if (!prepared) {
      start();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
