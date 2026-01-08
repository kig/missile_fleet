export const ControlledNode = Klass(CanvasNode, {
    rotation: 0,
    targetAngle: 0,
    sinceLastTick: 0.0,

    catchMouse: false,
    turningSpeed: 1,
    movementSpeed: 20,
    moveSpeedFactor: 0,
    frame: 0,
    id: 0,

    initialize: function () {
        this.id = ControlledNode.id++;
        CanvasNode.initialize.apply(this, arguments);
        this.addFrameListener(this.callAI);
        this.addFrameListener(this.updatePosition);
        this.addFrameListener(this.updateHealth);
    },

    callAI: function (t, dt) {
        if (this.root) {
            if (dt && !isNaN(dt)) this.sinceLastTick += dt;
            this.tick = this.sinceLastTick >= this.root.frameDuration;
            if (this.tick) this.sinceLastTick = 0.0;
        }

        if (this.tick) {
            if (this.frame % 10 == 0) {
                // stagger frames
                if (this.frame == 0)
                    this.frame += Math.floor(Math.random() * 10);
                this.moveSpeedFactor = 0;
                this.targetAngle = this.rotation;
                this.ai(t, dt);
            }
            this.hitDetect(t, dt);
            this.frame++;
        }
    },

    ai: function (t, dt) {},

    hitDetect: function (t, dt) {},

    predictAngleToTarget: function (speed) {
        var fx = Math.cos(this.target.rotation);
        var fy = Math.sin(this.target.rotation);
        var s = this.target.movementSpeed * this.target.moveSpeedFactor;
        var tv = [fx * s, fy * s];
        var d_px = this.target.x - this.x;
        var d_py = this.target.y - this.y;
        var a = d_px * d_px + d_py * d_py;
        var b = 2 * d_px * tv[0] + 2 * d_py * tv[1];
        var c = tv[0] * tv[0] + tv[1] * tv[1] - speed * speed;
        var d = b * b - 4 * a * c;
        if (d < 0) {
            return this.angleTo(this.target);
        }
        var t = (2 * a) / (-b + Math.sqrt(d));
        var est_p_t = [this.target.x + tv[0] * t, this.target.y + tv[1] * t];
        return Math.atan2(est_p_t[1] - this.y, est_p_t[0] - this.x);
    },

    turnToward: function (a) {
        this.targetAngle = a;
    },

    moveAt: function (speedFactor) {
        this.moveSpeedFactor = Math.min(1, Math.max(-1, speedFactor));
    },

    updateHealth: function (t, dt) {
        if (this.healthBar) {
            this.healthBar.width = Math.max(0, parseInt(this.health / 2.5));
            this.healthBar.opacity = this.opacity;
            this.healthBar.x = this.x;
            this.healthBar.y = this.y;
        }
    },

    updatePosition: function (t, dt) {
        var d = Curves.angularDistance(this.rotation, this.targetAngle);
        if (d > 0) d = Math.min(d, this.turningSpeed * (dt / 1000));
        else d = Math.max(d, -this.turningSpeed * (dt / 1000));
        this.rotation += d;
        var xf = Math.cos(this.rotation);
        var yf = Math.sin(this.rotation);
        this.x += xf * this.movementSpeed * this.moveSpeedFactor * (dt / 1000);
        this.y += yf * this.movementSpeed * this.moveSpeedFactor * (dt / 1000);
    },
});

