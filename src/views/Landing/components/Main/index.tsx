import { Link } from "@material-ui/core";
import "./main.scss";

function Main() {
    return (
        <div className="landing-main">
            <div className="landing-main-title-wrap">
                <p>Lobis</p>
            </div>
            <div className="landing-main-help-text-wrap">
                <p>DeFi's guardian of governance</p>
            </div>
            <div className="landing-main-btns-wrap">
                <Link href="https://app.lobis.finance" target="_blank" rel="noreferrer">
                    <div className="landing-main-btn">
                        <p>Enter App</p>
                    </div>
                </Link>
                <Link href="https://lobis.gitbook.io" target="_blank" rel="noreferrer">
                    <div className="landing-main-btn">
                        <p>Documentation</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default Main;
