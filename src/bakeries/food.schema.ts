import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type FoodDocument = HydratedDocument<Food>;
@Schema()
export class Food {
    name: string;
    description: string;
    price: string;
    thumbnail: string;
}

export const FoodSchema = SchemaFactory.createForClass(Food);