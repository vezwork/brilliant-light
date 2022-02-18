import { SceneState, InputState, canvasEl } from "./shared";
import { update } from "./update";
import { draw } from "./draw";

// Init functions
const initSceneState = (): SceneState => ({
    eye: { pos: [450, 400], angle: -Math.PI / 2 },
    bulb: { pos: [450, 100] },
    solidRay: null,
    dottedRay: null,
    isInSuccessState: false,
    isDraggingHandle: false,
    handleAlpha: 1
});

const initInputState = (): InputState => ({
    mousePos: [0, 0],
    isMouseDown: false
});

// Input listeners
canvasEl.addEventListener('mousedown', (e) => {
    inputState.isMouseDown = true;
});
canvasEl.addEventListener('mouseup', (e) => {
    inputState.isMouseDown = false;
});
canvasEl.addEventListener('mouseleave', (e) => {
    inputState.isMouseDown = false;
});
canvasEl.addEventListener('mousemove', (e) => {
    inputState.mousePos = [
        e.offsetX,
        e.offsetY
    ];
});

// Main interactive loop
let frameTime = 0;
let sceneState = initSceneState();
const inputState = initInputState();
function animationLoop() {
    requestAnimationFrame(animationLoop);

    sceneState = update(sceneState, inputState);
    draw(sceneState, inputState, frameTime);

    frameTime++;
}

requestAnimationFrame(animationLoop);
