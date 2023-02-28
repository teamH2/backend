import { BakeriesService } from './bakeries.service';

import { Module } from '@nestjs/common';
import { BakeriesController } from './bakeries.controller';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/user.schema';
import { Review, ReviewSchema } from './reviews.schema';
import { Food, FoodSchema } from './food.schema';
import { Bakery, BakerySchema } from './bakery.schema';

@Module({
    imports: [UsersModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Bakery.name, schema: BakerySchema},
            { name: Food.name, schema: FoodSchema},
            { name: Review.name, schema: ReviewSchema}
        ])],
    controllers: [BakeriesController],
    providers: [BakeriesService,],
})
export class BakeriesModule { }
