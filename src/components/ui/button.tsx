import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border-[1px] rounded-lg shadow-md text-sm font-[700] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300",
  {
    variants: {
      variant: {

        primary: "bg-accentBlue text-blue hover:bg-accentBlueHover border-accentBlue",
        secondary: "bg-white/10 text-accentBlue border-white/10",
        darkOutline: "text-blue bg-white border-blue hover:bg-gray-100",
        darkBackground: "bg-blueDark text-accentBlue border-blueDark hover:bg-blueDark/80",
        ghost:"hover:bg-muted hover:text-foreground !border-none aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
      },
      size: {
        default: "py-2 px-5",
        xs: "py-1 px-2",
        sm: "py-2  px-3",
        lg: "py-4  px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);




export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  styleOverrideClassName?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      styleOverrideClassName,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          className,
          styleOverrideClassName,
          // 'px-5'
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };


