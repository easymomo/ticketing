import request from "supertest"; // Allow us to fake requests to the Express application
import {app} from "../../../app";

it("responds with details about the current user", async () => {
    const cookie = await global.signin();

    const response = await request(app)
        .get("/api/users/current-user")
        .set("Cookie", cookie)
        .send()
        .expect(400);

    expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
    const response = await request(app)
        .get("/api/users/current-user")
        .send()
        .expect(200);

    expect(response.body.currentUser).toEqual(null);
});
