import { Paper, TableRow, TableCell, Slide, Link, Table, TableHead, TableContainer, Grid, TableBody, TableFooter } from "@material-ui/core";
import { IReduxState } from "../../store/slices/state.interface";
import { IAppSlice } from "../../store/slices/app-slice";
import "./treasuryTable.scss";
import { useSelector } from "react-redux";
function TreasuryTable() {
    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const app = useSelector<IReduxState, IAppSlice>(state => state.app);
    const crvPerLobi = app.crvTreasuryBalance / (app.totalSupply - app.multisigLobiBalance);
    const crvUSDPerLobi = (app.crvTreasuryBalance * app.crvPrice) / (app.totalSupply - app.multisigLobiBalance);
    const fxsPerLobi = app.fraxTreasuryBalance / (app.totalSupply - app.multisigLobiBalance);
    const fxsUSDPerLobi = (app.fraxTreasuryBalance * app.fxsPrice) / (app.totalSupply - app.multisigLobiBalance);
    const tokePerLobi = app.tokeTreasuryBalance / (app.totalSupply - app.multisigLobiBalance);
    const tokeUSDPerLobi = (app.tokeTreasuryBalance * app.tokePrice) / (app.totalSupply - app.multisigLobiBalance);
    const sdtPerLobi = app.treasurySdtBalance / (app.totalSupply - app.multisigLobiBalance);
    const sdtUSDPerLobi = (app.treasurySdtBalance * app.sdtPrice) / (app.totalSupply - app.multisigLobiBalance);
    const anglePerLobi = app.angleTreasuryBalance / (app.totalSupply - app.multisigLobiBalance);
    const angleUSDPerLobi = (app.angleTreasuryBalance * app.anglePrice) / (app.totalSupply - app.multisigLobiBalance);
    const gOhmPerLobi = app.gOhmTreasuryBalance / (app.totalSupply - app.multisigLobiBalance);
    const gOhmUSDPerLobi = (app.gOhmTreasuryBalance * app.gOhmPrice) / (app.totalSupply - app.multisigLobiBalance);
    const totalUSDPerLobi = crvUSDPerLobi + fxsUSDPerLobi + tokeUSDPerLobi;

    return (
        <Grid container item>
            <TableContainer className="treasury-balance-view-card-table">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">
                                <p className="treasury-balance-view-card-table-title">Token</p>
                            </TableCell>
                            <TableCell align="center">
                                <p className="treasury-balance-view-card-table-title">Treasury</p>
                            </TableCell>
                            <TableCell align="center">
                                <p className="treasury-balance-view-card-table-title">Token Price (USD)</p>
                            </TableCell>
                            <TableCell align="center">
                                <p className="treasury-balance-view-card-table-title">Reserve Values (USD)</p>
                            </TableCell>
                            <TableCell align="center">
                                <p className="treasury-balance-view-card-table-title">Backing Per LOBI (votes)</p>
                            </TableCell>
                            <TableCell align="center">
                                <p className="treasury-balance-view-card-table-title">Backing Per LOBI (USD)</p>
                            </TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow className="data-row">
                            <TableCell align="left" className="token-name-title">
                                CRV
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.crvTreasuryBalance)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(app.crvPrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.crvTreasuryBalance * app.crvPrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(crvPerLobi)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(crvUSDPerLobi)}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="left" className="token-name-title">
                                FXS
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.fraxTreasuryBalance)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(app.fxsPrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.fraxTreasuryBalance * app.fxsPrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(fxsPerLobi)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(fxsUSDPerLobi)}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="left" className="token-name-title">
                                TOKE
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.tokeTreasuryBalance)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(app.tokePrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.tokeTreasuryBalance * app.tokePrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(tokePerLobi)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(tokeUSDPerLobi)}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="left" className="token-name-title">
                                SDT
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.treasurySdtBalance)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(app.sdtPrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.treasurySdtBalance * app.sdtPrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(sdtPerLobi)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(sdtUSDPerLobi)}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="left" className="token-name-title">
                                ANGLE
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.angleTreasuryBalance)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(app.anglePrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.angleTreasuryBalance * app.anglePrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(anglePerLobi)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(angleUSDPerLobi)}`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="left" className="token-name-title">
                                gOHM
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.gOhmTreasuryBalance)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(app.gOhmPrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.gOhmTreasuryBalance * app.gOhmPrice)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(gOhmPerLobi)}`}
                            </TableCell>
                            <TableCell align="center" className="token-name-title">
                                {`${new Intl.NumberFormat("en-US", {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(gOhmUSDPerLobi)}`}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        {" "}
                        <TableRow>
                            <TableCell align="left" className="treasury-balance-view-card-table-title-footer">
                                <p className="treasury-balance-view-card-table-title"></p>
                            </TableCell>
                            <TableCell align="center" className="treasury-balance-view-card-table-title-footer"></TableCell>
                            <TableCell align="center" className="treasury-balance-view-card-table-title-footer"></TableCell>
                            <TableCell align="center" className="treasury-balance-view-card-table-title-footer">
                                {`${new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    maximumFractionDigits: 0,
                                    minimumFractionDigits: 0,
                                }).format(app.treasuryBalance)}`}
                            </TableCell>
                            <TableCell align="center" className="treasury-balance-view-card-table-title-footer"></TableCell>
                            <TableCell align="center" className="treasury-balance-view-card-table-title-footer">
                                {`${new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 0,
                                }).format(totalUSDPerLobi)}`}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Grid>
    );
}

export default TreasuryTable;
