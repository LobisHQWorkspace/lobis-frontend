import ReactDOM from "react-dom";
import Root from "./Root";
import store from "./store/store";
import { Provider } from "react-redux";
import { Web3ContextProvider } from "./hooks";
import { SnackbarProvider } from "notistack";
import SnackMessage from "./components/Messages/snackbar";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "./theme/theme";

ReactDOM.render(
    <SnackbarProvider
        maxSnack={4}
        anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
        }}
        content={(key, message: string) => <SnackMessage id={key} message={JSON.parse(message)} />}
        autoHideDuration={3 * 60000}
    >
        <Provider store={store}>
            <Web3ContextProvider>
                <ThemeProvider theme={theme}>
                    <Root />
                </ThemeProvider>
            </Web3ContextProvider>
        </Provider>
    </SnackbarProvider>,
    document.getElementById("root"),
);
