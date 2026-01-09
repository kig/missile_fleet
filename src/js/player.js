import { Formation } from "./formation.js";

export const Player = function (t, td) {
    this.target = Player.targets[this.id];
    var th = this;
    if (
        Player.useTargettingAI &&
        (!Player.targets[this.id] || this.target.health <= 0) &&
        (!this.target ||
            this.target.health <= 0 ||
            (Math.random() < 0.3 &&
                this.distanceTo(this.target) > this.weapon.range))
    ) {
        this.target = this.enemies.sort(function (a, b) {
            return (
                Math.abs(th.weapon.optimalRange - th.distanceTo(a)) -
                Math.abs(th.weapon.optimalRange - th.distanceTo(b))
            );
        })[0];
    }
    if (!this.movementMode) this.movementMode = "normal"; // (this.weapon instanceof Railgun ? 'defensive' : 'normal')
    if (Player.useMovementAI && this.movementMode != "manual") {
        if (!this.waypoint && this.target && this.target.health > 0) {
            var angle = this.angleTo(this.target);
            var distance = this.distanceTo(this.target);
            var inRange = distance < this.weapon.range;
            var optimumRange = distance < this.weapon.optimalRange;
            var targetInRange =
                this.target.weapon && distance < this.target.weapon.range;
            // don't run towards CPU targets
            if (
                this.movementMode != "defensive" &&
                (this.movementMode == "aggressive" ||
                    Player.targets[this.id] == this.target)
            ) {
                this.turnToward(angle);
                if (inRange) this.turnToward(angle + Math.PI / 6);
                if (optimumRange) this.turnToward(angle + Math.PI);
                this.moveAt(1);
            }
            // run away from CPU targets that we can snipe
            if (inRange && !targetInRange) {
                this.turnToward(angle + Math.PI);
                this.moveAt(1);
            }
        }
    }
};
Player.useMovementAI = true;
Player.useTargettingAI = true;
Player.targets = {};
Player.selection = [];
Player.toggleSelect = function (s) {
    if (this.selection.indexOf(s.id) == -1) this.select(s);
    else this.deselect(s);
};
Player.clearSelection = function () {
    var dict = this.selection.dict;
    while (this.selection.length > 0) {
        this.deselect(this.selection.dict[this.selection[0]]);
    }
};
Player.select = function (s) {
    if (!this.selection.dict) this.selection.dict = {};
    if (!this.selection.formation) this.selection.formation = new Formation();
    s.root.dispatchEvent({ type: "select", canvasTarget: s });
    this.selection.dict[s.id] = s;
    this.selection.formation.addShip(s);
    this.selection.push(s.id);
};
Player.deselect = function (s) {
    if (!this.selection.dict) this.selection.dict = {};
    if (!this.selection.formation) this.selection.formation = new Formation();
    s.root.dispatchEvent({ type: "deselect", canvasTarget: s });
    delete this.selection.dict[s.id];
    this.selection.formation.removeShip(s);
    this.selection.deleteFirst(s.id);
};
Player.setWaypoint = function (wp) {
    if (!this.selection.formation) this.selection.formation = new Formation();
    var sc = this.getSelectionCenter();
    var rotation = Curves.lineAngle(sc, wp);
    this.selection.formation.setWaypoint(wp, rotation);
};
Player.getSelectionCenter = function () {
    var x = 0;
    var y = 0;
    for (var i = 0; i < this.selection.length; i++) {
        var s = this.selection.dict[this.selection[i]];
        x += s.x;
        y += s.y;
    }
    return [x / this.selection.length, y / this.selection.length];
};
Player.setTarget = function (t) {
    this.selection.forEach(function (s) {
        if (Player.useMovementAI) delete Player.selection.dict[s].waypoint;
        Player.targets[s] = t;
    });
};
