import {useState} from 'react';
import useRequest from '../../hooks/use-request';
import Router from "next/router";

const CreateTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const {doRequest, errors} = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title,
            price
        },
        onSuccess: () => Router.push('/')
    });

    const onsubmit = (event) => {
        event.preventDefault();

        doRequest();
    }

    const onBlur = () => {
        const value = parseFloat(price);

        if (isNaN(value)) {
            return;
        }

        setPrice(value.toFixed(2));
    };

    return <div>
        <h1>Create a Ticket</h1>
        <form onSubmit={onsubmit}>
            <div className="form-group">
                <label>Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Price</label>
                <input
                    value={price}
                    onBlur={onBlur}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-control"
                />
            </div>
            {errors}
            <button className="btn btn-primary">Submit</button>
        </form>
    </div>
};

export default CreateTicket;
