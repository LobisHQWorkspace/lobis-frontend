import React, { useState } from "react";
import Wrap from "../../../components/Wrap";
import "./wrap-button.scss";

function WrapButton() {
    const [showWrap, setShowWrap] = useState(false);

    const handelOpenWrap = () => {
        setShowWrap(true);
    };

    const handelCloseWrap = () => {
        setShowWrap(false);
    };

    return (
        <div>
            <div className="wrap-button" onClick={handelOpenWrap}>
                <p>Wrap</p>
            </div>
            <Wrap open={showWrap} handleClose={handelCloseWrap} />
        </div>
    );
}

export default WrapButton;
