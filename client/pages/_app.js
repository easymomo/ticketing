import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

const AppComponent =  ({Component, pageProps, currentUser}) => {
    return (
        <div className="container py-5">
            <Header currentUser={currentUser} />
            <Component currentUser={currentUser} {...pageProps} />
        </div>
    );
};

// When getInitialProps is called, the first argument of the function is an object that has a couple of properties,
// one of those properties is a request object, the same kind we expect to receive from an Express application
AppComponent.getInitialProps = async (appContext) => {
    // Fetch the initial data for the AppComponent
    const client = buildClient(appContext.ctx);
    const {data} = await client.get("/api/users/current-user");

    // if the component(s) we are loading in the page have a getInitialProps, load it
    let pageProps = {};
    if(appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
    }

    return {
        pageProps,
        currentUser: data.currentUser // Alternatively we could use ...data
    };
};

export default AppComponent;
