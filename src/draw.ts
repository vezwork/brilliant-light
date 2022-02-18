import { BULB_DIAMETER, canvasEl, handlePos, HANDLE_DIAMETER, InputState, MIRRORS, MIRROR_WIDTH, SceneState } from "./shared";
import { add, distance, LineSegment, mul, normalize, sub, Vec2 } from "./math";

const DANCING_BULB_DIAMETER = 145;
const DANCING_BULB_ANIMATION_PERIOD = 60;
const LIGHT_LINE_WIDTH = 5;

const ctx = canvasEl.getContext('2d');

const eyeImg = document.getElementById('eye_img') as HTMLImageElement;
const handleImg = document.getElementById('handle_img') as HTMLImageElement;
const lightbulbImg = document.getElementById('lightbulb_img') as HTMLImageElement;
const lightbulbDance1Img = document.getElementById('lightbulb_dance1_img') as HTMLImageElement;
const lightbulbDance2Img = document.getElementById('lightbulb_dance2_img') as HTMLImageElement;

// Draws a line with thickness to represent a LineSegment
const drawLineSegment = (ctx: CanvasRenderingContext2D, [start, end]: LineSegment, width = 1) => {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(...end);
    ctx.stroke();
};

// Draws an image at a position without distorting it's aspect ratio
const drawImage = (ctx: CanvasRenderingContext2D, img: CanvasImageSource, center: Vec2, scale = 1) => {
    const imgSize = [img.width, img.height] as Vec2;
    const drawSize = mul(scale, normalize(imgSize));
    ctx.drawImage(img, ...sub(center, mul(1 / 2, drawSize)), ...drawSize);
}

// Draws a SceneState to the canvas!
// Relies on some external state in this file like ctx and images.
export const draw = ({
    eye: { pos: eyePos, angle: eyeAngle },
    bulb: { pos: bulbPos },
    solidRay,
    dottedRay,
    isInSuccessState,
    handleAlpha
}: SceneState,
    { mousePos, isMouseDown }: InputState,
    frameTime: number) => {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // Draw eye and mirrors
    drawImage(ctx, eyeImg, eyePos, 64);

    for (const mirror of MIRRORS) drawLineSegment(ctx, mirror, MIRROR_WIDTH);

    // Draw bulb and success bulb.
    // If the user causes the light to hit the bulb, it dances :)
    if (isInSuccessState) {
        const numberOfBounces = solidRay?.trail.length - 1;
        const isSuccessBulbMirrored = numberOfBounces % 2 === 1;
        let successBulbPos;
        if (isSuccessBulbMirrored) {
            successBulbPos = add(dottedRay.tip, [solidRay.tip[0] - bulbPos[0], bulbPos[1] - solidRay.tip[1]]);
        } else {
            successBulbPos = add(dottedRay.tip, sub(bulbPos, solidRay.tip));
        }

        if (frameTime % DANCING_BULB_ANIMATION_PERIOD * 2 > DANCING_BULB_ANIMATION_PERIOD) {
            ctx.globalAlpha = 0.5;
            drawImage(
                ctx,
                isSuccessBulbMirrored ? lightbulbDance1Img : lightbulbDance2Img,
                successBulbPos,
                DANCING_BULB_DIAMETER
            );
            ctx.globalAlpha = 1;
            drawImage(ctx, lightbulbDance2Img, bulbPos, DANCING_BULB_DIAMETER);
        } else {
            ctx.globalAlpha = 0.5;
            drawImage(
                ctx,
                isSuccessBulbMirrored ? lightbulbDance2Img : lightbulbDance1Img,
                successBulbPos,
                DANCING_BULB_DIAMETER
            );
            ctx.globalAlpha = 1;
            drawImage(ctx, lightbulbDance1Img, bulbPos, DANCING_BULB_DIAMETER);
        }
    } else {
        drawImage(ctx, lightbulbImg, bulbPos, BULB_DIAMETER);
    }

    // Draw light rays
    ctx.strokeStyle = "#F3D015";
    if (solidRay) {
        for (const lineSegment of solidRay.trail) drawLineSegment(ctx, lineSegment, LIGHT_LINE_WIDTH);
    }

    ctx.setLineDash([5, 5]);
    if (dottedRay) {
        for (const lineSegment of dottedRay.trail) drawLineSegment(ctx, lineSegment, LIGHT_LINE_WIDTH);
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = "black";

    // Set cursor when mouse is over the handle
    if (distance(handlePos(eyePos, eyeAngle), mousePos) < HANDLE_DIAMETER / 2) {
        document.body.style.cursor = "grab";
        if (isMouseDown) {
            document.body.style.cursor = "grabbing";
        }
    } else {
        document.body.style.cursor = "default";
    }

    // Draw handle
    ctx.globalAlpha = handleAlpha;
    drawImage(ctx, handleImg, handlePos(eyePos, eyeAngle), HANDLE_DIAMETER);
    ctx.globalAlpha = 1;
}
