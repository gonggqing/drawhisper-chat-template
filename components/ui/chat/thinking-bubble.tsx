import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ChatBubble
const thinkingBubbleVariant = cva(
  "flex gap-2 max-w-[45%] items-end relative group bg-accent px-1 py-1.5 rounded-md",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  },
);

interface ThinkingBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof thinkingBubbleVariant> {}

    const ThinkingBubble = React.forwardRef<HTMLDivElement, ThinkingBubbleProps>(
        ({ className, variant, layout, children, ...props }, ref) => (
          <div
            className={cn(
              thinkingBubbleVariant({ variant, layout, className }),
              "relative group",
            )}
            ref={ref}
            {...props}
          >
            {React.Children.map(children, (child) =>
              React.isValidElement(child) && typeof child.type !== "string"
                ? React.cloneElement(child, {
                    variant,
                    layout,
                  } as React.ComponentProps<typeof child.type>)
                : child,
            )}
          </div>
        ),
      );
      ThinkingBubble.displayName = "ThinkingBubble";

      export { ThinkingBubble };