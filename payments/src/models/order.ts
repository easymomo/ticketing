import mongoose from "mongoose";
import {OrderStatus} from "@cambonu/common";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

export {OrderStatus};

interface OrderAttributes {
    id: string;
    price: number;
    userId: string;
    status: OrderStatus;
    version: number;
}

interface OrderDoc extends mongoose.Document {
    price: number;
    userId: string;
    status: OrderStatus;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attributes: OrderAttributes): OrderDoc;

    // We want to add a method to the model, that method will take an object as parameter {id: string, version: number}
    // and return a promise that resolves into an OrderDoc or null
    // to implement the function, we will then have to add the new function to the statics object
    // ticketSchema.methods.findByEvent like we did for the build method
    findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        // Enforce the value that can be selected at mongoose level, only the values from the enum OrderStatus
        // can be selected
        enum: Object.values(OrderStatus),
        // Set the default value
        default: OrderStatus.Created,
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

orderSchema.statics.findByEvent = (event: {id: string, version: number}) => {
    // We look for the order with the same id and the version -1, so we are sure to maintain the sequence.
    // Only the order with the following version can be used to update an existing order
    return Order.findOne({
        _id: event.id,
        version: event.version -1,
    });
};

orderSchema.statics.build = (attributes: OrderAttributes) => {
    return new Order({
        _id: attributes.id,
        version: attributes.version,
        price: attributes.price,
        userId: attributes.userId,
        status: attributes.status,
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>("order", orderSchema);

export {Order};
