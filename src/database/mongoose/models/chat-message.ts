import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class MessageInfo {
  @Prop({ required: true })
  walletAddress: string;
  @Prop({ required: true })
  message: string;
  @Prop({ type: Date, default: () => new Date(), required: true })
  date: Date;
}

@Schema()
export class ChatMessages extends Document {
  @Prop({ required: true })
  id: number;
  @Prop({ type: [MessageInfo], default: [], required: true })
  messages: MessageInfo[];
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessages);
