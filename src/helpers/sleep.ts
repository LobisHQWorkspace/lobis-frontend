export const sleep = (second: number) => {
    return new Promise(resolve => setTimeout(() => resolve(null), 2 * 1000));
};
