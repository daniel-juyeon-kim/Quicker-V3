export interface ICompleteDeliveryImageRepository {
  create({
    orderId,
    bufferImage,
  }: {
    orderId: number;
    bufferImage: Buffer;
  }): Promise<void>;

  findCompleteImageBufferByOrderId(orderId: number): Promise<Buffer>;
}
