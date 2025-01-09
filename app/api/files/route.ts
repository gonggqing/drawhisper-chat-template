import { listLive2DModels } from "@/lib/tools/list-files";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(): Promise<NextResponse> {
    try {
        // Log the current working directory and live2d path for debugging
        const cwd = process.cwd();
        const live2dPath = path.join(cwd, 'public', 'live2d');
        console.log('Current working directory:', cwd);
        console.log('Live2D path:', live2dPath);

        const models = listLive2DModels();
        console.log('Found models:', models);

        if (models.length === 0) {
            return NextResponse.json({ 
                message: "No models found", 
                debug: { 
                    cwd, 
                    live2dPath 
                } 
            }, { status: 404 });
        }

        return NextResponse.json(models);
    } catch (error) {
        console.error('Error listing models:', error);
        return NextResponse.json({ 
            error: "Failed to list models",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}