import { createTheme } from "@material-ui/core/styles";

export const theme = createTheme({
    palette: {
        type: "dark",
    },
    typography: {
        fontFamily: "Montserrat",
    },
    overrides: {
        MuiButton: {
            root: {
                textTransform: "none",
            },
            text: {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "16px",
                fontFamily: "Montserrat",
            },
            containedPrimary: {
                background: "rgba(255, 255, 255, 0.2)!important",
                backgroundColor: "#ccc",
                boxShadow: "none",
            },
        },
    },
});
