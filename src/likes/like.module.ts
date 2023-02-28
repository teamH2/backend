import { LikeService } from './like.service';
import { LikeController } from './like.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

import { Bakery, BakerySchema } from '../bakeries/bakery.schema';
import { Food, FoodSchema } from '../bakeries/food.schema';
import { Review, ReviewSchema } from '../bakeries/reviews.schema';
import { User, UserSchema } from 'src/users/user.schema';
import { Like, LikeSchema } from './like.schema';

@Module({
    imports: [UsersModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Bakery.name, schema: BakerySchema},
            { name: Food.name, schema: FoodSchema},
            { name: Review.name, schema: ReviewSchema},
            { name: Like.name, schema: LikeSchema}
        ])],
    controllers: [LikeController,],
    providers: [LikeService,],
})
export class LikeModule { }
