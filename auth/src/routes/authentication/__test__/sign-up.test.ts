import request from "supertest"; // Allow us to fake requests to the Express application
import {app} from "../../../app";

it("returns a 201 on successful signup", async () => {
    return request(app)
        .post("/api/users/sign-up")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(201);
});

it("returns a 400 with an invalid email", async () => {
    return request(app)
        .post("/api/users/sign-up")
        .send({
            email: "sdfqsdfqsdfq",
            password: "password",
        })
        .expect(400);
});

it("returns a 400 with an invalid password", async () => {
    return request(app)
        .post("/api/users/sign-up")
        .send({
            email: "sdfqsdfqsdfq",
            password: "p",
        })
        .expect(400);
});


it("returns a 400 with missing email and password", async () => {
    await request(app)
        .post("/api/users/sign-up")
        .send({
            email: "test@test.com"
        })
        .expect(400);

    await request(app)
        .post("/api/users/sign-up")
        .send({
            password: "mot-de-passe"
        })
        .expect(400);
});

it("disallows duplicate emails", async () => {
    await request(app)
        .post("/api/users/sign-up")
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201);

    await request(app)
        .post("/api/users/sign-up")
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(400);
});



it("sets a cookie after a successful signup", async () => {
    // Save the response of the signup request
    const response = await request(app)
        .post("/api/users/sign-up")
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201);

    // inspect the response for a cookie, look for the Set-Cookie header
    expect(response.get("Set-Cookie")).toBeDefined();
});

