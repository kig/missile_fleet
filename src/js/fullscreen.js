

export const FullscreenMode = {
    isFullscreen: false,

    init: function (canvas) {
        this.canvas = canvas;
        this.createButtons();
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
        infoBtn.onclick = (ev) => {
            ev.preventDefault();
            document.getElementById("info-overlay").classList.remove('hidden');
        };
        var closeInfoBtn = document.getElementById("close-info");
        closeInfoBtn.onclick = (ev) => {
            ev.preventDefault();
            document.getElementById("info-overlay").classList.add('hidden');
        };

        container.appendChild(fullscreenBtn);
        container.appendChild(infoBtn);
        document.body.appendChild(container);
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
            } else {
                document.body.classList.remove("fullscreen-mode");
            }
        };

        document.addEventListener("fullscreenchange", fullscreenChange);
        document.addEventListener("webkitfullscreenchange", fullscreenChange);
        document.addEventListener("mozfullscreenchange", fullscreenChange);
        document.addEventListener("MSFullscreenChange", fullscreenChange);
    }
};
