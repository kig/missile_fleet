
import { Level } from "./level.js";

import { Beam, Missiles, Railgun, RapidFireRailgun, PointDefenseGun, PointDefenseMissiles } from "./weapons.js";
import { Ship } from "./ship.js";
import { MissileFleet } from "./main.js";

export const Level1 = Klass(Level, {
    width: 640,
    height: 480,
    scale: 1,

    name: "Run like the wind",
    description: "Try not to get blown up.",

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.shipAfter(0, this.playerTeam, 0, Missiles, 100, 100);
            this.shipAfter(
                5000,
                this.enemyTeam,
                0,
                PointDefenseGun,
                680,
                300,
                true
            );
            this.shipAfter(
                10000,
                this.enemyTeam,
                0,
                PointDefenseMissiles,
                -40,
                220,
                true
            );
            this.shipAfter(
                15000,
                this.enemyTeam,
                0,
                [Beam, PointDefenseGun],
                400,
                520,
                true
            );
        });
    },
});

export const Level2 = Klass(Level, {
    width: 1280,
    height: 960,
    scale: 0.5,

    name: "What doesn't hit you, can't hurt you",
    description: "Take care not to get overwhelmed.",

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.shipAfter(500, this.playerTeam, 1, Beam, 700, 500);
            this.shipAfter(1000, this.playerTeam, 1, Beam, 600, 300);
            this.notify("Reinforcements are on the way", 20000);
            this.shipAfter(23000, this.playerTeam, 1, Beam, 640, 480);

            this.shipAfter(3000, this.enemyTeam, 0, Missiles, 1320, 800);
            this.shipAfter(17000, this.enemyTeam, 0, Missiles, 1100, -40);
            this.shipAfter(32000, this.enemyTeam, 0, Missiles, 810, 1000);

            this.shipAfter(6000, this.enemyTeam, 0, Missiles, -40, 300);
            this.shipAfter(22000, this.enemyTeam, 0, Missiles, 200, 1000);
            this.shipAfter(
                24000,
                this.enemyTeam,
                0,
                PointDefenseGun,
                100,
                1000
            );
        });
    },
});

export const Level3 = Klass(Level, {
    width: 1280,
    height: 960,
    scale: 0.5,

    name: "Formation",
    description: "It may be a bit tricky, luck helps.",

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.ship(this.playerTeam, 2, Railgun, 600, 400);
            this.ship(this.playerTeam, 0, Missiles, 650, 460);
            this.groupAfter(5000, this.enemyTeam, 1, 400, -40, [Beam, Beam]);
            this.groupAfter(25000, this.enemyTeam, 0, -40, 520, [Beam, Beam]);
            this.shipAfter(15000, this.enemyTeam, 3, Missiles, 1310, 1000);
        });
    },
});

export const Level4 = Klass(Level, {
    name: "Against smaller numbers",
    description: "This should be easy, right?",

    reinforcementMessage: "Reinforcements are on the way.",

    width: 1280,
    height: 960,
    scale: 0.5,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.group(
                this.enemyTeam,
                1,
                1000,
                180,
                [Beam, Missiles, Railgun],
                true
            );
            this.groupAfter(2500, this.playerTeam, 1, 200, 800, [
                Missiles,
                PointDefenseMissiles,
                PointDefenseMissiles,
                PointDefenseGun,
                PointDefenseGun,
                PointDefenseGun,
            ]);
            this.notify(this.reinforcementMessage, 17000);
            this.groupAfter(20000, this.playerTeam, 1, 200, 800, [
                Beam,
                PointDefenseGun,
            ]);
        });
    },
});

export const Level5 = Klass(Level, {
    name: "Not fair",
    description: "Well, that's life.",

    width: 1280,
    height: 960,
    scale: 0.5,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.groupAfter(
                3000,
                this.enemyTeam,
                1,
                this.width * 0.9,
                this.height * 0.85,
                [RapidFireRailgun, RapidFireRailgun, RapidFireRailgun]
            );
            this.group(this.playerTeam, 4, 200, 200, [
                PointDefenseMissiles,
                PointDefenseGun,
                PointDefenseGun,
                PointDefenseGun,
                Missiles,
                Missiles,
                Missiles,
            ]);
        });
    },
});

