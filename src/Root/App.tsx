import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import Loading from "../components/Loader";
import ViewBase from "../components/ViewBase";
import { useAddress, useWeb3Context } from "../hooks";
import useBonds from "../hooks/bonds";
import { calculateUserBondDetails, loadAccountDetails } from "../store/slices/account-slice";
import { loadAppDetails } from "../store/slices/app-slice";
import { calcBondDetails } from "../store/slices/bond-slice";
import { IReduxState } from "../store/slices/state.interface";
import { Airdrop, Bond, ChooseBond, Dashboard, Governance, LobisMeter, NotFound, Stake, Vote } from "../views";
import "./style.scss";

function App() {
    const dispatch = useDispatch();

    const { connect, provider, hasCachedProvider, chainID, connected } = useWeb3Context();
    const address = useAddress();

    const [walletChecked, setWalletChecked] = useState(false);
    const [initialLoad, setInitialLoad] = useState(false);
    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const isAppLoaded = useSelector<IReduxState, boolean>(state => !Boolean(state.app.marketPrice));

    const { bonds } = useBonds();

    async function loadDetails(whichDetails: string) {
        let loadProvider = provider;

        if (whichDetails === "app") {
            loadApp(loadProvider);
        }

        if (whichDetails === "account" && address && connected) {
            loadAccount(loadProvider);
            if (isAppLoaded) return;

            loadApp(loadProvider);
        }

        if (whichDetails === "userBonds" && address && connected) {
            bonds.map(bond => {
                dispatch(calculateUserBondDetails({ address, bond, provider, networkID: chainID }));
            });
        }
    }

    const loadApp = useCallback(
        loadProvider => {
            dispatch(loadAppDetails({ networkID: chainID, provider: loadProvider }));
            bonds.map(bond => {
                dispatch(calcBondDetails({ bond, value: null, provider: loadProvider, networkID: chainID }));
            });
        },
        [connected],
    );

    const loadAccount = useCallback(
        loadProvider => {
            dispatch(loadAccountDetails({ networkID: chainID, address, provider: loadProvider }));
        },
        [connected],
    );

    useEffect(() => {
        if (hasCachedProvider()) {
            connect().then(() => {
                setWalletChecked(true);
            });
        } else {
            setWalletChecked(true);
        }
    }, []);

    useEffect(() => {
        if (walletChecked) {
            loadDetails("app");
            loadDetails("account");
            loadDetails("userBonds");
            setInitialLoad(true);
        }
    }, [walletChecked]);

    useEffect(() => {
        if (connected) {
            loadDetails("app");
            loadDetails("account");
            loadDetails("userBonds");
            setInitialLoad(true);
        }
    }, [connected]);

    if (!initialLoad) return <Loading />;

    return (
        <ViewBase>
            <Switch>
                <Route exact path="/dashboard">
                    <Dashboard />
                </Route>

                <Route exact path="/governance">
                    <Governance />
                </Route>

                <Route exact path="/">
                    <Redirect to="/stake" />
                </Route>

                <Route path="/stake">
                    <Stake />
                </Route>

                <Route path="/mints">
                    {bonds.map(bond => {
                        return (
                            <Route exact key={bond.name} path={`/mints/${bond.name}`}>
                                <Bond bond={bond} />
                            </Route>
                        );
                    })}
                    <ChooseBond />
                </Route>
                <Route path="/calculator">
                    <LobisMeter />
                </Route>
                <Route path="/vote">
                    <Vote />
                </Route>
                <Route path="/airdrop">
                    <Airdrop merkleIndex={0} />
                </Route>

                <Route path="/airdrop-2">
                    <Airdrop merkleIndex={1} />
                </Route>

                <Route component={NotFound} />
            </Switch>
        </ViewBase>
    );
}

export default App;
