export const showErrorMessage = (defaultMessage: string, message: string) => {
    if (message) {
        throw new Error(`${defaultMessage}: ${message}`);
    }
    throw new Error(`${defaultMessage}`);
}