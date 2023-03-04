import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Bakery } from 'src/bakeries/bakery.schema';
import { Review } from 'src/bakeries/reviews.schema';
import { Like } from 'src/likes/like.schema';
import { Transform } from 'class-transformer';

export type UserDocument = HydratedDocument<User>;

export enum Platform {
    GOOGLE = 'google',
    KAKAO = 'kakao',
    NAVER = 'naver',
}

@Schema()
export class User {
    @Transform(({ value }) => value.toString())
    _id: string;

    @Prop()
    platform: Platform;

    @Prop()
    email: string;
  
    @Prop()
    name: string;
  
    @Prop()
    thumbnail: string;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop()
    deletedAt?: Date;

    @Prop()
    reviewCount?: number

    @Prop()
    visitied?: Bakery[]

    @Prop({ default: 0 })
    temperature: number;

    @Prop()
    refreshToken?: string;
  
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }] })
    likes: Like[];
}

export const UserSchema = SchemaFactory.createForClass(User);