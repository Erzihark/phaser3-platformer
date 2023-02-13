import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";
import PreloadScene from "./scenes/PreloadScene";
import MenuScene from "./scenes/MenuScene";
import LevelScene from "./scenes/LevelsScene";
import CreditsScene from "./scenes/CreditsScene";

const MAP_WIDTH = 1600;

const WIDTH = document.body.offsetWidth;
const HEIGHT = 600;
const ZOOM_FACTOR = 1.5;

const SHARED_CONFIG = {
  mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 0,
  width: WIDTH,
  height: HEIGHT,
  zoomFactor: ZOOM_FACTOR,
  debug: true,
  leftTopCorner: {
    x: (WIDTH - (WIDTH/ZOOM_FACTOR)) / 2,
    y: (HEIGHT - (HEIGHT/ZOOM_FACTOR)) / 2
  },
  rightTopCorner: {
    x: (WIDTH / ZOOM_FACTOR) + (WIDTH - (WIDTH/ZOOM_FACTOR)) / 2,
    y: (HEIGHT - (HEIGHT/ZOOM_FACTOR)) / 2
  },
  rightBottomCorner: {
    x: (WIDTH / ZOOM_FACTOR) + (WIDTH - (WIDTH/ZOOM_FACTOR)) / 2,
    y: (HEIGHT / ZOOM_FACTOR) + (HEIGHT - (HEIGHT/ZOOM_FACTOR)) / 2,
  },
  lastLevel: 2
}

const Scenes = [PreloadScene, MenuScene, LevelScene, PlayScene, CreditsScene];

const createScene = Scene => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

const config = {
  //WebGL(graphics library) js api for graphics rendering
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  pixelArt: true,
  physics: {
    //arcade physics plugin, manages physics simulation
    default: 'arcade',
    arcade: {
      debug: SHARED_CONFIG.debug,
    }
  },
  scene: initScenes( ),
}

new Phaser.Game(config);