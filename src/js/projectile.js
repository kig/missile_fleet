import { ControlledNode } from "./controlled_node.js";
import { Explosion } from "./explosion.js";

export const Projectile = Klass(ControlledNode, {
    zIndex: 2,
    catchMouse: false,

    initialize: function (target, weapon, x, y, rot) {
        this.targetingFunction = this.angleTo;
        Object.extend(this, weapon);
        ControlledNode.initialize.call(this);
        this.elapsed = 0;
        this.owner = weapon;
        this.target = target;
        this.x = x;
        this.y = y;
        this.rotation = rot;
        this.model = new Rectangle(this.movementSpeed / 16, this.height, {
            centered: true,
        });
        this.append(this.model);
        this.fill = this.color;
        if (this.projectileHealth) this.health = this.projectileHealth;
        this.maxHealth = this.health;
        this.initAI();
    },

    selfDestruct: function () {
        if (!this.parent) return;
        var ex = new Explosion(this.maxHealth * 0.01);
        ex.x = this.x;
        ex.y = this.y;
        this.parent.append(ex);
        this.removeSelf();
        return false;
    },

    ai: function (t, dt) {
        if (!this.target) return;
        var angle = this.targetingFunction(this.target);
        this.turnToward(angle);
        this.moveAt(1);
    },

    hitDetect: function (t, dt) {
        var targetAlive = this.target.health > 0;
        this.elapsed += dt;
        if (!this.target) return;
        var distance = this.distanceTo(this.target);
        if (distance < this.hitRadius) this.hit();
        if (targetAlive && this.target.health <= 0)
            this.owner.gainExp(this.target);
        if (this.health <= 0) return this.selfDestruct();
        return true;
    },

    hit: function () {
        this.target.health -= this.damage;
        this.health -= this.hitDamageToSelf;
        var ex = new Explosion(this.damage * 0.01);
        ex.x = this.x;
        ex.y = this.y;
        this.parent.append(ex);
    },
});

