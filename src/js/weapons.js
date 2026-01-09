import { Projectile } from "./projectile.js";
import { Explosion } from "./explosion.js";

export const Weapon = Klass(CanvasNode, {
    catchMouse: false,
    movementSpeed: 100,
    turningSpeed: 1,
    health: 20,
    projectileHealth: 1,
    hitDamageToSelf: 1,
    range: 200,
    optimalRange: 100,
    reloadTime: 1000,
    salvos: 5,
    techLevel: 0,
    rotation: 0,
    height: 2,
    color: "white",
    x: 0,
    y: 0,
    rotation: 0,
    projectile: Projectile,
    readyToFire: true,

    initialize: function (techLevel) {
        CanvasNode.initialize.call(this);
        this.freeSalvos = this.salvos;
        if (techLevel) this.techLevel = techLevel;
    },

    gainExp: function (target) {
        var targetTech = target.techLevel;
        if (target.weapon) targetTech = target.weapon.techLevel;
        else if (target.damage) targetTech *= 0.02 * Math.max(1, target.damage);
        //         this.techLevel += 0.5 * ((targetTech+1) / (this.techLevel+1))
    },

    fireAt: function (target) {
        if (this.freeSalvos < 1) return false;
        this.freeSalvos--;
        this.rx = this.x + this.ship.x;
        this.ry = this.y + this.ship.y;
        this.rrot = this.rotation + this.ship.rotation;
        var proj = this.createProjectile(target);
        this.ship.parent.append(proj);
        this.after(this.reloadTime, this.reload);
        this.readyToFire = this.freeSalvos > 0;
    },

    reload: function () {
        this.freeSalvos++;
        this.readyToFire = this.freeSalvos > 0;
    },

    createProjectile: function (target) {
        return new this.projectile(target, this, this.rx, this.ry, this.rrot);
    },
});

export const RapidFireRailgun = Klass(Weapon, {
    isMissile: true,
    movementSpeed: 500,
    turningSpeed: 0,
    projectileHealth: 1,
    hitRadius: 10,
    damage: 100,
    range: 500,
    optimalRange: 250,
    reloadTime: 200,
    salvos: 1,
    color: "#5533ff",
    height: 2,
    damageType: "kinetic",

    initAI: function () {
        this.rotation = this.predictAngleToTarget(this.movementSpeed);
        this.reloadTime *= Math.pow(0.8, this.techLevel);
        this.movementSpeed *= Math.pow(1.1, this.techLevel);
        this.hitRadius *= Math.pow(1.1, this.techLevel);
        this.range *= Math.pow(1.1, this.techLevel);
        this.after(1000, this.removeSelf);
        var smoke = new CanvasNode({
            stroke: "#ba88ba",
            x: this.x,
            y: this.y,
            rotation: this.rotation,
        });
        var x = 40 + Math.random() * 10;
        smoke.append(new Circle(5, { x: x, scale: [0.2, 1] }));
        smoke.animate("opacity", 0.7, 0, 300, "sqrt");
        smoke.childNodes[0].animateTo(
            "x",
            x - this.movementSpeed * 0.01,
            300,
            "sqrt"
        );
        smoke.childNodes[0].animateToFactor(
            "scale",
            1 + this.movementSpeed * (0.004 + Math.random() * 0.003),
            300,
            "sqrt"
        );
        smoke.after(300, smoke.removeSelf);
        this.afterFrame(1, function () {
            if (this.parentNode) this.parentNode.append(smoke);
        });
    },

    ai: function (t, dt) {
        this.moveAt(1);
    },
    hit: function () {
        Projectile.hit.apply(this, arguments);
        var rs = Math.max(
            0,
            this.movementSpeed *
                this.moveSpeedFactor *
                (0.5 + 0.5 * Math.random())
        );
        var streak = new CanvasNode({
            x: this.x,
            y: this.y,
            rotation: this.rotation,
        });
        streak.after(300, streak.removeSelf);
        this.parent.append(streak);
        var c = new Circle(6, {
            x: 30,
            scale: [0.2, 1],
            strokeWidth: 5,
            fill: "none",
            stroke: "#ba88ba",
        });
        if (rs <= 1) rs = 1;
        c.animateTo("x", 30 + rs * 0.04, rs * 0.4, "sqrt");
        c.animateToFactor(
            "radius",
            2 + rs * 0.005 * Math.random() * 2,
            rs * 0.3,
            "sqrt"
        );
        c.animate("opacity", 1, 0, rs * 0.4, "sqrt");
        streak.append(c);
    },
});

