export const Explosion = Klass(CanvasNode, {
    catchMouse: false,
    cursor: "default",

    circleGradient: new Gradient({
        type: "radial",
        endRadius: 15,
        colorStops: [
            [0.0, "rgba(190,105,90,1)"],
            [0.25, "rgba(5,30,80,0.4)"],
            [1, "rgba(10,0,40,0)"],
        ],
    }),

    initialize: function (size) {
        CanvasNode.initialize.call(this);
        var main = new Circle(15);
        main.fill = this.circleGradient;
        main.compositeOperation = "lighter";
        this.zIndex = 10;
        this.main = main;
        this.append(main);
        this.size = size;
        this.addFrameListener(this.blowup);
        this.after(500, this.removeSelf);
    },

    blowup: function (t, dt) {
        if (this.startTime == null) this.startTime = t;
        var elapsed = Math.min(500, t - this.startTime);
        var fac = 0.48 * 0.004 * Math.PI;
        this.main.scale =
            1 +
            this.size *
                (Explosion.fastExplosions ? 1 : Math.tan(elapsed * fac));
        if (isNaN(this.main.scale)) this.main.scale = 60000;
    },
});

