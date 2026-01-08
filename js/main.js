import {
    MenuLevel,
    Level1,
    Level2,
    Level3,
    Level4,
    Level5,
    Level6,
    Level7,
    Level8,
    Level9,
    Level10,
    Level11,
    Level13,
} from "./levels.js";
import { Player } from "./player.js";
import { Explosion } from "./explosion.js";
import { TouchControls } from "./touch_controls.js";
import { FullscreenMode } from "./fullscreen.js";

export const DEFAULT_CURSOR = "default";
export const MOVE_TO_CURSOR = "url(moveto.png) 9 9, move";
export const TARGET_CURSOR = "crosshair";
export const SELECT_CURSOR = "pointer";

export const MissileFleet = Klass(CanvasNode, {
    levelIndex: 0,
    levels: [
        MenuLevel,
        Level1,
        Level2,
        Level3,
        Level4,
        Level5,
        Level6,
        Level7,
        Level8,
        Level9,
        Level10,
        Level11,
        Level13,
    ],

    bgColor: "rgb(0,0,0)",
    bgOpacity: 0.15,

    initialize: function (canvasElem) {
        CanvasNode.initialize.call(this);
        this.canvas = new Canvas(canvasElem);
        this.canvas.frameDuration = 30;
        this.canvas.append(this);
        this.canvas.fixedTimestep = true;
        this.canvas.clear = false;
        this.canvas.scale = Math.min(window.innerWidth / 640, window.innerHeight / 480);
        this.canvas.x = (window.innerWidth - 640 * this.canvas.scale) / 2;
        this.canvas.y = (window.innerHeight - 480 * this.canvas.scale) / 2;
        this.bg = new Rectangle(5000, 5000);
        this.bg.fill = this.bgColor;
        this.bg.fillOpacity = this.bgOpacity;
        this.bg.x = -2500;
        this.bg.y = -2500;
        this.canvas.append(this.bg);
        window.addEventListener("resize", () => {
            canvasElem.width = window.innerWidth;
            canvasElem.height = window.innerHeight;
            this.canvas.scale = Math.min(window.innerWidth / 640, window.innerHeight / 480);
            this.canvas.x = (window.innerWidth - 640 * this.canvas.scale) / 2;
            this.canvas.y = (window.innerHeight - 480 * this.canvas.scale) / 2;
        });
        this.gameOver();
        this.setupEtc();
    },

    gameOver: function () {
        this.levelIndex = 0;
        this.changeLevel(this.levels[this.levelIndex]);
    },

    nextLevel: function () {
        this.levelIndex++;
        var level = this.levels[this.levelIndex % this.levels.length];
        this.changeLevel(level);
    },

    jumpToLevel: function (idx) {
        this.levelIndex = idx;
        var level = this.levels[this.levelIndex % this.levels.length];
        this.changeLevel(level);
    },

    tryAgain: function () {
        this.changeLevel(this.levels[this.levelIndex]);
    },

    changeLevel: function (level) {
        Player.waypoints = {};
        Player.targets = {};
        Player.selection = [];
        if (this.level) this.level.removeSelf();
        if (level) {
            this.level = new level();
            this.append(this.level);
        }
    },

    fastExplosions: false,
    setFastExplosions: function (fe) {
        this.fastExplosions = fe;
        Explosion.fastExplosions = fe;
    },

    noExplosions: false,
    setNoExplosions: function (fe) {
        this.noExplosions = fe;
        Explosion.prototype.visible = !fe;
    },

    fastBeams: false,
    setFastBeams: function (fb) {
        this.fastBeams = fb;
        Beam.fastBeams = fb;
    },

    speed: 1.0,
    setSpeed: function (s) {
        this.speed = s;
        this.canvas.speed = s;
        this.level.bg.fillOpacity = this.motionBlur
            ? 1 - Math.pow(1 - this.level.bgOpacity, this.speed)
            : 1;
    },

    motionBlur: true,
    setMotionBlur: function (s) {
        this.motionBlur = s;
        this.level.bg.fillOpacity = this.motionBlur
            ? 1 - Math.pow(1 - this.level.bgOpacity, this.speed)
            : 1;
    },

    setupEtc: function () {
        this.canvas.updateFps = true;
        var debug = E("div");
        var t0 = -1;
        var frames = [];
        var fc = E.canvas(200, 10);
        var fpsE = T("");
        var elapsedE = T("");
        var realFpsE = T("");
        var elapsedRealE = T("");
        debug.append(
            fpsE,
            " fps (",
            elapsedE,
            " ms to draw scene)",
            E("br"),
            realFpsE,
            " real fps (",
            elapsedRealE,
            " ms between frames)",
            E("br"),
            fc
        );
        var fctx = fc.getContext("2d");
        fctx.globalCompositeOperation = "copy";
        fctx.fillStyle = "#828292";
        this.canvas.addFrameListener(function (t) {
            if (this.updateFps) {
                fctx.drawImage(fc, -1, 0);
                fctx.clearRect(199, 0, 1, 10);
                fctx.fillRect(
                    199,
                    0,
                    1,
                    Math.min(100, this.currentRealFps) / 3.3
                );
                if (Math.floor(t / 500) != t0) {
                    t0 = Math.floor(t / 500);
                    var fps = Math.floor(this.fps * 10) / 10;
                    var elapsed = Math.floor(1000 / this.fps);
                    var realFps = Math.floor(this.realFps * 10) / 10;
                    var elapsedReal = Math.floor(1000 / this.realFps);
                    fpsE.textContent = fps;
                    elapsedE.textContent = elapsed;
                    realFpsE.textContent = realFps;
                    elapsedRealE.textContent = elapsedReal;
                }
            }
        });
        this.canvasControlPanel = new GuiConfig({
            object: this.canvas,
            container: $("debug"),
            title: "Debug",
            controls: [
                "updateFps",
                "playOnlyWhenFocused",
                "drawBoundingBoxes",
                [
                    "useMockContext",
                    "boolean",
                    {
                        title: "Turn off drawing. Useful for benchmarking the AI.",
                    },
                ],
            ],
        });
        this.canvasControlPanel.show();
        this.controlPanel = new GuiConfig({
            object: this,
            container: $("debug"),
            title: "Graphics",
            controls: [
                ["speed", "0.1..1.0"],
                "motionBlur",
                "fastExplosions",
                "noExplosions",
                "fastBeams",
            ],
        });
        this.controlPanel.show();
        this.playerControlPanel = new GuiConfig({
            object: Player,
            container: $("debug"),
            title: "Support AI",
            controls: [
                ["useMovementAI", "boolean", { title: "Use movement AI" }],
                ["useTargettingAI", "boolean", { title: "Use targetting AI" }],
            ],
        });
        this.playerControlPanel.show();
        $("debug").appendChild(debug);
    },
});

export const init = function () {
    var c = E.canvas(innerWidth, innerHeight);
    var d = E("div", { id: "screen" });
    d.appendChild(c);
    document.body.appendChild(d);
    var mf = new MissileFleet(c);

    TouchControls.init(c);
    FullscreenMode.init(c);
};
