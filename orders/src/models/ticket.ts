import mongoose from "mongoose";
import {helperFnUnderscoreId} from "@cambonu/common";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";
import {Order, OrderStatus} from "./order";

interface TicketAttributes {
    id: string;
    title: string;
    price: number;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;

    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attributes: TicketAttributes): TicketDoc;

    // We want to add a method to the model, that method will take an object as parameter {id: string, version: number}
    // and return a promise that resolves into a TicketDoc or null
    // to implement the function, we will then have to add the new function to the statics object
    // ticketSchema.methods.findByEvent like we did for the build method
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// change the versionKey from __v to version
ticketSchema.set("versionKey", "version");
// Enable the plugin
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event: {id: string, version: number}) => {
    // We look for the ticket with the same id and the version -1, so we are sure to maintain the sequence.
    // Only the ticket with the following version can be used to update an existing ticket
    return Ticket.findOne({
        _id: event.id,
        version: event.version -1,
    });
};

ticketSchema.statics.build = (attributes: TicketAttributes) => {
    // In the build method, we will reassign the properties because we want the id to be used as _id when creating
    // a new record, so we keep the consistency of the primary key coming from the ticket service.
    const mongoAttributes = helperFnUnderscoreId(attributes);
    return new Ticket(mongoAttributes);
};

// To add a method to the model, you add it to its schema
// IMPORTANT, use a function keyword instead of an arrow function
ticketSchema.methods.isReserved = async function () {
    // with Mongoose, we need to use the function keyword so this === the ticket document that we just called
    // "isReserved" on

    // Make sure that this ticket is not already reserved
    // Run query to all orders. Find an order where the ticket is the ticket we just found and the orders status
    // is not cancelled.
    // If we find an order from that, it means the ticket is reserved
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete,
            ]
        }
    });

    return !!existingOrder; // return true if existingOrder is defined, false otherwise
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export {Ticket};
