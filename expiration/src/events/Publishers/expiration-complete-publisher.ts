import {ExpirationCompleteEvent, Publisher, Subjects} from "@cambonu/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
