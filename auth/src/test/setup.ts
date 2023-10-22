import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest"; // Allow us to fake requests to the Express application
import {app} from "../app"

declare global {
    var signin: () => Promise<string[]>;
}

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = "secret_code"; // Setup the env variable for the test environment

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
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
global.signin = async () => {
    const email = "test@test.com";
    const password = "password";

    const response = await request(app)
        .post("/api/users/sign-up")
        .send({
            email,
            password,
        })
        .expect(201);

    return response.get("Set-Cookie"); // Return the cookie
}
