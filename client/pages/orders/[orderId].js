import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: "/api/payments",
        method: "post",
        body: {
            orderId: order.id
        },
        onSuccess: (payment) => Router.push("/orders")
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        }

        findTimeLeft();
        // This is the interval id, we need to store it in a variable, so we can clear it later
        const timerId = setInterval(findTimeLeft, 1000);

        // This is the cleanup function
        // It will be called when the component is about to be re-rendered or removed from the DOM
        // Whenever we return a function from useEffect, React will automatically call it if the component is about
        // to be re-rendered or removed from the DOM
        return () => {
            clearInterval(timerId);
        }
    }, []);

    if (timeLeft < 0) {
        return <div>Order Expired</div>
    }

    return <div>
        {timeLeft} seconds until order expires
        <br/>
        <br/>
        <StripeCheckout
            stripeKey={"pk_test_a4Vtqj4tzJZMgPRORyTIShGt"}
            token={({id}) => doRequest({token: id})}
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
        <br/>
        {errors}
        <br/>
    </div>
}

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data };
}

export default OrderShow;
