export const showErrorMessage = (defaultMessage: string, message: string) => {
    if (message) {
        return `${defaultMessage}: ${message}`;
    }
    return defaultMessage;
}