export const Missiles = Klass(Weapon, {
    isMissile: true,
    movementSpeed: 160,
    turningSpeed: 3,
    projectileHealth: 1,
    hitRadius: 10,
    damage: 20,
    range: 500,
    optimalRange: 250,
    reloadTime: 3000,
    salvos: 8,
    color: "#22ccff",
    height: 1.5,
    damageType: "explosive",

    initAI: function () {
        this.model.width *= 2;
        this.reloadTime *= Math.pow(0.8, this.techLevel);
        this.turningSpeed *= Math.pow(1.1, this.techLevel);
        this.movementSpeed *= Math.pow(1.1, this.techLevel);
        this.damage *= Math.pow(1.25, this.techLevel);
        if (this.techLevel >= 4) {
            this.salvos += 2;
            this.targetingFunction = this.predictAngleTo;
        }
        this.after(5000, this.removeSelf);
    },

    predictAngleTo: function (target) {
        return this.predictAngleToTarget(this.movementSpeed);
    },

    hitDetect: function (t, dt) {
        if (!this.target) return;
        if (!Projectile.hitDetect.apply(this, arguments)) return false;
        this.movementSpeed += dt * 0.06;
        var distance = this.distanceTo(this.target);
        if (distance < 75) {
            // last sprint with low-latency tracking
            if (this.techLevel >= 3) {
                var angle = this.targetingFunction(this.target);
                this.turnToward(angle);
            }
        } else if (distance < 150) {
            // try to dodge point defense
            if (this.techLevel >= 3) {
                this.targetAngle +=
                    (Math.random() - 0.5) * 0.4 * Math.max(1, distance) * 0.01;
            }
        }
    },

    hit: function () {
        Projectile.hit.apply(this, arguments);
        if (!Explosion.fastExplosions) {
            var streak = new Circle(Math.random() * 4 + this.damage * 0.18, {
                rotation: this.rotation,
                x: this.x,
                y: this.y,
                strokeWidth: 1.5,
                scale: [0.5 + Math.random() * 0.5, 1],
                stroke: "#da88fa",
            });
            streak.animate("opacity", 0.8, 0, 400, "sqrt");
            streak.animateToFactor("scale", 5, 400, "sqrt");
            streak.after(400, streak.removeSelf);
            this.parent.append(streak);
        }
    },
});

