import {useState} from "react";
import axios from "axios";

// This file standardizes the process of sending a request to the server, receiving results and displaying
// formatted errors
export default ({url, method, body, onSuccess}) => {
    const [errors, setErrors] = useState([]);

    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            const response = await axios[method](url, {
                // Merge the body and props objects
                ...body, ...props
            });

            if(onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (err) {
            setErrors(
                <div className="alert alert-danger">
                    <h4>Ooops...</h4>
                    <ul className="my-0">
                        {err.response.data.errors.map(error => <li key={error.message}>{error.message}</li>)}
                    </ul>
                </div>
            );
        }
    };

    return {doRequest, errors};
}
