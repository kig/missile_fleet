export const TouchControls = {
    enabled: false,
    lastTap: 0,
    doubleTapDelay: 300,

    isTouchDevice: function () {
        return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    },

    init: function (canvas) {
        if (!this.isTouchDevice()) return;

        this.enabled = true;
        this.canvas = canvas;

        canvas.addEventListener(
            "touchstart",
            this.handleTouchStart.bind(this),
            { passive: false }
        );
        canvas.addEventListener("touchmove", this.handleTouchMove.bind(this), {
            passive: false,
        });
        canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), {
            passive: false,
        });
    },

    handleTouchStart: function (e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousedown", {
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0,
                bubbles: true,
            });
            this.canvas.dispatchEvent(mouseEvent);
            this.touchStartTime = Date.now();
        }
    },

    handleTouchMove: function (e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0,
                bubbles: true,
            });
            this.canvas.dispatchEvent(mouseEvent);

            // Create a custom drag event for CAKE compatibility
            var dragEvent = new CustomEvent("drag", {
                bubbles: true,
                detail: {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                },
            });
            this.canvas.dispatchEvent(dragEvent);
        }
    },

    handleTouchEnd: function (e) {
        e.preventDefault();
        var now = Date.now();
        var touchDuration = now - (this.touchStartTime || 0);

        // Only detect double-tap if it was a quick tap (not a drag)
        if (touchDuration < 200 && now - this.lastTap < this.doubleTapDelay) {
            Player.clearSelection();
            this.lastTap = 0;
            return; // Don't dispatch mouseup for double-tap
        } else if (touchDuration < 200) {
            this.lastTap = now;
        }

        var mouseEvent = new MouseEvent("mouseup", {
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY,
            button: 0,
            bubbles: true,
        });
        this.canvas.dispatchEvent(mouseEvent);
    },
};