export const Level6 = Klass(Level, {
    name: "Ye Good Ole Slug-Out",
    description: "Tactics, schmactics.",

    width: 1280,
    height: 960,
    scale: 0.5,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.group(
                this.enemyTeam,
                0,
                this.width * 0.9,
                this.height * 0.85,
                [Railgun, Railgun, Missiles, Beam, RapidFireRailgun]
            );
            this.group(
                this.playerTeam,
                0,
                this.width * 0.1,
                this.height * 0.15,
                [Railgun, Railgun, Missiles, Beam, RapidFireRailgun]
            );
        });
    },
});

export const Level7 = Klass(Level, {
    name: "Missiles are awesome",
    description: "And make the computer slow doooown.",

    width: 1600,
    height: 1200,
    scale: 640 / 1600,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.group(
                this.playerTeam,
                2,
                this.width * 0.5,
                this.height * 0.15,
                [Missiles, Missiles, Missiles, Missiles, Missiles]
            );
            for (var i = 1; i <= 10; i++) {
                this.groupAfter(
                    i * 3000,
                    this.enemyTeam,
                    0,
                    Math.random() * this.width,
                    this.height + 40,
                    [Beam, Beam],
                    true
                );
            }
        });
    },
});

export const Level8 = Klass(Level, {
    name: "Railguns are awesome too",
    description: "But take oh so long to reload.",

    width: 1600,
    height: 1200,
    scale: 640 / 1600,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.group(
                this.playerTeam,
                4,
                this.width * 0.2,
                this.height * 0.5,
                [Railgun, Railgun, Railgun, Railgun, Railgun, Railgun]
            );
            for (var i = 1; i <= 8; i++) {
                this.groupAfter(
                    i * 3000,
                    this.enemyTeam,
                    4,
                    -100,
                    Math.random() * this.height,
                    [Missiles, Missiles],
                    true
                );
            }
            this.groupAfter(
                9 * 3000,
                this.enemyTeam,
                4,
                this.width * 0.5,
                this.height + 50,
                [Missiles, Missiles],
                true
            );
            this.groupAfter(
                10 * 3000,
                this.enemyTeam,
                4,
                this.width * 0.5,
                -50,
                [Missiles, Missiles],
                true
            );
        });
    },
});

export const Level9 = Klass(Level, {
    name: "Duels",
    description: "Cheese is awesome as well.",

    width: 1600,
    height: 1200,
    scale: 640 / 1600,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            for (var i = 1; i <= 10; i++) {
                this.groupAfter(
                    i * 3000 - 1500,
                    this.playerTeam,
                    4,
                    this.width * 0.8,
                    this.height * (0.1 + Math.random() * 0.8),
                    [i <= 6 ? RapidFireRailgun : PointDefenseGun]
                );
                this.groupAfter(
                    i * 3000,
                    this.enemyTeam,
                    4,
                    this.width * 0.2,
                    this.height * Math.random(),
                    [RapidFireRailgun]
                );
            }
        });
    },
});

export const Level10 = Klass(Level, {
    name: "Relaaax",
    description: "An intermission.",

    width: 1600,
    height: 1200,
    scale: 640 / 1600,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.group(
                this.playerTeam,
                5,
                this.width * 0.5,
                this.height * 0.5,
                [RapidFireRailgun, RapidFireRailgun, RapidFireRailgun]
            );
            for (var i = 1; i <= 3; i++) {
                this.groupAfter(
                    i * 3000,
                    this.enemyTeam,
                    2,
                    this.width * Math.random(),
                    this.height * Math.random(),
                    [Railgun, PointDefenseMissiles, PointDefenseMissiles]
                );
            }
            for (var i = 5; i <= 7; i++) {
                this.groupAfter(
                    i * 3000,
                    this.enemyTeam,
                    2,
                    this.width * Math.random(),
                    this.height * Math.random(),
                    [Beam, PointDefenseMissiles, PointDefenseMissiles]
                );
            }
            for (var i = 9; i <= 12; i++) {
                this.groupAfter(
                    i * 3000,
                    this.enemyTeam,
                    4,
                    this.width * Math.random(),
                    this.height * Math.random(),
                    [Missiles, PointDefenseMissiles, PointDefenseMissiles]
                );
            }
            this.groupAfter(
                15 * 3000,
                this.enemyTeam,
                5,
                this.width * Math.random(),
                this.height * Math.random(),
                [
                    Missiles,
                    Missiles,
                    Missiles,
                    Missiles,
                    Missiles,
                    Missiles,
                    Missiles,
                ]
            );
        });
    },
});

