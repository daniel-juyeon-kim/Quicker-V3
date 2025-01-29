import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Message {
  @Prop({ required: true })
  walletAddress: string;
  @Prop({ required: true })
  message: string;
  @Prop({ type: Date, default: () => new Date(), required: true })
  date: Date;
}

@Schema()
export class ChatMessage extends Document {
  @Prop({ required: true })
  roomId: number;
  @Prop({ type: [Message], default: [], required: true })
  messages: Message[];
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
