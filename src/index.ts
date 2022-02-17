import { vec2 } from "./vec2";

const canvasEl = document.getElementById('main_canvas') as HTMLCanvasElement;
const ctx = canvasEl.getContext('2d');

ctx.fillRect(0, 1, canvasEl.width, canvasEl.height);

console.log(vec2);