export const Beam = Klass(Weapon, {
    movementSpeed: 200,
    turningSpeed: 6,
    health: 1,
    range: 200,
    optimalRange: 50,
    reloadTime: 500,
    hitRadius: 6,
    damage: 15,
    salvos: 5,
    color: "#cc44ff",
    sdTime: 1250,
    height: 1,
    isMissile: true,
    damageType: "electric",

    initAI: function () {
        this.after(this.sdTime, this.removeSelf);
        this.range *= Math.pow(1.1, this.techLevel);
        this.movementSpeed *= Math.pow(1.1, this.techLevel);
        this.reloadTime *= Math.pow(0.9, this.techLevel);
        this.damage *= Math.pow(1.1, this.techLevel);
        if (this.techLevel >= 1) {
            this.turningSpeed *= 1.5;
        }
        if (this.techLevel >= 2) {
            this.hitRadius *= 1.5;
        }
        if (this.techLevel >= 3) {
            this.range *= 1.25;
            this.rotation = this.predictAngleToTarget(this.movementSpeed);
        } else {
            this.rotation = this.angleTo(this.target);
        }
        if (this.techLevel >= 4) {
            this.damage *= 1.5;
            this.turningSpeed *= 1.5;
        }
        this.rotation += 0.5 * (Math.random() - 0.5);
    },

    ai: function (t, dt) {
        var angle = this.angleTo(this.target);
        var distance = this.distanceTo(this.target);
        this.turnToward(angle);
        this.moveAt(1);
        if (distance < 100 && this.target.health > 0 && Math.random() < 0.5) {
            var nst = this.sdTime - this.elapsed - 250;
            if (nst > 0) {
                var subBeam = new Projectile(
                    this.target,
                    this,
                    this.x,
                    this.y,
                    this.rotation
                );
                subBeam.sdTime = nst;
                subBeam.after(subBeam.sdTime, subBeam.removeSelf);
                subBeam.rotation += Math.random() * 2 - 1;
                this.parentNode.append(subBeam);
            }
        }
    },

    hitDetect: function (t, dt) {
        if (Beam.fastBeams && this.target.health <= 0) return this.removeSelf();
        Projectile.hitDetect.apply(this, arguments);
    },

    hit: function () {
        var bonus = 10 * (1 - this.elapsed / (this.sdTime + 1));
        this.target.health -= this.damage + bonus;
        this.health = 0;
        if (!Beam.fastBeams) {
            var dp = Math.max(0, this.damage + bonus);
            if (dp > this.target.maxHealth) dp = this.target.maxHealth;
            var streak = new Circle(Math.random() * 5 + dp * 0.1, {
                rotation: this.rotation,
                x: this.x,
                y: this.y,
                strokeWidth: 1,
                scale: 1,
                compositeOperation: "lighter",
                stroke: "#a500a5",
            });
            streak.animate("opacity", 0.8, 0, 300, "sqrt");
            streak.animateToFactor("scale", 5, 300, "sqrt");
            streak.after(300, streak.removeSelf);
            this.parent.append(streak);
        }
    },
});

export const Railgun = Klass(Weapon, {
    isMissile: true,
    movementSpeed: 550,
    turningSpeed: 0.2,
    projectileHealth: 5,
    range: 600,
    optimalRange: 400,
    reloadTime: 4000,
    salvos: 1,
    color: "orange",
    hitRadius: 10,
    damageType: "kinetic",

    initAI: function () {
        var dx = Math.cos(this.ship.rotation);
        var dy = Math.sin(this.ship.rotation);
        this.x += dx * 4;
        this.y += dy * 4;
        this.rotation =
            this.predictAngleToTarget(this.movementSpeed) +
            (Math.random() - 0.5) * 0.2 * (1 / (1 + this.techLevel));
        if (this.techLevel >= 1) {
            this.movementSpeed += 50;
            this.reloadTime *= 0.75;
        }
        if (this.techLevel >= 2) {
            this.turningSpeed *= 1.5;
        }
        if (this.techLevel >= 3) {
            this.movementSpeed *= 1.2;
            this.hitRadius *= 1.2;
            this.range *= 1.2;
        }
        if (this.techLevel >= 4) {
            this.movementSpeed *= 1.3;
            this.hitRadius *= 1.3;
            this.range *= 1.4;
            this.reloadTime *= 0.66;
        }
        var compressionWave = new CanvasNode({
            scale: [0.2, 0.8],
            stroke: "#ba88ba",
            strokeWidth: 2,
            x: this.x,
            y: this.y,
            rotation: this.rotation,
        });
        compressionWave.append(new Circle(30, { x: 60 }));
        var dur = 400;
        compressionWave.animateToFactor(
            "scale",
            1.4 + this.movementSpeed * 0.001,
            dur,
            "sqrt"
        );
        compressionWave.animate("opacity", 1, 0, dur, "sqrt");
        compressionWave.after(dur, compressionWave.removeSelf);
        var smoke = new CanvasNode({
            fill: "#ba88ba",
            x: this.x,
            y: this.y,
            rotation: this.rotation,
        });
        smoke.append(
            new Rectangle(this.movementSpeed / 40, 2, { centered: true })
        );
        smoke.animate("opacity", 1, 0, 600, "sqrt");
        smoke.childNodes[0].animateTo(
            "x",
            -this.movementSpeed * 0.1,
            600,
            "sqrt"
        );
        smoke.after(600, smoke.removeSelf);
        this.afterFrame(1, function () {
            this.parentNode.append(compressionWave);
            this.parentNode.append(smoke);
        });
        this.after(3000, this.removeSelf);
    },

    ai: function (t, dt) {
        this.moveAt(1 - Math.sqrt(this.elapsed / 6000));
        var angle = this.predictAngleToTarget(
            this.movementSpeed * this.moveSpeedFactor
        );
        this.turnToward(angle);
    },

    hit: function () {
        var rs = Math.max(0, this.movementSpeed * this.moveSpeedFactor);
        var streak = new CanvasNode({
            x: this.x,
            y: this.y,
            rotation: this.rotation,
        });
        streak.after(300, streak.removeSelf);
        this.parent.append(streak);
        this.rotation += (Math.random() - 0.5) * (1 - rs * 0.0015);
        this.elapsed += 500;
        var dmg = Math.abs(rs * 0.5);
        this.target.health -= dmg;
        var ex = new Explosion(0.25); //dmg / 100)
        ex.x = this.x;
        ex.y = this.y;
        this.parent.append(ex);
        this.fill = "darkred";
        this.health -= 2;
        this.model.height = 1;
        if (!this.hasHit) {
            var c = new Circle(10, {
                x: 30,
                scale: [0.2, 1],
                strokeWidth: 5,
                fill: "none",
                stroke: "#ba88ba",
            });
            if (rs <= 1) rs = 1;
            c.animateTo("x", 30 + rs * 0.03, 300, "sqrt");
            c.animateToFactor("radius", 2 + rs * 0.005, 300, "sqrt");
            c.animate("opacity", 1, 0, 300, "sqrt");
            streak.append(c);
        }
        this.hasHit = true;
    },
});

