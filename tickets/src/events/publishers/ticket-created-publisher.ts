import {Publisher, Subjects, TicketCreatedEvent} from "@cambonu/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
