import mongoose from "mongoose";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

interface TicketAttributes {
    title: string;
    price: number;
    userId: string;
}

// The purpose of the ticket doc is to have the possibility of adding some additional properties
// because once the document is created, some additional properties like createdAt can be added
// by Mongoose making the individual document's properties different from the properties used to
// create the document
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    // this function's purpose is to help TypeScript validate the properties we pass to the build function
    build(attrs: TicketAttributes): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
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

ticketSchema.statics.build = (attrs: TicketAttributes) => {
    return new Ticket(attrs);
}

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export {Ticket};
