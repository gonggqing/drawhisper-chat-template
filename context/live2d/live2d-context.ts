import { createContext } from "react";

import { CreateLive2DController } from "@/lib/live2d";

export interface Live2DContextType {
    controller: InstanceType<typeof CreateLive2DController> | null;
}

export const Live2DContext = createContext<Live2DContextType>({
    controller: null
});