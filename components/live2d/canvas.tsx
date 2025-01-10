"use client";
import axios from "axios";
import { Application, Ticker, DisplayObject } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";
import { draggable } from "@/lib/tools/dragging";
import { Settings } from "./setting/settings";

import { ModelFile } from "@/lib/tools/list-files";
import { ModelContext } from "@/types/model";
import { Live2DProvider } from "@/context/live2d/live2d-provider";
import { CreateLive2DController } from "@/lib/live2d";

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

export interface CanvasConfig {
  canvas: {
    bg_color: string;
    bg_opacity: number;
  }
}

export default function Live2D() {
  const canvasContainerRef = useRef<HTMLCanvasElement>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [model, setModel] = useState<InstanceType<typeof Live2DModel> | null>(
    null
  );

  const [context, setContext] = useState<ModelContext | null>(null);

  const [models, setModels] = useState<ModelFile[]>([]);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string>();
  const [currentModel, setCurrentModel] = useState<ModelFile | null>(null);
  const [controller, setController] = useState<CreateLive2DController | null>(null);

  const [config, setConfig] = useState<CanvasConfig>({
    canvas: {
      bg_color: "#fff",
      bg_opacity: 0.8
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
  };

  const initLive2D = async (currentApp: Application, modelPath: string) => {
    if (!canvasContainerRef.current) return;

    try {
      const model = await Live2DModel.from(
        modelPath,
        { ticker: Ticker.shared }
      );

      currentApp.stage.addChild(model as unknown as DisplayObject);

      draggable(model);

      model.anchor.set(.5, .5);
      setModelPosition(currentApp, model);

      model.on("hit", (hitAreas) => {
        if (hitAreas.includes("")) {
          model.motion("idle");
        }
      });

      setModel(model);
      setController(new CreateLive2DController(model));

    } catch (error) {
      console.error("Failed to load Live2D model:", error);
      setModelError(`Failed to load model: ${modelPath}`);
    }
  };

  // adjust canvas size when window is resized
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

  // adjust canvas
  useEffect(() => {
    if (!app || !model) return;

    app.renderer.background.color = config.canvas.bg_color;
    app.renderer.background.alpha = config.canvas.bg_opacity;

  }, [config, app, model]);

  // fetch the model list and initialize live2d model
  useEffect(() => {
    async function fetchModels() {
      try {
        setModelLoading(true);
        const response = await axios.get<ModelFile[]>("/api/files");
        
        if (response.data.length === 0) {
          setModelError("No Live2D models found");
          return;
        }
        setModels(response.data);
        
        // If no model is currently loaded and we have the app instance
        if (!model && app && response.data.length > 0) {
          await initLive2D(app, response.data[0].path);
          setCurrentModel(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch model files:", error);
        setModelError("Failed to load model list");
      } finally {
        setModelLoading(false);
      }
    }

    if (app) {
      fetchModels();
    }
  }, [app]);

  // set context for settings and model-switch components
  useEffect(() => {
    if (!model || !app || !currentModel || !models) return;

    setContext({
      files: models,
      current: currentModel,
      model: model,
      isLoading: modelLoading,
      error: modelError,
      setModel: setModel,
      setCurrent: setCurrentModel,
    })
  }, [app, model, currentModel, models])

  // remove old model and set new model
  useEffect(() => {
    if (!model || !app || !currentModel || !models) return;
    app.stage.removeChild(model);
    initLive2D(app, currentModel.path);
  }, [currentModel])

  // initialize app
  useEffect(() => {
    initApp();
  }, []);

  return (
      <Live2DProvider data={{ controller }}>
        <div className="max-w-5xl w-full h-[768px] bg-accent relative">
          <div className="absolute top-2 left-4 bg-transparent z-10 flex flex-col gap-2">
            <Settings 
              config={config} 
              setConfig={setConfig} 
              context={context}
            />
            <div className="live2d-controls flex flex-row gap-2 p-1.5 items-start justify-start font-mono text-muted-foreground" />
          </div>
          <canvas ref={canvasContainerRef} className="w-full h-full bg-accent rounded" />
        </div>
      </Live2DProvider>
  )
}