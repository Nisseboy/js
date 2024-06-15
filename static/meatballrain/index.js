let currentScene;

let currentSceneTime = 0;
let currentTime = 0;


switchScene(game);

let desiredFrameRate = 60;
let lastFrame = performance.now();
function mainLoop() {
  requestAnimationFrame(mainLoop);

  let time = performance.now();
  let dt = Math.min((time - lastFrame) / 1000, 1);
  lastFrame = time;

  currentTime += dt;
  currentSceneTime += dt;

  currentScene.update(dt);
}
requestAnimationFrame(mainLoop);

function switchScene(scene) {
  if (currentScene) {
    currentScene.exit();
  }

  if (!scene.hasInit) scene.init();
  scene.hasInit = true;

  scene.enter();
  currentSceneTime = 0;

  currentScene = scene;
}