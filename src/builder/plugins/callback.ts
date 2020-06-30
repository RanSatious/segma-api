type TStatus = 'start' | 'success' | 'error';
type TCallBack = (status: TStatus, ...args: any[]) => void;

const callbackPromise = (axios: Promise<any>, callback: TCallBack) => {
    callback('start');
    return axios.then(
        result => {
            callback('success', result);
            return result;
        },
        error => {
            callback('error', error);
            throw error;
        }
    );
};

export default callbackPromise;
