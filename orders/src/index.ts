import mongoose from "mongoose";

import {app} from "./app";
import {natsWrapper} from "./nats-wrapper";

import {TicketCreatedListener} from "./events/listeners/ticket-created-listener";
import {TicketUpdatedListener} from "./events/listeners/ticket-updated-listener";

import {ExpirationCompleteListener} from "./events/listeners/expiration-complete-listener";

import {PaymentCreatedListener} from "./events/listeners/payment-created-listener";

const start = async () => {
    if(!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be defined");
    }
    if(!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }
    if(!process.env.NATS_CLIENT_ID) {
        throw new Error("NATS_CLIENT_ID must be defined");
    }
    if(!process.env.NATS_URL) {
        throw new Error("NATS_URL must be defined");
    }
    if(!process.env.NATS_CLUSTER_ID) {
        throw new Error("NATS_CLUSTER_ID must be defined");
    }

    try {
        await natsWrapper.connect(
            // same value used in the nats deployments file
            // in the parameters, we defined -cid ticketing => -cid means cluster id
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            // The url of the service that is governing access to our nats deployment
            process.env.NATS_URL
        );

        // When we shut down a listener, tell the publisher we are now offline, do not wait for us to come back
        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed!");
            process.exit(); // We will restart the pod if we lose our connection to NATS
        });

        // Whenever we close the listener, close the connection
        process.on("SIGINT", () => natsWrapper.client.close()); // Interrupt signal (closing a terminal)
        process.on("SIGTERM", () => natsWrapper.client.close()); // Terminate signal (exiting the process)

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();

        new ExpirationCompleteListener(natsWrapper.client).listen();

        new PaymentCreatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.log({err});
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Orders database");
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000 !!!");
    });
};

start();
