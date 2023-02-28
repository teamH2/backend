import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/user.schema';
import { IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
export type ReviewDocument = HydratedDocument<Review>;


@Schema()
export class Review {

    @Transform(({ value }) => value.toString())
    _id?: string;

    @ApiProperty({
        example: '5f9f3c9c0b5c1c2c0c0c0c0c',
        description: 'userId',
        required: true,
    })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: string;
  
    @ApiProperty({
        example: '5f9f3c9c0b5c1c2c0c0c0c0c',
        description: 'bakeryId',
        required: true,
    })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Bakery' })
    bakeryId: string;

    @ApiProperty({
        example: '5f9f3c9c0b5c1c2c0c0c0c0c',
        description: 'bakeryId',
        required: true,
    })
    photos: string[];

    @ApiProperty({
        example: '5',
        description: '평점',
        required: true,
    })
    @Prop()
    rating: number;
    
    @ApiProperty({
        example: '맛있어요',
        description: '리뷰 내용',
        required: true,
    })
    @Prop()
    content: string;
    

    @Prop({ default: Date.now() })
    updatedAt: Date;  
}


export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.pre('updateOne', function(next) {
    this.update({}, { $set: { updatedAt: new Date() } });
    next();
  });