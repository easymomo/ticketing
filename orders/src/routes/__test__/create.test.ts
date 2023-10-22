import mongoose from "mongoose";
import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {Order, OrderStatus} from "../../models/order";
import {natsWrapper} from "../../nats-wrapper";

it("returns an error if the ticket does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({ticketId, price: 20})
        .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        id: ticketId,
        title: "Concert",
        price: 20,
    });

    await ticket.save();

    const order = Order.build({
        ticket,
        userId: "123",
        status: OrderStatus.Created,
        expiresAt: new Date(),
    });
    await order.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({
            ticketId: ticket.id,
        })
        .expect(400);
});

it("reserves a ticket when the parameters are correct", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        id: ticketId,
        title: "Concert",
        price: 20,
    });
    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({
            ticketId: ticket.id,
            price: ticket.price,
        })
        .expect(201);
});

it("emits an order created event", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        id: ticketId,
        title: "Concert",
        price: 20,
    });
    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({
            ticketId: ticket.id,
            price: ticket.price,
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
