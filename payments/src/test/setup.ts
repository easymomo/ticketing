import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest"; // Allow us to fake requests to the Express application
import {app} from "../app"

declare global {
    var signin: (id?: string) => string[];
}

// We will mock natsWrapper so Jest will use the fake implementation instead of the real one
jest.mock("../nats-wrapper");

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = "secret_code"; // Setup the env variable for the test environment

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    // Reset the data before each test
    // We do not want to have data from a previous test
    // We want to start each test with a clean slate
    jest.clearAllMocks(); // Clear all the mocks

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});


afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

// This function will be available in all the test files, it will allow us to fake a sign in and return a cookie
// Another way would be to create a file with the code below and import it in all the test files
global.signin = (id?: string) => {
    // Build a JWT payload. {id, email}
    const payload = {
        // There is an optional id for the function, if provided, use it as the id, if not, generate a new one
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: "test@test.com"
    }

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session object. { jwt: MY_JWT }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString("base64");

    // Return a string that's the cookie with the encoded data
    return [`session=${base64}`];
}
