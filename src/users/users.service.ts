import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundError } from 'rxjs';
import { Review, ReviewDocument } from 'src/bakeries/reviews.schema';
import { Platform, User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    ) {}

    async findAllUsers(): Promise<User[]> {
        return this.userModel.find().exec();
    }
    
    async findUserById(userId: string): Promise<User> {
         const user = await this.userModel.findById(userId).exec();
        if(!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }
        return user;
    }

    async updateUserById(userId: string, user: User): Promise<User> {
        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            user,
            { new: true },
        );
        if(!updatedUser) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }
        return updatedUser;
    }

    async deleteUserById(userId: string): Promise<User> {
        const deletedUser = await this.userModel.findByIdAndDelete(userId);
        if(!deletedUser) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }
        return deletedUser;
    }




}