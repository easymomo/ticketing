import {Queue, Worker} from "bullmq";
import {ExpirationCompletePublisher} from "../events/Publishers/expiration-complete-publisher";
import {natsWrapper} from "../nats-wrapper";

interface Payload {
    orderId: string;
}

// Setting up the Queue
const expirationQueue = new Queue<Payload>("order:expiration", {
    connection: {
        host: process.env.REDIS_HOST
    }
});

// Setting up the Worker to process the jobs
new Worker<Payload>("order:expiration", async (job) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId,
    });
}, {
    connection: {
        host: process.env.REDIS_HOST
    }
});

export {expirationQueue};
