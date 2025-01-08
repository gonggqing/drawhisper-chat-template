"use client";

import { useEffect, useState } from "react";
import { Plus, CaretRight, Palette, PersonSimple, PersonSimpleWalk } from "@phosphor-icons/react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";

import { ColorPicker, useColor, IColor } from "react-color-palette";
import "react-color-palette/css";

import { Live2DConfig } from "./canvas";


export function Settings({ config, setConfig }: { config: Live2DConfig, setConfig: (config: Live2DConfig) => void }) {

    const [open, setOpen] = useState(true);
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [color, setColor] = useColor(config.canvas.bg_color);
    const [randomMotion, setRandomMotion] = useState(config.model.random_motion);

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

    const handleScaleChange = (value: number) => {
        setConfig({
            ...config,
            model: {
                ...config.model,
                scale: value
            }
        })
    }

    return (
        <div className="flex flex-col gap-2 items-start justify-start">
            <div className="flex flex-row gap-2 items-center justify-start">
                <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn(
                        "h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#e2eafc] transition-all rounded-full duration-500",
                        open && "rotate-90 bg-[color:#e2eafc]"
                    )}>
                        <CaretRight size={24} weight="bold" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72 p-2 bg-[color:#edf2fb] border border-[color:#e2eafc] rounded">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-base text-muted-foreground">Canvas</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {e.preventDefault()}} className="bg-[color:#edf2fb]">
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
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-base text-muted-foreground">Character</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {e.preventDefault()}} className="bg-[color:#edf2fb]">
                                <div className="flex flex-col gap-2 items-start justify-start">
                                    <p className="text-sm font-mono text-muted-foreground">Scale</p>
                                    <div className="flex flex-row gap-2 items-center justify-between">
                                        <Slider 
                                            className="w-52" 
                                            max={2} 
                                            min={0.01} 
                                            defaultValue={[config.model.scale]} 
                                            step={0.01} 
                                            onValueChange={(value) => {
                                                handleScaleChange(value[0])
                                            }} 
                                        />
                                        <p className="text-sm font-mono text-muted-foreground">{config.model.scale}</p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" 
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
                <Button variant="ghost" size="icon" 
                    className={cn(
                        "h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#d7e3fc] transition-all rounded-full duration-500",
                        randomMotion && "bg-[color:#d7e3fc]"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        setRandomMotion(!randomMotion);
                    }}
                    >
                    { randomMotion ? <PersonSimpleWalk size={24} weight="fill" /> : <PersonSimple size={24} weight="fill" /> }
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