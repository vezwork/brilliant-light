import { add, LineSegment, mul, normalVec2FromAngle, Vec2 } from "./math";

export type LightProjectile = {
    tip: Vec2,
    angle: number,
    trail: LineSegment[],
    isMoving: boolean
};

export type SceneState = {
    eye: { pos: Vec2, angle: number },
    bulb: { pos: Vec2 },
    solidRay: LightProjectile | null,
    dottedRay: LightProjectile | null,
    isInSuccessState: boolean,
    isDraggingHandle: boolean,
    handleAlpha: number
}

export type InputState = {
    mousePos: Vec2,
    isMouseDown: boolean
}

export const MIRROR_WIDTH = 12;
const MIRROR1: LineSegment = [[350, 100], [350, 340]];
const MIRROR2: LineSegment = [[550, 100], [550, 340]];
export const MIRRORS = [MIRROR1, MIRROR2];

export const HANDLE_DIAMETER = 80;

export const BULB_DIAMETER = 64;

export const handlePos = (eyePos: Vec2, eyeAngle: number) => {
    const eyeDir = normalVec2FromAngle(eyeAngle);
    return add(eyePos, mul(HANDLE_DIAMETER / 2, eyeDir));
};

export const canvasEl = document.getElementById('main_canvas') as HTMLCanvasElement;
