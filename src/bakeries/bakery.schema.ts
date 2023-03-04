import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Like } from 'src/likes/like.schema';
import { LocationDto } from './dto/location.dto';
import {  Food } from './food.schema';
import { Transform } from 'class-transformer';
export type BakeryDocument = HydratedDocument<Bakery>;
@Schema()
export class Bakery {
    @Transform(({ value }) => value.toString())
    _id?: string;

    @Prop()
    address: string;
    
    @Prop({ default: Date.now })
    createdAt: Date;
    
    @Prop()
    deletedAt: Date;
    
    @Prop()
    description: string;
    
    @Prop({ default: 0 })
    like: number;

    @Prop()
    location: LocationDto;    
    
    @Prop()
    menu: Food[];
    
    @Prop()
    name: string;
    
    @Prop()
    phone: string;
    
    @Prop()
    photos: string[];
    
    @Prop({ default: 0 })
    rating: number;
    
    @Prop({ default: 0 })
    reviewCount: number;
    
    @Prop({ type: [String], index: true }) // tags 필드에 대한 색인 생성
    tags: string[];

    @Prop()
    thumbnail: string;
    
    @Prop({ default: 0 })
    views: number;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }] })
    likes: Like[];
    
    @Prop({ default: false })
    isLiked: boolean;
}

const BakerySchema = SchemaFactory.createForClass(Bakery);

BakerySchema.index({ name: 'text', address: 'text' });

export { BakerySchema };