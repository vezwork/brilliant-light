import { LineSegment, Vec2 } from "./vec2";

type LightProjectile = {
    tip: Vec2,
    angle: number,
    trail: LineSegment[],
    isMoving: boolean
};

type SceneState = {
    eye: { pos: Vec2, angle: number },
    bulb: { pos: Vec2 },
    mirrors: LineSegment[],
    solidRay: LightProjectile | null,
    dottedRay: LightProjectile | null,
    isInSuccessState: boolean,
}

type InputState = {
    mousePos: Vec2,
    isMouseDown: boolean
}
