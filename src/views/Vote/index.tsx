import { Grid, Zoom } from "@material-ui/core";
import "./vote.scss";

function Vote() {
    return (
        <div className="dashboard-view">
            <div className="dashboard-infos-wrap">
                <Zoom in={true}>
                    <Grid container spacing={4}>
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">Lobis</p>
                                <a className="button" target="_blank" href="https://snapshot.org/#/lobis.eth">
                                    Go on snapshot
                                </a>
                            </div>
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <div className="dashboard-card">
                                <p className="card-title">Frax</p>
                                <a className="button" target="_blank" href="https://snapshot.org/#/frax-lobis.eth">
                                    Go on snapshot
                                </a>
                            </div>
                        </Grid>
                    </Grid>
                </Zoom>
            </div>
        </div>
    );
}

export default Vote;