export const Level11 = Klass(Level, {
    name: "Encounter",
    description: "Even fight.",

    width: 2000,
    height: 1500,
    scale: 640 / 2000,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.group(
                this.playerTeam,
                5,
                this.width * 0.2,
                this.height * 0.8,
                [
                    Railgun,
                    Railgun,
                    Railgun,
                    Missiles,
                    Missiles,
                    Missiles,
                    Beam,
                    Beam,
                    Beam,
                ]
            );
            this.group(this.enemyTeam, 5, this.width * 0.8, this.height * 0.2, [
                Railgun,
                Railgun,
                Railgun,
                Missiles,
                Missiles,
                Missiles,
                Beam,
                Beam,
                Beam,
            ]);
        });
    },
});

export const Level12 = Klass(Level, {
    name: "Skirmish",
    description: "Take out the blue ships.",

    width: 1600,
    height: 1200,
    scale: 640 / 1600,
    wave: 20,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            this.ships[this.playerTeam] = 100;
            this.ships[this.enemyTeam] = 100;
            this.newShips();
            this.every(4000, this.newShips);
        });
    },

    newShips: function (after) {
        if (!after) after = 0;
        this.wave--;
        if (this.wave == 1) {
            this.ships[this.playerTeam] -= 100;
            this.ships[this.enemyTeam] -= 100;
        } else if (this.wave == 0) {
            return false;
        }
        var friends = this.ships[this.playerTeam] || 0;
        var enemies = this.ships[this.enemyTeam] || 0;
        var playerWeapons = new Array(Math.max(1, enemies - friends)).map(
            this.randomWeapon
        );
        var enemyWeapons = new Array(Math.max(1, friends - enemies)).map(
            this.randomWeapon
        );
        this.groupAfter(
            after,
            this.playerTeam,
            Math.random() * 6,
            this.width * (0.2 + Math.random() * 0.6),
            this.height * (0.2 + Math.random() * 0.6),
            playerWeapons
        );
        this.groupAfter(
            after,
            this.enemyTeam,
            Math.random() * 6,
            this.width * (0.2 + Math.random() * 0.6),
            this.height * (0.2 + Math.random() * 0.6),
            enemyWeapons
        );
    },

    weapons: [Beam, Missiles, Railgun],

    randomWeapon: function () {
        if (Math.random() < 0.02) return RapidFireRailgun;
        return Level12.weapons.pick();
    },
});

export const Level13 = Klass(Level, {
    name: "Random encounter",
    description: "How will you cope?",

    width: 1600,
    height: 1200,
    scale: 640 / 1600,

    initialize: function () {
        Level.initialize.call(this);
        this.when("started", function () {
            var tl = Math.random() * 6;
            var ships = 3 + Math.floor(Math.random() * 7);
            var pl = new Array(ships).map(Level12.randomWeapon);
            var en = new Array(ships).map(Level12.randomWeapon);
            this.group(
                this.playerTeam,
                tl,
                this.width * 0.2,
                this.height * 0.8,
                pl
            );
            this.group(
                this.enemyTeam,
                tl,
                this.width * 0.8,
                this.height * 0.2,
                en
            );
        });
    },
});

