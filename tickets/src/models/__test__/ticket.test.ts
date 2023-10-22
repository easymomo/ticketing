import {Ticket} from "../ticket";

it("implements optimistic concurrency control", async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: "Concert",
        price: 5,
        userId: "123"
    });

    // Save the ticket to the database
    await ticket.save();

    // Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // Make two separate changes to the tickets we fetched
    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});

    // Save the first fetched ticket
    await firstInstance!.save();

    /*
    // Save the second fetched ticket and expect an error
    expect(async () => {
        await secondInstance!.save();
    }).toThrow();
    */

    // alternative version, we use a try catch, because we expect this to fail, we expect the try catch to fail
    // and go into the catch where it will stop and our test will prove the second save failed as expected
    try {
        await secondInstance!.save();
    } catch (err) {
        return;
    }

    // if we reach this point, it means the second save succeeded and our test failed
    throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
    const ticket = Ticket.build({
        title: "Concert",
        price: 20,
        userId: "123"
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
});
