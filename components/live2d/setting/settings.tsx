"use client";

import { useState } from "react";
import { Plus, CaretRight, Palette } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuGroup, 
    DropdownMenuLabel, 
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

import { cn } from "@/lib/utils";

import { motion } from "framer-motion";

import { ColorPicker, useColor, IColor } from "react-color-palette";
import "react-color-palette/css";

import { CanvasConfig } from "../canvas";
import { Live2DController } from "@/components/live2d/utils/controller";

import { ModelContext } from "@/types/model";
import { SwitchModelButton } from "@/components/live2d/utils/switch-model";
import { VoiceButton } from "@/components/live2d/utils/voice";
import { VoiceClone } from "@/components/voice/voice-clone";


export function Settings({ config, setConfig, context }: { config: CanvasConfig, setConfig: (config: CanvasConfig) => void, context: ModelContext | null }) {

    const [open, setOpen] = useState(false);
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [color, setColor] = useColor(config.canvas.bg_color);
    const [expanded, setExpanded] = useState(true);
    const [voiceCloneOpen, setVoiceCloneOpen] = useState(false);

    const handleColorChange = (newColor: IColor) => {
        setConfig({
            ...config,
            canvas: {
                ...config.canvas,
                bg_color: newColor.hex
            }
        });
    };

    const handleAlphaChange = (value: number) => {
        setConfig({
            ...config,
            canvas: {
                ...config.canvas,
                bg_opacity: value
            }
        })
    }

    const handleReset = () => {
        setConfig({
            canvas: {
                bg_opacity: 0.8,
                bg_color: "#fff"
            }
        })
    }

    return (
        <div className="flex flex-col gap-2 items-start justify-start">
            <div className="flex flex-row gap-2 items-center justify-start">
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                    <Button variant="light_blue" size="icon" className={cn(
                        "h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#e2eafc] transition-all rounded-full duration-500",
                        open && "rotate-90 bg-[color:#e2eafc]"
                    )}>
                        <CaretRight size={24} weight="bold" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72 max-h-[85dvh] p-2 bg-accent border border-accent-foreground/10 rounded">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-base text-muted-foreground">Canvas</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {e.preventDefault()}} className="bg-accent">
                                <div className="flex flex-col gap-2 items-start justify-start">
                                    <p className="text-sm font-mono text-muted-foreground">Alpha</p>
                                    <div className="flex flex-row gap-2 items-center justify-between">
                                        <Slider 
                                            className="w-52" 
                                            max={1} 
                                            min={0.01} 
                                            defaultValue={[config.canvas.bg_opacity]} 
                                            step={0.01} 
                                            onValueChange={(value) => {
                                                handleAlphaChange(value[0])
                                            }} 
                                        />
                                        <p className="text-sm font-mono text-muted-foreground">{config.canvas.bg_opacity}</p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        {context && context.model && (
                            <Live2DController model={context.model} />
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className={cn(
                    "flex flex-row gap-2 items-center justify-start",
                    !expanded && "hidden"
                )}>
                    <motion.div 
                        className="flex flex-row gap-2 items-center justify-start"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: expanded ? 1 : 0, scale: expanded ? 1 : 0.95 }}
                        transition={{ duration: 0.2 }}
                        key="settings-container"
                    >
                        <Button variant="light_blue" size="icon" 
                            key="color-picker"
                            className={cn(
                                "h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#d7e3fc] transition-all rounded-full duration-500",
                                colorPickerOpen && "bg-[color:#d7e3fc]"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                setColorPickerOpen(!colorPickerOpen);
                            }}
                        >
                            <Palette size={24} weight="fill" />
                        </Button>
                        {context && (
                            <SwitchModelButton context={context} />
                        )}
                        <VoiceButton />
                        <VoiceClone open={voiceCloneOpen} setOpen={setVoiceCloneOpen} />
                    </motion.div>
                </div>
                <Button 
                    variant="light_blue" 
                    size="icon" 
                    className="h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#d7e3fc] transition-all rounded-full duration-500"
                    key="expand-settings"
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                >
                    <Plus size={24} weight="bold" className={cn("transition-transform duration-300", expanded && "rotate-45")} />
                </Button>
            </div>
            <div className="relative w-[384px] h-[448px] bg-transparent z-10">
                {
                    colorPickerOpen && (
                        <div className="absolute top-2 left-6 w-full">
                            <ColorPicker hideAlpha hideInput={["hsv"]} color={color} onChange={setColor} onChangeComplete={handleColorChange} />
                        </div>
                    )
                }
            </div>
        </div>
    )
}