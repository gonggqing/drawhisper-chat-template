import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";
import { ModelFile } from "@/lib/tools/list-files";

export interface ModelState {
    files: ModelFile[];
    current: ModelFile | null;
    model: InstanceType<typeof Live2DModel> | null;
    isLoading: boolean;
    error?: string;
}

export interface ModelActions {
    setModel: (model: InstanceType<typeof Live2DModel> | null) => void;
    setCurrent: (current: ModelFile | null) => void;
}

export interface ModelContext extends ModelState, ModelActions {}

export interface SwitchModelProps {
    context: ModelContext;
}