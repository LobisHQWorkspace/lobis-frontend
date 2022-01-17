import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, OutlinedInput, InputAdornment, Slide, FormControl, Grid, Fade, Backdrop } from "@material-ui/core";

import "./airdrop.scss";

import AirdropHeader from "./AirdropHeader";
import AirdropClaim from "./AirdropClaim";

function Airdrop({ merkleIndex }: any) {
    return (
        <Grid className="airdrop-view">
            <Backdrop open={true}>
                <Fade in={true}>
                    <div className="bond-card">
                        <AirdropHeader />
                        <AirdropClaim merkleIndex={merkleIndex} />
                    </div>
                </Fade>
            </Backdrop>
        </Grid>
    );
}

export default Airdrop;
