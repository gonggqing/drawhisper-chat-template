"use client";

export interface MotionGroupEntry {
    name: string;
    motions: {
        file: string;
        error?: any;
    }[]
}

export interface ExpressionEntry {
    file: string;
    error?: any;
}

import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";
import { startMotion } from "@/lib/tools/model-control";
import { DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface CharacterMotionManagerProps {
    model: InstanceType<typeof Live2DModel>;
    motionGroups: MotionGroupEntry[];
    expressions: ExpressionEntry[];
}

export function CharacterMotionManager({model, motionGroups, expressions}: CharacterMotionManagerProps) {
    return (
        <span>
        <DropdownMenuItem className="bg-[color:#edf2fb] h-64 overflow-y-auto flex flex-col gap-2 items-start justify-start">
            <p className="text-muted-foreground font-mono text-sm">Motions</p>
            {motionGroups.map((group, i) => {
                return (
                    <div key={`${group.name}-${i}`} className="w-full flex flex-col gap-1.5">
                        <p className="text-muted-foreground mx-auto">{group.name || "Unknown"}</p>
                        {group.motions.map((motion, index) => {
                            return (
                                <Button 
                                    key={index}
                                    variant={"ghost"}
                                    size={"sm"}
                                    className="bg-[color:#edf2fb] hover:bg-[color:#e2eafc] transition-all rounded duration-300"
                                    onClick={() => startMotion(model, group, index)}
                                >
                                    {motion.file.replace('.mtn', '').replace('.motion3.json', '')}
                                </Button>
                            )
                        })}
                    </div>
                )
            })}
        </DropdownMenuItem>
        <DropdownMenuItem>
            <p className="text-muted-foreground font-mono text-sm">Expressions</p>
            {expressions.map((expression, index) => {
                return (<button key={index}>${expression.file.replace('.exp.json', '').replace('.exp3.json', '')}</button>);
            })}
        </DropdownMenuItem>
        </span>
    )
}