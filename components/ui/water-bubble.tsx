import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "@/styles/water-bubble.css";

const waterBubbleVariant = cva(
  "water-bubble-container flex gap-2 max-w-[45%] items-end relative group",
  {
    variants: {
      variant: {
        loading: "animate",
        finished: "opacity-90",
      },
    },
  },
);
interface WaterBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof waterBubbleVariant> {}

const WaterBubble = React.forwardRef<HTMLDivElement, WaterBubbleProps>(
  ({ className, variant, ...props }, ref) => (
    <div className={cn(waterBubbleVariant({ className, variant }))} ref={ref} {...props} >
        <div className="water-bubble" style={{ 
          animationPlayState: variant === "loading" ? "running" : "paused",
          animation: variant === "loading" ? "animate 2s ease-in-out infinite" : "animate 2s ease-in-out",
          }} />
    </div>
  ),
);

export { WaterBubble };