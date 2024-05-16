import colors from "daisyui/src/theming/themes";
import { ThemeContext } from "@/app/context/ThemeContext";
import {useContext, useEffect, useState} from "react";
import Color from 'colorjs.io';

interface ThemeColors {
  primary: string;
  'primary-content': string;
  secondary: string;
  'secondary-content': string;
  accent: string;
  'accent-content': string;
  neutral: string;
  'neutral-content': string;
  'base-100': string;
  'base-200': string;
  'base-300': string;
  'base-content': string;
  info: string;
  'info-content': string;
  success: string;
  'success-content': string;
  warning: string;
  'warning-content': string;
  error: string;
  'error-content': string;
}



export default function useThemeColors(): [ThemeColors | undefined, (color?: string, opacity?: number) => string | undefined] {
  const { theme }: {theme?: string} = useContext(ThemeContext);
  const [themeColors, setThemeColors] = useState<ThemeColors | undefined>();

  function alphaColor(color?: string, opacity: number = 100) {
    if (!color) return;
    if (!opacity) return color;
    if (opacity < 0)  {
      opacity = 0;
    }
    if (opacity > 100) {
      opacity = 100;
    }

    const newColor = new Color(color)
    newColor.alpha = opacity / 100  ;
    return newColor.toString();
  }

  useEffect(() => {
    if (theme) {
      // @ts-ignore
      setThemeColors(colors[theme]);
    }
  }, [theme]);

  return [themeColors, alphaColor];
}
