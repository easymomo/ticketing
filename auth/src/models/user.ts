import mongoose from "mongoose";
import {PasswordManager} from '../services/password-manager';

// An interface that describes the properties that are required to create a new user
interface UserAttributes {
    email: string;
    password: string;
}

// An interface that describes the properties that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
    // this function's purpose is to help TypeScript validate the properties we pass to the build function
    build(attrs: UserAttributes): UserDoc;
}

// An interface that describes the properties that a User Document has
// The purpose of the user doc is to have the possibility of adding some additional properties
// because once the document is created, some additional properties like createdAt can be added
// by Mongoose making the individual document's properties different from the properties used to
// create the document
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: { // Turn the json result produced by mongoDb after creating a new user to a new format
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

// Function keyword used instead of an arrow function.
// Whenever we put together a middleware function, we get access to the document that is being saved
// (The actual user we are trying to persist to the database) as this inside of the function.
userSchema.pre("save", async function (done) {
    if (this.isModified("password")) {
        const hashed = await PasswordManager.toHash(this.get("password"));
        this.set("password", hashed);
    }

    done();
});

// Allow TypeScript to do some validation or type checking on the properties we try to use to create a new record
userSchema.statics.build = (attrs: UserAttributes) => {
    return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export {User};
