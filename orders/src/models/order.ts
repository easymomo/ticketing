import mongoose from "mongoose";
import {OrderStatus} from "@cambonu/common";
import {TicketDoc} from "./ticket";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

export {OrderStatus};

// Properties required to create an order
interface OrderAttributes {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

// Properties for created orders
interface OrderDoc extends mongoose.Document {
    userId: string;
    version: number;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attributes: OrderAttributes): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        // Enforce the value that can be selected at mongoose level, only the values from the enum OrderStatus
        // can be selected
        enum: Object.values(OrderStatus),
        // Set the default value
        default: OrderStatus.Created,
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
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
orderSchema.set("versionKey", "version");
// Enable the plugin
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attributes: OrderAttributes) => {
    return new Order(attributes);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export {Order};
