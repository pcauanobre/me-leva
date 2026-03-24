"use client";

import { createTheme } from "@mui/material/styles";

// Extend MUI palette to include a custom `50` shade
declare module "@mui/material/styles" {
  interface PaletteColor {
    50?: string;
  }
  interface SimplePaletteColorOptions {
    50?: string;
  }
}

// Design system inspired by the "Adote um pet" brand:
// Warm plum purple, friendly, rounded, pet-adoption vibe
const theme = createTheme({
  palette: {
    primary: {
      main: "#8B3FA0",     // warm plum purple (from the brand image)
      light: "#B06CC5",
      dark: "#6A2580",
      contrastText: "#FFFFFF",
      50: "#F8F0FA",       // very soft lavender background
    },
    secondary: {
      main: "#E8618C",     // warm rose pink
      light: "#F5A3BB",
      dark: "#C93D6A",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F5A623",
      light: "#FFCF70",
      dark: "#D4891A",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#4CAF7D",
      light: "#81D4A8",
      dark: "#2E8B5E",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#E85555",
      light: "#F5A0A0",
      dark: "#C53030",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FBF8FC",  // warm off-white with subtle lavender
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2D1B3D",  // deep plum for text (warmer than pure black)
      secondary: "#6B5A7B", // muted purple-gray
    },
    divider: "rgba(139, 63, 160, 0.10)", // subtle purple tint
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: "inherit",
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: "none" as const },
  },

  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none" as const,
          fontWeight: 600,
          minHeight: 40,
          transition: "all 0.2s ease",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 14 },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid",
          borderColor: "rgba(139, 63, 160, 0.10)",
          transition: "all 0.25s ease",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 600, transition: "all 0.15s ease" },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 18 },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        rounded: { borderRadius: 12 },
      },
    },
  },
});

export default theme;