export const PointDefenseMissiles = Klass(Weapon, {
    movementSpeed: 250,
    turningSpeed: 3,
    health: 1,
    range: 250,
    optimalRange: 30,
    reloadTime: 500,
    damage: 4,
    hitRadius: 9,
    height: 1,
    salvos: 2,
    color: "#dd2222",
    damageType: "explosive",

    initAI: function () {
        this.rotation =
            this.predictAngleToTarget(this.movementSpeed) +
            (Math.random() - 0.5);
        this.reloadTime *= Math.pow(0.9, this.techLevel);
        this.turningSpeed *= Math.pow(1.2, this.techLevel);
        this.movementSpeed *= Math.pow(1.1, this.techLevel);
        this.after(1400, this.removeSelf);
    },

    ai: function (t, dt) {
        var angle = this.angleTo(this.target);
        this.turnToward(angle);
        this.moveAt(1 - Math.sqrt(this.elapsed / 6000));
    },

    hit: function () {
        this.target.rotation += Math.random() * 0.5 - 0.25;
        this.target.movementSpeed *= 1 - 2 / this.target.health;
        this.target.health -= this.damage;
        this.health = 0;
    },
});

export const PointDefenseGun = Klass(Weapon, {
    movementSpeed: 450,
    turningSpeed: 0,
    health: 1,
    range: 150,
    height: 1,
    optimalRange: 30,
    reloadTime: 20,
    hitRadius: 5,
    damage: 2,
    salvos: 2,
    color: "#dd2222",
    damageType: "kinetic",

    initAI: function () {
        this.x += Math.cos(this.ship.rotation) * 20;
        this.y += Math.sin(this.ship.rotation) * 20;
        this.model.width = 4;
        this.hitRadius += this.techLevel;
        if (this.techLevel >= 2) {
            this.rotation = this.predictAngleToTarget(this.movementSpeed);
        } else {
            this.rotation = this.angleTo(this.target);
        }
        this.after(600, this.removeSelf);
    },

    ai: function (t, dt) {
        this.moveAt(1 - Math.sqrt(this.elapsed / 1200));
    },

    hit: function () {
        this.target.rotation += Math.random() * 0.5 - 0.25;
        this.target.movementSpeed *= 1 - 1 / this.target.health;
        this.target.health -= this.damage;
        this.health = 0;
    },
});
