import mongoose from "mongoose";

export const stripe = {
    charges: {
        // mockResolvedValue({}) makes sure whenever we call the create function, that we are going to get
        // back a promise that is going to automatically resolve itself with an object that has an id property
        create: jest.fn().mockResolvedValue({
            id: new mongoose.Types.ObjectId().toHexString(),
        })
    }
}
