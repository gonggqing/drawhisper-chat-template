import fs from "fs";
import path from "path";

export interface ModelFile {
    path: string;
    name: string;
}

function getBasePath(): string {
    const cwd = process.cwd();
    // Always use the public directory as base in both dev and prod
    return path.join(cwd, 'public');
}

export function listLive2DModels(): ModelFile[] {
    const basePath = getBasePath();
    const live2dPath = path.join(basePath, "live2d");
    const modelFiles: ModelFile[] = [];

    try {
        // Check if the live2d directory exists
        if (!fs.existsSync(live2dPath)) {
            console.warn("Live2D directory not found:", live2dPath);
            return modelFiles;
        }

        // Read all subdirectories in the live2d folder
        const directories = fs.readdirSync(live2dPath)
            .filter(item => {
                // Filter out .DS_Store and other hidden files
                return !item.startsWith('.');
            });

        console.log('Found directories:', directories);

        directories.forEach(dir => {
            const dirPath = path.join(live2dPath, dir);
            const stats = fs.statSync(dirPath);

            if (stats.isDirectory()) {
                try {
                    // Read all files in each subdirectory
                    const files = fs.readdirSync(dirPath)
                        .filter(file => !file.startsWith('.'));  // Filter out hidden files
                    
                    console.log(`Files in ${dir}:`, files);
                    
                    // Find .model3.json files
                    const modelFile = files.find(file => file.endsWith(".model3.json"));
                    
                    if (modelFile) {
                        // Create relative path that works in both browser and server
                        const relativePath = path.posix.join("/live2d", dir, modelFile);
                        console.log(`Found model in ${dir}:`, relativePath);
                        modelFiles.push({
                            path: relativePath,
                            name: dir
                        });
                    } else {
                        console.warn(`No .model3.json file found in ${dir}`);
                    }
                } catch (dirError) {
                    console.warn(`Error reading directory ${dir}:`, dirError);
                }
            }
        });

        console.log('Total models found:', modelFiles.length);
        return modelFiles;
    } catch (error) {
        console.error("Error reading Live2D models:", error);
        return modelFiles;
    }
}

// Helper function to validate a Live2D model directory structure
export function validateModelDirectory(dirPath: string): boolean {
    try {
        if (!fs.existsSync(dirPath)) return false;
        
        const files = fs.readdirSync(dirPath);
        
        // Must have a .model3.json file
        const hasModelFile = files.some(file => file.endsWith(".model3.json"));
        if (!hasModelFile) return false;
        
        // Should have textures directory or texture files
        const hasTextures = files.some(file => 
            file === "textures" || 
            file.endsWith(".png") || 
            file.endsWith(".webp")
        );
        if (!hasTextures) return false;
        
        // Should have motions directory or motion files
        const hasMotions = files.some(file => 
            file === "motions" || 
            file.endsWith(".motion3.json")
        );
        
        return hasMotions;
    } catch (error) {
        console.error("Error validating model directory:", error);
        return false;
    }
}
