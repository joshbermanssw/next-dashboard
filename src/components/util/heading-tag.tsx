import * as React from "react";
import { cn } from "@/lib/utils";
import { curlyBracketFormatter } from "@/components/util/curly-bracket-formatter";

type HeadingTagProps = {
  children: React.ReactNode;
  level: number;
  className?: string;
  backgroundColor?: 'black' | 'white' | 'blueDarker';
};
export default function HeadingTag({
  children,
  level,
  backgroundColor = 'black',
  className,
}: HeadingTagProps) {
  const HEADING_WEIGHT = "font-[600]";

  // TODO Fix ANY cast
  const HeadingTag = `h${level}` as any;
  const typography: any = {
    1: "text-[2.5rem] sm:text-[4rem] leading-[1.2]", //64px 
    2: "text-[2.5rem] sm:text-[3.5rem] leading-[1.2]", //56
    3: "text-[2.25rem] sm:text-[3rem] leading-[1.2] ", //48
    4: "text-[2rem] sm:text-[2.5rem] leading-[1.3] ", //40 
    5: "text-[1.5rem] sm:text-[2rem] leading-[1.4]", //32
    6: "text-[1.25rem] sm:text-[1.5rem] leading-[1.4]", //24px
  };

  const backgroundColorClass = {
    'black': 'text-blueLightest',
    'white': 'text-blueDark',
    'blueDarker': 'text-blueLightest',
  }

  const id = children?.toString()?.toLowerCase()?.replace(/ /g, '-')

  return (
    <HeadingTag id={id}
      className={cn(HEADING_WEIGHT, `${typography[level]}`, backgroundColorClass[backgroundColor], className)}
    >
      {curlyBracketFormatter(children)}
    </HeadingTag>
  );
}
