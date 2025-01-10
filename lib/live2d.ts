import { Live2DModel, MotionManager, ExpressionManager, MotionState, MotionPriority } from "pixi-live2d-display-lipsyncpatch/cubism4";
import { MotionGroupEntry, ExpressionEntry } from "@/types/model";

export class CreateLive2DController {
    private static _instance: CreateLive2DController;
    
    private model: InstanceType<typeof Live2DModel>;
    private motionManager: MotionManager;
    private expressionManager: ExpressionManager | undefined;
    private motionState: MotionState;
    
    private currentExpressionIndex: number;
    private pendingExpressionIndex: number;

    public motionGroups: MotionGroupEntry[] = [];
    public expressionEntry: ExpressionEntry[] = [];

    constructor(model: InstanceType<typeof Live2DModel>) {
        CreateLive2DController._instance = this;
        
        this.model = model;
        this.motionManager = model.internalModel.motionManager;
        this.expressionManager = model.internalModel.motionManager.expressionManager;

        this.currentExpressionIndex = this.expressionManager?.expressions.indexOf(this.expressionManager.currentExpression) ?? -1;
        this.pendingExpressionIndex = this.expressionManager?.reserveExpressionIndex ?? -1;

        this.motionState = this.motionManager.state;

        this.initializeInstance();
    }

    private initializeInstance(): void {
        this._model().on("expressionSet", this.expressionSet.bind(this));
        this._model().on("expressionReserved", this.expressionReserved.bind(this));
        this._model().on("motionLoadError", this.motionLoadError.bind(this));
        this._model().on("expressionLoadError", this.expressionLoadError.bind(this));

        this.motionGroups = this.motions();
        this.expressionEntry = this.expressions();
    }

    public static get instance(): CreateLive2DController {
        if (!this._instance) {
            throw new Error('Live2DController has not been initialized');
        }
        return this._instance;
    }

    public motions() {
        const definitions = this.motionManager.definitions;
        for (const [group, motions] of Object.entries(definitions)) {
            this.motionGroups.push({
                name: group,
                motions: motions?.map((motion, index) => ({
                    file: motion.file || motion.File || "",
                    error: this.motionManager.motionGroups[group]![index]! === null ? "Failed to load" : undefined
                })) || []
            })
        }

        return this.motionGroups;
    };

    public setRandomMotion() {
        const groups = this.motionGroups;
        const randomGroup = groups[Math.floor(Math.random() * groups.length)];
        if (!randomGroup) return;

        this.motionManager.startRandomMotion(randomGroup.name, MotionPriority.NORMAL, {
            onFinish: () => {
                this.setRandomMotion();
            }
        });
    }

    public expressions() {
        const expressionManager = this.expressionManager;

        return this.expressionEntry = expressionManager?.definitions.map((expression, index) => ({
            file: expression.file || expression.File || "",
            error: expressionManager.expressions[index] === null ? "Failed to load" : undefined
        })) || [];
    }
    
    public startMotion(motionGroup: MotionGroupEntry, index: number) {
        this.motionManager.startMotion(motionGroup.name, index, MotionPriority.FORCE)
    }

    public setExpression(index: number) {
        this.expressionManager?.setExpression(index)
    }

    public expressionSet(index: number) {
        this.currentExpressionIndex = index;
    }

    public expressionReserved(index: number) {
        this.pendingExpressionIndex = index;
    }

    public setScale(scale: number) {
        this.model.scale.set(scale);
    }

    public setRotation(rotation: number) {
        this.model.rotation = rotation;
    }

    public currentState() {
        return this.motionState;
    }

    public speak(audio: string, expression?: string) {
        this.model.speak(audio, {
            volume: 1,
            resetExpression: true,
            expression: expression || undefined,
            onFinish: () => {
                console.log("Speech finished");
            },
            onError: (error) => {
                console.error(error);
            }
        });
    }

    public _model() {
        return this.model;
    }

    public motionLoadError(group: string, index: number, error: any) {
        const motionGroup = this.motionGroups.find(motionGroup => motionGroup.name === group);
        if (motionGroup) {
            motionGroup.motions[index]!.error = error;
        }
    }

    public expressionLoadError(index: number, error: any) {
        this.expressionEntry[index]!.error = error;
    }
}