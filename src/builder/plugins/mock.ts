type Action = (mockPromise: Promise<any>) => Promise<any>;
interface CancelableAction extends Action {
    cancel?: (message: string) => void;
    getToken?: () => Function | null;
}

function CancelableMock() {
    let token: Function | null;
    let action: CancelableAction = (mockPromise: Promise<any>) => {
        return Promise.race([
            mockPromise,
            new Promise((resolve, reject) => {
                token = reject;
            }),
        ]).then(
            result => {
                token = null;
                return result;
            },
            error => {
                token = null;
                throw error;
            }
        );
    };
    action.cancel = message => {
        token && token(new Error(message || 'cancel'));
        token = null;
    };
    action.getToken = () => token;
    return action;
}

export { CancelableMock };
