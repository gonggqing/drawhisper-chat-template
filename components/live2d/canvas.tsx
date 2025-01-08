"use client";

import { Application, Ticker, DisplayObject } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";
import { Button } from "@/components/ui/button";
import { Plus, CaretRight } from "@phosphor-icons/react";
import { draggable } from "@/lib/tools/dragging";
import { Settings } from "./settings";

const setModelPosition = (
  app: Application,
  model: InstanceType<typeof Live2DModel>
) => {
  const scaleX = (app.renderer.width * .4) / model.width;
  const scaleY = (app.renderer.height * .8) / model.height;
  model.scale.set(Math.min(scaleX, scaleY));
  model.x = app.renderer.width / 4;
  model.y = app.renderer.height / 4;
};

export interface Live2DConfig {
  canvas: {
    bg_color: string;
    bg_opacity: number;
  },
  model: {
    scale: number;
    random_motion: boolean;
  };
}

export default function Live2D() {
  const canvasContainerRef = useRef<HTMLCanvasElement>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [model, setModel] = useState<InstanceType<typeof Live2DModel> | null>(
    null
  );
  
  const [config, setConfig] = useState<Live2DConfig>({
    canvas: {
      bg_color: "#fff",
      bg_opacity: 0.8
    },
    model: {
      scale: 0.1,
      random_motion: false
    }
  });

  const initApp = () => {
    if (!canvasContainerRef.current) return;

    const app = new Application({
      width: canvasContainerRef.current.clientWidth,
      height: canvasContainerRef.current.clientHeight,
      view: canvasContainerRef.current,
      backgroundAlpha: 0.8,
      backgroundColor: "#fff",
      antialias: true,
      resolution: 2
    });

    setApp(app);
    initLive2D(app);
  };

  const initLive2D = async (currentApp: Application) => {
    if (!canvasContainerRef.current) return;

    try {
      const model = await Live2DModel.from(
        "/live2d/dafeng_3/dafeng_3.model3.json",
        { ticker: Ticker.shared }
      );

      currentApp.stage.addChild(model as unknown as DisplayObject);

      draggable(model);

      model.anchor.set(.5, .5);
      setModelPosition(currentApp, model);

      model.on("hit", (hitAreas) => {
        if (hitAreas.includes("*")) {
          model.motion("");
        }
      });

      setModel(model);

    } catch (error) {
      console.error("Failed to load Live2D model:", error);
    }
  };

  useEffect(() => {
    if (!app || !model ) return;

    const onResize = () => {
      if (!canvasContainerRef.current) return;

      app.renderer.resize(
        canvasContainerRef.current.clientWidth,
        canvasContainerRef.current.clientHeight
      );
      setModelPosition(app, model);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [app, model]);

  useEffect(() => {
    if (!app || !model) return;

    app.renderer.background.color = config.canvas.bg_color;
    app.renderer.background.alpha = config.canvas.bg_opacity;
    model.scale.set(config.model.scale);
    model.motion(config.model.random_motion ? "random" : "idle");


    const controls = document.querySelector(".live2d-controls");
    if (controls) {
      controls.innerHTML = `
        <div className="flex flex-row>
          <p>Motion Groups</p>
          <div className="flex flex-row gap-2 items-center justify-start">
            
          </div>
        </div>
      `
    }

  }, [config, app, model]);

  useEffect(() => {
    initApp();
  }, []);

  return (
      <div className="max-w-5xl w-full h-[768px] bg-accent relative">
        <div className="absolute top-2 left-4 bg-transparent z-10 flex flex-col gap-2">
          <Settings config={config} setConfig={setConfig} />
          <div className="live2d-controls flex flex-row gap-2 p-1.5 items-start justify-start font-mono text-muted-foreground" />
        </div>
        <canvas ref={canvasContainerRef} className="w-full h-full bg-accent rounded" />
      </div>
  )
}
