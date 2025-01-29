import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Location {
  @Prop({ required: true })
  x: number;
  @Prop({ required: true })
  y: number;
}

@Schema()
export class CurrentDeliveryLocation {
  @Prop({ required: true })
  _id: number;
  @Prop({ required: true })
  location: Location;
}

export const CurrentDeliveryLocationSchema = SchemaFactory.createForClass(
  CurrentDeliveryLocation,
);
