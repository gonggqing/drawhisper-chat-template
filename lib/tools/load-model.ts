import { MotionGroupEntry, ExpressionEntry } from "@/components/live2d/character-manager";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";

export function loadedModelConfig(model: InstanceType<typeof Live2DModel>): {
    motionGroups: MotionGroupEntry[];
    expressions: ExpressionEntry[];
  } {
    let motionGroups: MotionGroupEntry[] = [];
    let expressions: ExpressionEntry[] = [];
  
    const motionManager = model.internalModel.motionManager;
    const motionDefinitions = motionManager.definitions;
  
    const expressionManager = motionManager.expressionManager;
    const expressionDefinitions = expressionManager?.definitions;
  
    for (const [group, motions] of Object.entries(motionDefinitions)) {
      motionGroups.push({
        name: group,
        motions: motions?.map((motion, index) => ({
          file: motion.file || motion.File || "",
          error: motionManager.motionGroups[group]![index]! === null ? "Failed to load" : undefined
        })) || []
      });
    };
      
    expressions = expressionDefinitions?.map((expression, index) => ({
      file: expression.file || expression.File || "",
      error: expressionManager?.expressions[index]! === null ? "Failed to load" : undefined
    })) || [];
      
    return { motionGroups, expressions };
  }