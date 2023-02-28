import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Review, ReviewSchema } from 'src/bakeries/reviews.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Review.name, schema: ReviewSchema}
        ])
    ],
    controllers: [UsersController,],
    providers: [UsersService,],
    exports: [UsersService]
})
export class UsersModule { }
