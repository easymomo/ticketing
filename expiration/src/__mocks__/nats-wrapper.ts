export const natsWrapper = {
    // We create an object that has a function publish, define the function to emulate how the original behaves
    client: {
        publish: jest
            .fn()
            .mockImplementation(
            (subject: string, data: string, callback: () => void) => {
                callback();
            }
        )
    }
};
