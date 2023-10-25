import axios from "axios";

export default({req}) => {
    if(typeof window === "undefined") {
        // We are on the server

        // Create a predefined version of axios
        return axios.create({
            // baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local", // used for local development
            baseURL: process.env.NODE_ENV !== "production" ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local" : "http://viepe.net",
            headers: req.headers
            // We get the headers from the incoming request and pass them to the one we are creating.
            // We do that because we want to get the cookie from the incoming request and attach it to the request
            // we are making.
            // The incoming request has (Host: "ticketing.dev") that is needed, that info needs to be
            // transmitted to ingress nginx because the url http://ingress-... will not be able to resolve
            // to a domain name.
        });
    } else {
        // We are on the browser

        return axios.create({
            baseURL: "/"
        });
    }
};
