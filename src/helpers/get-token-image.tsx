import lobiImg from "../assets/tokens/LOBI.svg";
import sLOBIImg from "../assets/tokens/SLOBI.svg";

function toUrl(tokenPath: string): string {
    const host = window.location.origin;
    return `${host}/${tokenPath}`;
}

export function getTokenUrl(name: string) {
    if (name === "lobi") {
        return toUrl(lobiImg);
    }

    if (name === "slobi") {
        return toUrl(sLOBIImg);
    }

    throw Error(`Token url doesn't support: ${name}`);
}
