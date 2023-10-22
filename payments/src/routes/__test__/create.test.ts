import request from "supertest";
import mongoose from "mongoose";
import {app} from "../../app";
import {Order} from "../../models/order";
import {OrderStatus} from "@cambonu/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";

jest.mock("../../stripe");

it("returns a 404 when purchasing an order that does not exist", async () => {
    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: "random",
            orderId: new mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it("returns a 401 when purchasing an order that does not belong to the user", async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: "random",
            orderId: order.id,
        })
        .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app).post("/api/payments")
        .set("Cookie", global.signin(userId))
        .send({
            token: "random",
            orderId: order.id,
        })
        .expect(400);
});

it("returns a 201 with valid inputs and create a payment", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Created,
    });
    await order.save();

    const stripeCharge = await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin(userId))
        .send({
            token: "tok_visa",
            orderId: order.id,
        })
        .expect(201);

    // from the mock function, get the first call, and get the first argument, the first argument is the options
    // object, and get the source property.
    // This code uses the mock function to get the options object that was passed to the create function, and
    // then checks that the source property is equal to the token that was passed to the request.
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual("tok_visa");
    expect(chargeOptions.amount).toEqual(20*100);
    expect(chargeOptions.currency).toEqual("usd");

    const payments = await Payment.find({});
    expect(payments.length).toEqual(1);

    /*
    // This is for the code when we were using stripe directly
    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge.body.id,
    });

    expect(payment).not.toBeNull();
    */
});
