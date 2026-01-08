import { ControlledNode } from "./controlled_node.js";
import { Player } from "./player.js";
import { SELECT_CURSOR, TARGET_CURSOR, DEFAULT_CURSOR } from "./main.js";
import { Explosion } from "./explosion.js";

export const Ship = Klass(ControlledNode, {
    isShip: true,
    target: null,
    health: 100,
    catchMouse: true,

    turningSpeed: 1,
    movementSpeed: 40,
    z: 0,

    initialize: function (color, weapon, pointDefense, x, y, noWarp, health) {
        ControlledNode.initialize.call(this);
        this.zIndex = 0 + 0.001 * (Ship.z++ % 1000);
        this.stroke = color;
        this.team = color;
        this.weapon = weapon;
        this.weapon.ship = this;
        this.pointDefense = pointDefense;
        this.pointDefense.ship = this;
        this.x = x;
        this.y = y;
        if (health) this.health = health;
        this.rotation = Math.random() * Math.PI * 2;
        this.model = new Polygon([20, 0, -10, 15, -10, -15]);
        this.model.strokeWidth = 2;
        //this.core = new Circle(5)
        this.hardpoint = this.model.clone();
        Object.extend(this.hardpoint, {
            scale: 0.2 + this.weapon.techLevel * 0.1,
            centered: true,
            stroke: false,
            fill: this.weapon.color,
            weapon: this.weapon,
        });
        this.hardpoint.addFrameListener(function () {
            this.fill = this.weapon.color;
            this.scale = 0.2 + this.weapon.techLevel * 0.1;
        }, false);
        this.append(this.weapon);
        this.append(this.pointDefense);
        this.model.append(this.hardpoint);
        this.append(this.model);
        this.healthBar = new Rectangle(20, 2, {
            fill: color,
            stroke: false,
            centered: true,
            cy: 30,
        });
        this.selected = new Circle(35, { opacity: 0 });
        this.targetMarker = new Rectangle(40, 40, {
            rotation: Math.PI / 4,
            centered: true,
            stroke: this.stroke,
            visible: false,
            opacity: 0.5,
            catchMouse: false,
        });
        this.targetLine = new Line(0, 0, 0, 0, {
            stroke: this.stroke,
            visible: false,
            opacity: 0.5,
            catchMouse: false,
        });
        this.waypointLine = new Line(0, 0, 0, 0, {
            stroke: "#448866",
            visible: false,
            opacity: 0.5,
            catchMouse: false,
        });
        this.append(this.selected);
        if (!this.maxHealth) this.maxHealth = this.health;
        this.addEventListener(
            "mousedown",
            function (ev) {
                if (this.strategicAI == Player) {
                    if (!ev.shiftKey) Player.clearSelection();
                    Player.toggleSelect(this);
                } else {
                    Player.setTarget(this);
                }
            },
            false
        );
        this.addEventListener(
            "select",
            function (ev) {
                this.selected.opacity = 0.5;
                this.waypointLine.opacity = 0.5;
                this.targetLine.opacity = 0.5;
            },
            false
        );
        this.addEventListener(
            "deselect",
            function (ev) {
                this.selected.opacity = 0;
                this.waypointLine.opacity = 0.15;
                this.targetLine.opacity = 0.1;
            },
            false
        );
        if (!noWarp) this.warpIn();
    },

    warpIn: function () {
        this.opacity = 0;
        this.aiDisabled = true;
        this.warpModel = new Spiral(0, { stroke: "blue", zIndex: -1 });
        this.warpModel.animateTo("endAngle", 40, 500, "square");
        this.warpModel.after(500, function () {
            this.animateTo("endAngle", 0, 500, "square");
            this.after(500, this.removeSelf);
        });
        this.animateTo("opacity", 1, 1000, "sine");
        this.model.animate("rotation", -10, 0, 1000, "sqrt");
        this.after(1000, function () {
            this.aiDisabled = false;
        });
        //         this.append(this.warpModel)
    },

    /**
        Tactical AI:
          - takes care of point defense
          - fires guns at the current target
          - steers the vessel towards current waypoint
      */
    tacticalAI: function (t, dt) {
        if (this.aiDisabled) return;
        var siblings = this.parentNode.childNodes;
        var th = this;
        var targets = [];
        if (this.pointDefense.readyToFire) {
            var missiles = siblings.filter(function (s) {
                return s.isMissile;
            });
            var incoming = missiles
                .filter(function (s) {
                    return s.target.team == th.team;
                })
                .sort(function (a, b) {
                    return (
                        th.pointDefense.optimalRange -
                        Math.abs(th.distanceTo(a) - th.distanceTo(b))
                    );
                });
            var threats = incoming
                .filter(function (s) {
                    return s.target == th;
                })
                .sort(function (a, b) {
                    return (
                        Math.abs(
                            th.pointDefense.optimalRange - th.distanceTo(a)
                        ) -
                        Math.abs(
                            th.pointDefense.optimalRange - th.distanceTo(b)
                        )
                    );
                });
            var targets = threats
                .concat(incoming)
                .concat(this.enemies)
                .filter(function (s) {
                    return (
                        (!s.target || s.target.health > 0) &&
                        (s.isMissile
                            ? th.distanceTo(s) < th.pointDefense.range
                            : th.distanceTo(s) < th.pointDefense.optimalRange)
                    );
                });
            this.intercept(targets);
        }
        var target = this.target || targets[0];
        if (target && target.health > 0) {
            var distance = this.distanceTo(target);
            if (distance < this.weapon.range && this.weapon.readyToFire) {
                if (Math.random() < 0.7) this.fireAt(target);
            }
        }
        if (this.waypoint) {
            if (this.distanceTo(this.waypoint) < 5) {
                this.moveAt(0);
                if (
                    Math.abs(
                        Curves.angularDistance(
                            this.rotation,
                            this.waypoint.rotation
                        )
                    ) < 0.1
                )
                    delete this.waypoint;
                else this.turnToward(this.waypoint.rotation);
            } else {
                this.turnToward(this.angleTo(this.waypoint));
                this.moveAt(
                    this.distanceTo(this.waypoint) / this.movementSpeed
                );
            }
        }
    },

    /**
        Strategic AI:
          - sets the main gun target
          - sets waypoints
      */
    strategicAI: function (t, dt) {
        if (this.aiDisabled) return;
        var th = this;
        if (
            !this.target ||
            this.target.health <= 0 ||
            (Math.random() < 0.3 &&
                this.distanceTo(this.target) > this.weapon.range)
        ) {
            this.target = this.enemies.sort(function (a, b) {
                return (
                    Math.abs(th.weapon.optimalRange - th.distanceTo(a)) -
                    Math.abs(th.weapon.optimalRange - th.distanceTo(b))
                );
            })[0];
        }
        if (this.target && this.target.health > 0) {
            var angle = this.angleTo(this.target);
            var distance = this.distanceTo(this.target);
            if (distance < this.weapon.range) {
                this.turnToward(angle + Math.PI / 6);
            } else if (distance > this.weapon.optimalRange) {
                this.turnToward(angle);
            } else if (Math.random() < 0.8) {
                this.turnToward(angle + Math.PI / 2);
            }
            if (distance < this.weapon.optimalRange) {
                this.turnToward(angle + Math.PI * 0.85);
            }
            this.moveAt(1);
        }
    },

    hitDetect: function (t, dt) {
        ControlledNode.hitDetect.apply(this, arguments);
        if (this.health <= 0) {
            Player.deselect(this);
            this.selected.opacity = 0;
            this.targetLine.removeSelf();
            this.targetMarker.removeSelf();
            this.waypointLine.removeSelf();
            this.healthBar.removeSelf();
        } else {
            // FIXME Make the target marker fly to target with a spin
            if (this.healthBar.parent != this.parent)
                this.parent.append(this.healthBar);
            if (this.strategicAI == Player) this.cursor = SELECT_CURSOR;
            else if (Player.selection.length > 0) this.cursor = TARGET_CURSOR;
            else this.cursor = DEFAULT_CURSOR;
            this.healthBar.cursor = this.cursor;
            if (
                this.target &&
                this.target.health > 0 &&
                (this.strategicAI == Player ||
                    this.target.strategicAI == Player)
            ) {
                if (!this.targetMarker.parent)
                    this.parent.append(this.targetMarker, this.targetLine);
                this.targetLine.x1 = this.x;
                this.targetLine.y1 = this.y;
                this.targetLine.x2 = this.targetMarker.x = this.target.x;
                this.targetLine.y2 = this.targetMarker.y = this.target.y;
                this.targetLine.visible =
                    Player.targets[this.id] == this.target && !this.waypoint;
                this.targetMarker.visible = true;
            } else {
                this.targetLine.visible = this.targetMarker.visible = false;
            }
            if (this.waypoint && this.strategicAI == Player) {
                if (!this.waypointLine.parent)
                    this.parent.append(this.waypointLine);
                this.waypointLine.x1 = this.x;
                this.waypointLine.y1 = this.y;
                this.waypointLine.x2 = this.waypoint.x;
                this.waypointLine.y2 = this.waypoint.y;
                this.waypointLine.visible = true;
            } else {
                this.waypointLine.visible = false;
            }
        }
    },

    ai: function (t, dt) {
        // don't leave the mission area lest you wish to die
        if (
            this.x < -50 ||
            this.y < -50 ||
            this.x > this.parent.width + 50 ||
            this.y > this.parent.height + 50
        )
            this.health -= 3;

        if (this.health > 0) {
            var siblings = this.parentNode.childNodes;
            var th = this;
            this.enemies = siblings.filter(function (s) {
                return s.isShip && s.team != th.team;
            });
            this.friends = siblings.filter(function (s) {
                return s.isShip && s.team == th.team;
            });
            this.strategicAI(t, dt);
            this.tacticalAI(t, dt);
        } else if (!this.blowup) {
            var sz = (this.maxHealth / 20) * (1 + 0.1 * this.weapon.techLevel);
            var ex = new Explosion(0.25 * sz + Math.random());
            ex.x = this.x;
            ex.y = this.y;
            this.parent.append(ex);
            var exps = sz * 0.2 + Math.random() * sz;
            var ssz = Math.sqrt(sz / 5);
            for (var i = 0; i < exps; i++) {
                this.parent.after(
                    200 + i * 60 * Math.random(),
                    (function (i) {
                        return function () {
                            var e = new Explosion((Math.random() * sz) / 5);
                            var dx = Math.random();
                            dx *= dx;
                            dx += i / exps;
                            dx *= Math.random() < 0.5 ? -1 : 1;
                            e.x = ex.x + dx * 5 * sz;
                            var dx = Math.random();
                            dx *= dx;
                            dx += i / exps;
                            dx *= Math.random() < 0.5 ? -1 : 1;
                            e.y = ex.y + dx * 5 * sz;
                            this.append(e);
                        };
                    })(i)
                );
            }
            this.root.dispatchEvent({ type: "destroyed", canvasTarget: this });
            this.removeSelf();
            this.blowup = true;
        }
    },

    intercept: function (targets) {
        if (targets.length == 0) return;
        var i = 0;
        var j = 0;
        while (this.pointDefense.readyToFire) {
            this.pointDefense.fireAt(targets[i]);
            i = (i + 1) % targets.length;
            if (i == 0) j++;
            if (j == 1) return;
        }
    },

    firedShots: 0,
    fireAt: function (target) {
        for (var i = 0; i < this.weapon.salvos / 4; i++) {
            if (this.weapon.readyToFire) {
                this.weapon.rotation = Math.PI * ((this.firedShots % 2) - 0.5);
                this.weapon.fireAt(target);
                this.firedShots++;
            }
        }
    },
});

