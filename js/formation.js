export const Formation = Klass({
    initialize: function () {
        this.ships = [];
        for (var i = 0; i < arguments.length; i++)
            this.ships.push(arguments[i]);
    },

    addShip: function (ship) {
        if (this.ships.indexOf(ship) == -1) this.ships.push(ship);
    },

    removeShip: function (ship) {
        this.ships.deleteFirst(ship);
    },

    formationFunction: function (ships) {
        return ships.map(function (s, i, th) {
            return [-70 * (i / 3), 70 * (i % 3)];
        });
    },

    setWaypoint: function (point, rotation) {
        var waypoints = this.formationFunction(this.ships);
        for (var i = 0; i < waypoints.length; i++) {
            var wp = waypoints[i];
            var ship = this.ships[i];
            var p = V.add(point, V.rotate(wp, rotation));
            ship.waypoint = { x: p[0], y: p[1], rotation: rotation };
        }
    },
});
