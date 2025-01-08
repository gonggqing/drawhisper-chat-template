"use client";

import { Application, Ticker, DisplayObject, EventSystem } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";
import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react";

const setModelPosition = (
  app: Application,
  model: InstanceType<typeof Live2DModel>
) => {
  const scale = (app.renderer.width * 0.75) / model.width;
  model.scale.set(scale);
  model.x = app.renderer.width / 2;
  model.y = app.renderer.height / 2;
};

export default function Live2D() {
  const canvasContainerRef = useRef<HTMLCanvasElement>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [model, setModel] = useState<InstanceType<typeof Live2DModel> | null>(
    null
  );

  const initApp = () => {
    if (!canvasContainerRef.current) return;

    const app = new Application({
      width: canvasContainerRef.current.clientWidth,
      height: canvasContainerRef.current.clientHeight,
      view: canvasContainerRef.current,
      backgroundAlpha: 0.3,
      antialias: true,
      resizeTo: window
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
      console.log(`Client size: ${canvasContainerRef.current.clientWidth}, ${canvasContainerRef.current.clientHeight}`);

      setModelPosition(app, model);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [app, model]);

  useEffect(() => {
    initApp();
  }, []);

  return (
      <div className="max-w-7xl w-full h-[1024px] bg-accent relative">
        <div className="absolute top-2 left-2 bg-transparent z-10">
          <Button variant="ghost" size="icon" className="h-12 w-12 bg-pink-200 hover:bg-pink-300 rounded-full hover:rotate-90 transition-transform duration-500">
            <Plus size={32} weight="bold" />
          </Button>
        </div>
        <canvas ref={canvasContainerRef} className="w-full h-full bg-accent rounded" />
      </div>
  )
}