export const MenuLevel = Klass(Level, {
    width: 1280,
    height: 960,
    scale: 0.5,
    playerTeam: null,
    enemyTeam: null,

    initialize: function () {
        Level.initialize.call(this);
        this.menu = new CanvasNode();
        this.menu.scale = 2;
        this.menu.zIndex = 100;
        this.append(this.menu);
        this.setupMenu();
        this.newShip();
        this.every(4000, this.newShip);
        this.selectRect.opacity = 0;
    },

    showDescription: function () {},

    newShip: function () {
        var blue = "#2266aa";
        var red = "#aa2222";
        var blues = this.childNodes.filter(function (n) {
            return n.team == blue;
        }).length;
        var reds = this.childNodes.filter(function (n) {
            return n.team == red;
        }).length;
        var d = 1 + Math.max(0, blues - reds);
        this.taskforce(
            red,
            Math.random() * this.width,
            Math.random() * this.height,
            d
        );
        var d = 1 + Math.max(0, reds - blues);
        this.taskforce(
            blue,
            Math.random() * this.width,
            Math.random() * this.height,
            d
        );
    },

    taskforce: function (color, x, y, size) {
        var wps = [Missiles, Beam, Railgun];
        var tl = Math.random() * 6;
        for (var i = 0; i < size; i++) {
            var wp = wps[Math.floor(wps.length * Math.random())];
            var pd = wp == Missiles ? PointDefenseMissiles : PointDefenseGun;
            if (wp == Beam) pd = Beam;
            if (Math.random() < 0.03) {
                wp = pd = RapidFireRailgun;
            }
            var ship = new Ship(
                color,
                new wp(tl),
                new pd(tl),
                x + Math.random() * 100 - 50,
                y + Math.random() * 100 - 50
            );
            this.append(ship);
        }
    },

    setupMenu: function () {
        var elem = E("h1");
        elem.appendChild(T("MISSILE FLEET"));
        var title = new ElementNode(elem, {
            x: 320,
            y: 40,
            zIndex: 1002,
            align: "center",
            cursor: "default",
        });
        var th = this;
        var controls = new CanvasNode();
        var bg = new ElementNode(
            E("div", {
                style: {
                    width: "640px",
                    height: "480px",
                    backgroundColor: this.bgColor,
                    opacity: 0.5,
                },
            }),
            { x: 0, y: 0, zIndex: 1001 }
        );
        controls.append(bg);
        controls.display = "none";
        controls.opacity = 0;
        var levelList = E("ol");
        MissileFleet.levels.slice(1).forEach(function (lvl, i) {
            var li = E("li", E("h3", i + 1 + ". " + lvl.prototype.name));
            li.onclick = function () {
                if (th.clicked) return;
                th.clicked = true;
                th.menu.controls.animateTo("opacity", 0, 300, "sine");
                th.after(300, function () {
                    this.parentNode.jumpToLevel(
                        MissileFleet.levels.indexOf(lvl)
                    );
                });
            };
            li.style.cursor = "pointer";
            levelList.appendChild(li);
        });
        var levelHeader = E("h2", "JUMP TO LEVEL");
        var jump = new ElementNode(levelHeader, {
            zIndex: 1002,
            x: 320,
            y: 120,
            align: "center",
        });
        var levels = new ElementNode(levelList, {
            zIndex: 1002,
            x: 320,
            y: 164,
            align: "center",
        });
        var divider = new Rectangle(540, 1, {
            centered: true,
            x: 320,
            y: 87.5,
            fill: "red",
        });
        controls.append(jump, levels, divider);
        this.menu.title = title;
        this.menu.controls = controls;
        this.menu.append(title);
        this.menu.append(controls);
        this.bg.addEventListener(
            "click",
            function () {
                if (!th.menuVisible) {
                    th.showMenu();
                }
            },
            false
        );
    },

    showMenu: function () {
        if (this.menuVisible) return;
        this.menuVisible = true;
        var th = this;
        this.menu.controls.display = "block";
        this.menu.controls.animateTo("opacity", 1, 500, "sine");
        this.menu.after(10000, function () {
            this.controls.animateTo("opacity", 0, 500, "sine");
            this.after(500, function () {
                this.controls.display = "none";
                th.menuVisible = false;
            });
        });
    },
});
