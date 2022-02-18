import {
    normalVec2FromAngle,
    Vec2,
    LineSegment,
    mul,
    add,
    sub,
    copy,
    angleOf,
    subLineSegment,
    length,
    angleBetween,
    reflectAngle,
    distance,
    normalize
} from "./vec2";

const canvasEl = document.getElementById('main_canvas') as HTMLCanvasElement;
const ctx = canvasEl.getContext('2d');

const eyeImg = document.getElementById('eye_img') as HTMLImageElement;
const handleImg = document.getElementById('handle_img') as HTMLImageElement;
const lightbulbImg = document.getElementById('lightbulb_img') as HTMLImageElement;
const lightbulbDance1Img = document.getElementById('lightbulb_dance1_img') as HTMLImageElement;
const lightbulbDance2Img = document.getElementById('lightbulb_dance2_img') as HTMLImageElement;

const LIGHT_SPEED = 3;

const initLightRay = (tip: Vec2, angle: number): LightProjectile => ({
    tip,
    angle,
    trail: [[tip, tip]],
    isMoving: true
});

const eyePos: Vec2 = [450, 400];
let eyeAngle: number = -Math.PI / 2;

const gemPos: Vec2 = [450, 100];
let isSuccessful = false;

const MIRROR_WIDTH = 12;
let mirror1: LineSegment = [[350, 100], [350, 340]];
let mirror2: LineSegment = [[550, 100], [550, 340]];
const mirrors = [mirror1, mirror2];

let solidRay: LightProjectile | undefined;
let dottedRay: LightProjectile | undefined;

let mousePos: Vec2 = [0, 0];
let isMouseDown = false;
canvasEl.addEventListener('mousedown', (e) => {
    isMouseDown = true;
});
canvasEl.addEventListener('mouseup', (e) => {
    isMouseDown = false;
});
canvasEl.addEventListener('mouseleave', (e) => {
    isMouseDown = false;
});
canvasEl.addEventListener('mousemove', (e) => {
    mousePos = [
        e.offsetX,
        e.offsetY
    ];
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

const HANDLE_DIAMETER = 80;
const handlePos = (eyePos: Vec2, eyeAngle: number) => {
    const eyeDir = normalVec2FromAngle(eyeAngle);
    return add(eyePos, mul(HANDLE_DIAMETER / 2, eyeDir));
}

let frameTime = 0;
let isDraggingHandle = false;
function update() {

    if (distance(handlePos(eyePos, eyeAngle), mousePos) < HANDLE_DIAMETER / 2) {
        document.body.style.cursor = "grab";
        if (isMouseDown) {
            document.body.style.cursor = "grabbing";
            isDraggingHandle = true;
        }
    } else {
        document.body.style.cursor = "default";
    }

    if (isMouseDown && isDraggingHandle) {
        eyeAngle = angleOf(sub(mousePos, eyePos));
    }
    if (!isMouseDown && isDraggingHandle) {
        solidRay = initLightRay(eyePos, eyeAngle);
        dottedRay = initLightRay(eyePos, eyeAngle);
        isSuccessful = false;
        isDraggingHandle = false;
    }

    if (dottedRay?.isMoving) {
        dottedRay = moveLightProjectile(dottedRay);
    }

    if (solidRay?.isMoving) {
        solidRay = moveLightProjectile(solidRay);

        for (const mirror of mirrors) {
            if (length(subLineSegment(solidRay.tip, mirror)) < MIRROR_WIDTH) {
                const mirrorAngle = angleBetween(...mirror);
                solidRay.angle = reflectAngle(solidRay.angle, mirrorAngle);
                solidRay.trail.push([solidRay.tip, solidRay.tip]);
            }
        }

        if (distance(...solidRay.trail[solidRay.trail.length - 1]) > 300) {
            solidRay.isMoving = false;
            dottedRay.isMoving = false;
        }
        if (distance(solidRay.tip, gemPos) < 24) {
            solidRay.isMoving = false;
            dottedRay.isMoving = false;
            const numberOfBounces = solidRay.trail.length - 1;
            if (numberOfBounces > 0) {
                isSuccessful = true;
            }
        }
    }
}

const drawImage = (ctx: CanvasRenderingContext2D, img: CanvasImageSource, center: Vec2, scale = 1) => {
    const imgSize = [img.width, img.height] as Vec2;
    const drawSize = mul(scale, normalize(imgSize));
    ctx.drawImage(img, ...sub(center, mul(1 / 2, drawSize)), ...drawSize);
}

let handleAlpha = 1;
function render() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    drawImage(ctx, eyeImg, eyePos, 64);

    for (const mirror of mirrors) renderLineSegment(ctx, mirror, MIRROR_WIDTH);

    if (isSuccessful) {
        const numberOfBounces = solidRay.trail.length - 1;
        const isSuccessBulbMirrored = numberOfBounces % 2 === 1;
        let successGemPos;
        if (isSuccessBulbMirrored) {
            successGemPos = add(dottedRay.tip, [solidRay.tip[0] - gemPos[0], gemPos[1] - solidRay.tip[1]]);
        } else {
            successGemPos = add(dottedRay.tip, sub(gemPos, solidRay.tip));
        }

        if (frameTime % 110 > 60) {
            ctx.globalAlpha = 0.5;
            drawImage(ctx, isSuccessBulbMirrored ? lightbulbDance1Img : lightbulbDance2Img, successGemPos, 145);
            ctx.globalAlpha = 1;
            drawImage(ctx, lightbulbDance2Img, gemPos, 145);
        } else {
            ctx.globalAlpha = 0.5;
            drawImage(ctx, isSuccessBulbMirrored ? lightbulbDance2Img : lightbulbDance1Img, successGemPos, 145);
            ctx.globalAlpha = 1;
            drawImage(ctx, lightbulbDance1Img, gemPos, 145);
        }
    } else {
        drawImage(ctx, lightbulbImg, gemPos, 64);
    }

    ctx.strokeStyle = "#F3D015";
    if (solidRay) {
        for (const lineSegment of solidRay.trail) renderLineSegment(ctx, lineSegment, 5);
    }

    ctx.setLineDash([5, 5]);
    if (dottedRay) {
        for (const lineSegment of dottedRay.trail) renderLineSegment(ctx, lineSegment, 5);
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = "black";

    if (solidRay?.isMoving) {
        handleAlpha -= (handleAlpha - 0.2) / 20;
    } else {
        handleAlpha -= (handleAlpha - 1) / 20;
    }
    ctx.globalAlpha = handleAlpha;
    drawImage(ctx, handleImg, handlePos(eyePos, eyeAngle), HANDLE_DIAMETER);
    ctx.globalAlpha = 1;


}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    update();
    render();

    frameTime++;
}

requestAnimationFrame(animationLoop);

const renderLineSegment = (ctx: CanvasRenderingContext2D, [start, end]: LineSegment, width = 1) => {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(...end);
    ctx.stroke();
};
