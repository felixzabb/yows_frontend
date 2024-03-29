type OverlayContextData = {
  title: string
  element: JSX.Element | null
};

type AlertContextData = {
  text: string
  color: "red" | "neutral" | "green"
};

type ThemeContextData = "dark" | "light";

type OverlayContextValue = {
  data: OverlayContextData
  change: ({ title, element } : OverlayContextData) => void
};

type AlertContextValue = {
  data: AlertContextData
  change: ({ text, color } : AlertContextData) => void
};

type ThemeContextValue = {
  data: ThemeContextData
  change: (theme : ThemeContextData) => void
};