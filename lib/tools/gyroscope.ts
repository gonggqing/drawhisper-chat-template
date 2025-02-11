import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";
import { FederatedPointerEvent } from "pixi.js";

interface GyroscopeState {
    isDragging: boolean;
    centerX: number;
    centerY: number;
    radius: number;
    controlPoint: {
        x: number;
        y: number;
    };
    modelInitialPosition: {
        x: number;
        y: number;
    };
    bunnyImage: HTMLImageElement | null;
}

export function createGyroscope(_model: Live2DModel, ref: React.RefObject<HTMLCanvasElement | null>) {
    const model = _model;
    const state: GyroscopeState = {
        isDragging: false,
        centerX: 0,
        centerY: 0,
        radius: 50, // Radius of the gyroscope circle
        controlPoint: { x: 0, y: 0 },
        modelInitialPosition: { x: 0, y: 0 },
        bunnyImage: null
    };

    // Load bunny image
    const bunny = new Image();
    bunny.src = '/image/bunny.png';
    bunny.onload = () => {
        state.bunnyImage = bunny;
        const ctx = ref.current?.getContext('2d');
        if (ctx) drawGyroscope(ctx);
    };

    function drawGyroscope(ctx: CanvasRenderingContext2D) {
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw background circle
        ctx.beginPath();
        ctx.arc(state.centerX, state.centerY, state.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#d7e3fc';
        ctx.globalAlpha = 0.75;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw bunny control point
        if (state.bunnyImage) {
            const bunnySize = 20; // Size of the bunny image
            ctx.drawImage(
                state.bunnyImage,
                state.controlPoint.x - bunnySize / 2,
                state.controlPoint.y - bunnySize / 2,
                bunnySize,
                bunnySize
            );
        }
    }

    function updateModelPosition() {
        if (!model) return;

        // Calculate normalized position (-1 to 1) from gyroscope
        const dx = (state.controlPoint.x - state.centerX) / state.radius;
        const dy = (state.controlPoint.y - state.centerY) / state.radius;

        // Apply position with some scaling factor
        const scale = 200; // Adjust this value to control movement range
        model.position.x = state.modelInitialPosition.x + dx * scale;
        model.position.y = state.modelInitialPosition.y + dy * scale;

        // Redraw gyroscope
        const ctx = ref.current?.getContext('2d');
        if (ctx) drawGyroscope(ctx);
    }

    function onGyroscopePointerDown(e: PointerEvent) {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if click is within gyroscope area
        const dx = x - state.centerX;
        const dy = y - state.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= state.radius) {
            state.isDragging = true;
            state.controlPoint.x = x;
            state.controlPoint.y = y;
            state.modelInitialPosition = {
                x: model.position.x,
                y: model.position.y
            };
            updateModelPosition();
        }
    }

    function onGyroscopePointerMove(e: PointerEvent) {
        if (!state.isDragging) return;

        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Constrain control point within circle
        const dx = x - state.centerX;
        const dy = y - state.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= state.radius) {
            state.controlPoint.x = x;
            state.controlPoint.y = y;
        } else {
            // Normalize to circle edge
            const angle = Math.atan2(dy, dx);
            state.controlPoint.x = state.centerX + Math.cos(angle) * state.radius;
            state.controlPoint.y = state.centerY + Math.sin(angle) * state.radius;
        }

        updateModelPosition();
    }

    function onGyroscopePointerUp() {
        state.isDragging = false;
    }

    // Initialize gyroscope
    const canvas = ref.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Position gyroscope in center of canvas
            state.centerX = canvas.width / 2;
            state.centerY = canvas.height / 2;
            state.controlPoint = { x: state.centerX, y: state.centerY };

            // Initial draw
            drawGyroscope(ctx);

            // Add event listeners
            canvas.addEventListener('pointerdown', onGyroscopePointerDown);
            canvas.addEventListener('pointermove', onGyroscopePointerMove);
            canvas.addEventListener('pointerup', onGyroscopePointerUp);
            canvas.addEventListener('pointerleave', onGyroscopePointerUp);
        }
    }

    // Return cleanup function
    return () => {
        if (canvas) {
            canvas.removeEventListener('pointerdown', onGyroscopePointerDown);
            canvas.removeEventListener('pointermove', onGyroscopePointerMove);
            canvas.removeEventListener('pointerup', onGyroscopePointerUp);
            canvas.removeEventListener('pointerleave', onGyroscopePointerUp);
        }
    };
}
