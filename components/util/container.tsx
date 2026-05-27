import { cn } from "@/lib/utils";

const PADDING_CLASSES = {
  large: "py-16 md:py-28 px-5 md:px-16",
  none: ""
}


export default function Container({ children, className, padding = 'none' }: { children: React.ReactNode, className?: string, padding?: keyof typeof PADDING_CLASSES }) {
  return <div className={cn("w-full max-w-7xl mx-auto px-5 md:px-8", className, PADDING_CLASSES[padding])}>{children}</div>;
}