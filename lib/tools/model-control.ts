import { MotionPriority, Live2DModel} from "pixi-live2d-display-lipsyncpatch/cubism4";
import { MotionGroupEntry } from "@/types/model";

export function startMotion(model: InstanceType<typeof Live2DModel>, motionGroup: MotionGroupEntry, index: number) {
    model.motion(motionGroup.name, index, MotionPriority.FORCE)
}

export function startRandomMotion(model: InstanceType<typeof Live2DModel>, motionGroups: MotionGroupEntry[]) {
    const randomGroup = motionGroups[Math.floor(Math.random() * motionGroups.length)];
    if (!randomGroup) return;

    model.internalModel.motionManager.startRandomMotion(randomGroup.name, MotionPriority.FORCE, {
        onFinish: () => {
            console.log(`Random motion finished: ${model.internalModel.motionManager.state.reservedIndex}`);
        }
    });
}

export function setDefaultMotion(model: InstanceType<typeof Live2DModel>) {
    model.motion("idle", 0, MotionPriority.FORCE);
    console.log(`Setting default motion: ${model.internalModel.motionManager.state.currentIndex}`);
};