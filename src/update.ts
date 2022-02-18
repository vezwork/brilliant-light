import { BULB_DIAMETER, canvasEl, handlePos, HANDLE_DIAMETER, InputState, LightProjectile, MIRRORS, MIRROR_WIDTH, SceneState } from "./shared";
import { add, angleOf, distance, mul, normalVec2FromAngle, sub, subLineSegment, Vec2, length, angleBetween, reflectAngle, copy, LineSegment, smoothStep } from "./math";

const LIGHT_SPEED = 3;

const HANDLE_ALPHA_CHANGE_SLOWNESS = 20;

const initLightProjectile = (tip: Vec2, angle: number): LightProjectile => ({
    tip,
    angle,
    trail: [[tip, tip]],
    isMoving: true
});

const moveLightProjectile = ({ tip, angle, trail, isMoving }: LightProjectile) => {
    trail[trail.length - 1][1] = tip;

    return ({
        tip: add(tip, mul(LIGHT_SPEED, normalVec2FromAngle(angle))),
        angle,
        trail,
        isMoving
    });
};

const reflectLightAboutLineSegment = (
    { tip, angle, trail, isMoving }: LightProjectile,
    segment: LineSegment
): LightProjectile => {
    const newTrail = [...trail];
    newTrail.push([tip, tip])
    const segmentAngle = angleBetween(...segment);
    return ({
        tip,
        angle: reflectAngle(angle, segmentAngle),
        trail: newTrail,
        isMoving
    });
};

// Takes into account the previous state and the user input to compute the next step
// of the interactive animation. This function is written in functional style but
// does still have some side effects, specifically on solidRay and dottedRay.
export const update = ({
    eye: { pos: eyePos, angle: eyeAngle },
    bulb: { pos: bulbPos },
    solidRay,
    dottedRay,
    isDraggingHandle,
    handleAlpha
}: SceneState,
    { mousePos, isMouseDown }: InputState
): SceneState => {

    const isMouseReleased = !isMouseDown && isDraggingHandle;
    if (isMouseReleased) {
        solidRay = initLightProjectile(eyePos, eyeAngle);
        dottedRay = initLightProjectile(eyePos, eyeAngle);
    }

    const isRayTouchingBulb = solidRay && distance(solidRay.tip, bulbPos) < BULB_DIAMETER / 2;

    if (solidRay?.isMoving) {
        for (const mirror of MIRRORS) {
            const isRayTouchingMirror = length(subLineSegment(solidRay.tip, mirror)) < MIRROR_WIDTH;
            // Note: there is a bug where the light can get stuck IN the mirror if it enters
            // the bottom of the mirror.
            if (isRayTouchingMirror) solidRay = reflectLightAboutLineSegment(solidRay, mirror);
        }

        const isRayOffscreen =
            distance(...solidRay.trail[solidRay.trail.length - 1]) > canvasEl.height;
        if (isRayOffscreen) {
            solidRay.isMoving = false;
            dottedRay.isMoving = false;
        }

        if (isRayTouchingBulb) {
            solidRay.isMoving = false;
            dottedRay.isMoving = false;
        }
    }

    const newEyeAngle = (isMouseDown && isDraggingHandle) ? angleOf(sub(mousePos, eyePos)) : eyeAngle;
    const isMouseOverHandle = distance(handlePos(eyePos, eyeAngle), mousePos) < HANDLE_DIAMETER / 2;

    const numberOfBounces = (solidRay?.trail.length - 1) || 0;
    const isNowInSuccessState = !isMouseReleased && isRayTouchingBulb && numberOfBounces > 0;

    const targetHandleAlpha = solidRay?.isMoving ? 0.2 : 1;
    return ({
        eye: { pos: eyePos, angle: newEyeAngle },
        bulb: { pos: bulbPos },
        solidRay: solidRay?.isMoving ? moveLightProjectile(solidRay) : solidRay,
        dottedRay: dottedRay?.isMoving ? moveLightProjectile(dottedRay) : dottedRay,
        isInSuccessState: isNowInSuccessState,
        isDraggingHandle: isMouseDown && isMouseOverHandle,
        handleAlpha: smoothStep(handleAlpha, targetHandleAlpha, HANDLE_ALPHA_CHANGE_SLOWNESS)
    });
}
