import {useEffect} from "react";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

export default () => {
    const {doRequest} = useRequest({
        url: "/api/users/sign-out",
        method: "post",
        body: {},
        onSuccess: () => Router.push("/")
    });

    useEffect(() => {
        doRequest();
    }, []);

    return <div>You have been signed out...</div>;
}
