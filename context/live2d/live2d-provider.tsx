"use client";

import { Live2DContext, Live2DContextType } from "./live2d-context";

export const Live2DProvider = ({ children, data }: { children: React.ReactNode, data: Live2DContextType }) => {
    return (
        <Live2DContext.Provider value={data}>
            {children}
        </Live2DContext.Provider>
    )
}