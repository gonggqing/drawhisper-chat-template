"use client";

import { useEffect, useState } from "react";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";
import { CreateLive2DController } from "@/lib/live2d";
import { MotionGroupEntry, ExpressionEntry } from "@/types/model";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ArrowCounterClockwise, PersonSimpleWalk } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useContext } from "react";
import { Live2DContext } from "@/context/live2d/live2d-context";

interface Live2DControllerProps {
    model: InstanceType<typeof Live2DModel>;
}

export function Live2DController({ model }: Live2DControllerProps) {
    // model basic
    const { controller } = useContext(Live2DContext);
    const [motionGroups, setMotionGroups] = useState<MotionGroupEntry[]>([]);
    const [expressions, setExpressions] = useState<ExpressionEntry[]>([]);
    // model control
    const [randomMotion, setRandomMotion] = useState(false);
    const [scale, setScale] = useState(model.scale.x);
    const [rotation, setRotation] = useState(model.rotation);

    useEffect(() => {
        if (!controller) return;
        setMotionGroups(controller.motionGroups);
        setExpressions(controller.expressionEntry);
    }, [controller]);

    const handleRandomMotion = () => {
        if (!controller) return;
        
        if (!randomMotion) {
            setRandomMotion(true);
            controller.setRandomMotion();
        } else {
            // Start the default idle motion
            setRandomMotion(false);
            controller.startMotion(motionGroups[0], 0);
        }
    };

    const handleMotionStart = (group: MotionGroupEntry, index: number) => {
        if (!controller) return;
        controller.startMotion(group, index);
    };

    const handleExpressionChange = (index: number) => {
        if (!controller) return;
        controller.setExpression(index);
    };

    const handleScaleChange = (value: number) => {
        if (!controller) return;
        setScale(value);
        controller.setScale(value);
    };

    const handleRotationChange = (value: number) => {
        if (!controller) return;
        setRotation(value);
        controller.setRotation(value);
    };

    const handleReset = () => {
        if (!controller) return;
        controller.setScale(0.1);
        controller.setRotation(0);
        controller.startMotion(motionGroups[0], 0);
        setScale(0.1);
        setRotation(0);
        setRandomMotion(false);
    }

    return (
        <>
            <DropdownMenuGroup>
                <DropdownMenuLabel className="text-base text-muted-foreground">Character Control</DropdownMenuLabel>
                <DropdownMenuItem onClick={(e) => {e.preventDefault()}} className="bg-[color:#edf2fb]">
                    <div className="flex flex-col gap-2 items-start justify-start">
                        <p className="text-sm font-mono text-muted-foreground">Scale</p>
                        <div className="flex flex-row gap-2 items-center justify-between">
                            <Slider 
                                className="w-52" 
                                max={2} 
                                min={0.01} 
                                defaultValue={[scale]} 
                                step={0.01} 
                                onValueChange={(value) => {
                                    handleScaleChange(value[0])
                                }} 
                            />
                            <p className="text-sm font-mono text-muted-foreground">{scale}</p>
                        </div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {e.preventDefault()}} className="bg-[color:#edf2fb]">
                    <div className="flex flex-col gap-2 items-start justify-start">
                        <p className="text-sm font-mono text-muted-foreground">Rotation</p>
                        <div className="flex flex-row gap-2 items-center justify-between">
                            <Slider 
                                className="w-52" 
                                max={Math.PI * 2} 
                                min={0} 
                                defaultValue={[rotation]} 
                                step={0.01} 
                                onValueChange={(value) => {
                                    handleRotationChange(value[0])
                                }} 
                            />
                            <p className="text-sm font-mono text-muted-foreground">{rotation}</p>
                        </div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.preventDefault()} className="flex flex-row gap-2 items-center justify-between bg-[color:#edf2fb]">
                    <span className="text-sm font-mono text-muted-foreground">Random Motion</span>
                    <Button variant="ghost" size="icon" 
                        className={cn(
                            "h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#d7e3fc] transition-all rounded-full duration-500",
                        )}
                        onClick={handleRandomMotion}
                    >
                         <PersonSimpleWalk size={24} weight="fill" />
                    </Button>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.preventDefault()} className="flex flex-row gap-2 items-center justify-between bg-[color:#edf2fb]">
                    <span className="text-sm font-mono text-muted-foreground">Reset</span>
                    <Button variant="ghost" size="icon" 
                        className={cn(
                            "h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#d7e3fc] transition-all rounded-full duration-500",
                        )}
                        onClick={handleReset}
                    >
                         <ArrowCounterClockwise size={24} weight="fill" />
                    </Button>
                </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => e.preventDefault()} className="flex flex-col gap-2 items-start justify-start w-full">
                    <p className="text-sm font-mono text-muted-foreground">Motions</p>
                    {motionGroups.map((group, groupIndex) => (
                            <div onClick={(e) => e.preventDefault()} key={group.name} className="flex flex-col w-full gap-2 bg-[color:#edf2fb] h-48 overflow-y-auto">
                                <span className="text-sm font-mono text-muted-foreground capitalize">{group.name}</span>
                                <div className="flex flex-col gap-2 w-full">
                                    {group.motions.map((motion, index) => (
                                        <Button
                                            key={`${group.name}-${index}`}
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 w-full bg-[color:#e2eafc] hover:bg-[color:#d7e3fc] transition-all rounded duration-500",
                                                motion.error && "opacity-50 cursor-not-allowed"
                                            )}
                                            onClick={() => handleMotionStart(group, index)}
                                            disabled={!!motion.error}
                                        >
                                            {motion.file.replace(".mnt", "").replace(".motion3.json", "")}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}
            </DropdownMenuItem>
            {expressions.length > 0 && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <DropdownMenuLabel className="text-sm font-mono text-muted-foreground">Expressions</DropdownMenuLabel>
                        <div className="flex flex-row gap-2 flex-wrap bg-[color:#edf2fb] h-32 overflow-y-auto">
                            {expressions.map((expression, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-8 px-2 bg-[color:#e2eafc] hover:bg-[color:#d7e3fc] transition-all rounded-full duration-500",
                                        expression.error && "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={() => handleExpressionChange(index)}
                                    disabled={!!expression.error}
                                >
                                    {expression.file.replace(".exp.json", "").replace(".exp3.json", "")}
                                </Button>
                            ))}
                        </div>
                    </DropdownMenuItem>
                </>
            )}
            </DropdownMenuGroup>
        </>
    );
}
