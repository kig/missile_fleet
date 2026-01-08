

export const FullscreenMode = {
    isFullscreen: false,
    infoVisible: false,

    init: function (canvas) {
        this.canvas = canvas;
        this.createButtons();
        this.createInfoOverlay();
        this.setupFullscreenListeners();
    },

    createButtons: function () {
        var container = document.createElement("div");
        container.id = "fullscreen-controls";
        container.style.cssText = "position: fixed; z-index: 9999;";

        var fullscreenBtn = document.createElement("button");
        fullscreenBtn.id = "fullscreen-btn";
        fullscreenBtn.innerHTML = "⛶";
        fullscreenBtn.title = "Toggle Fullscreen";
        fullscreenBtn.onclick = this.toggleFullscreen.bind(this);

        var infoBtn = document.createElement("button");
        infoBtn.id = "info-btn";
        infoBtn.innerHTML = "ⓘ";
        infoBtn.title = "Show Info";
        infoBtn.onclick = this.toggleInfo.bind(this);

        container.appendChild(fullscreenBtn);
        container.appendChild(infoBtn);
        document.body.appendChild(container);
    },

    createInfoOverlay: function () {
        var overlay = document.createElement("div");
        overlay.id = "info-overlay";
        overlay.style.display = "none";

        var closeBtn = document.createElement("button");
        closeBtn.id = "close-info";
        closeBtn.innerHTML = "×";
        closeBtn.onclick = this.toggleInfo.bind(this);

        var content = document.createElement("div");
        content.id = "info-content";

        overlay.appendChild(closeBtn);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    },

    toggleInfo: function () {
        this.infoVisible = !this.infoVisible;
        var overlay = document.getElementById("info-overlay");
        var debugContent = document.getElementById("debug");

        if (this.infoVisible) {
            var content = document.getElementById("info-content");
            // Use cloneNode for safer DOM manipulation
            while (content.firstChild) {
                content.removeChild(content.firstChild);
            }
            var clonedContent = debugContent.cloneNode(true);
            clonedContent.id = "debug-clone";
            content.appendChild(clonedContent);
            overlay.style.display = "block";
        } else {
            overlay.style.display = "none";
        }
    },

    toggleFullscreen: function () {
        var elem = document.documentElement;

        if (!this.isFullscreen) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    },

    setupFullscreenListeners: function () {
        var self = this;
        var fullscreenChange = function () {
            self.isFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );

            if (self.isFullscreen) {
                document.body.classList.add("fullscreen-mode");
                self.resizeCanvas();
            } else {
                document.body.classList.remove("fullscreen-mode");
                self.resizeCanvas();
            }
        };

        document.addEventListener("fullscreenchange", fullscreenChange);
        document.addEventListener("webkitfullscreenchange", fullscreenChange);
        document.addEventListener("mozfullscreenchange", fullscreenChange);
        document.addEventListener("MSFullscreenChange", fullscreenChange);

        window.addEventListener("resize", this.resizeCanvas.bind(this));
    },

    resizeCanvas: function () {
        // Resize is handled by CSS, no need to resize canvas element
    },
};
