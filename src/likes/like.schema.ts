import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/user.schema';
import { IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
export type LikeDocument = HydratedDocument<Like>;


@Schema()
export class Like{
    
    @Transform(({ value }) => value.toString())
    _id?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: string;
  
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Bakery' })
    bakery: string;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: false })
    isLiked: boolean;
}


export const LikeSchema = SchemaFactory.createForClass(Like);
