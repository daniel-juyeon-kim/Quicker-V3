export interface IOrderParticipantRepository {
  findSenderReceiverLocationAndPhoneNumberByOrderId(orderId: number): Promise<{
    id: number;
    departure: {
      id: number;
      x: number;
      y: number;
      sender: { phone: string };
    };
    destination: {
      id: number;
      x: number;
      y: number;
      receiver: { phone: string };
    };
  }>;
}
