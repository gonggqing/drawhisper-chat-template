import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";

export interface FocusableLive2DModel extends Live2DModel {
    dragging: boolean;
}

export function focus(_model: Live2DModel, ref: React.RefObject<HTMLCanvasElement | null>) {
    const model = _model as FocusableLive2DModel;

    model.dragging = false;  // Initialize dragging state

    const canvas = ref.current?.parentElement; 

    function onPointerDown(event: PointerEvent) {
        
        model.dragging = true;
        model.focus(event.clientX, event.clientY);
    }

    function onPointerMove(event: PointerEvent) {
        if (model.dragging) {
            model.focus(event.clientX, event.clientY);
        }
    }

    function onPointerUp() {
        model.dragging = false;
    }

    // Add event listeners
    if (canvas) {
        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointerleave", onPointerUp);

        // Return cleanup function
        return () => {
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointerleave", onPointerUp);
        };
    }
}
