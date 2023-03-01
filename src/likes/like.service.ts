import { HttpException, Injectable } from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { logger } from 'src/main';
import { Bakery, BakeryDocument } from '../bakeries/bakery.schema';
import { Review, ReviewDocument } from '../bakeries/reviews.schema';
import { User, UserDocument } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { Like, LikeDocument } from './like.schema';


@Injectable()
export class LikeService { 
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Bakery.name) private bakeryModel: Model<BakeryDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
        private readonly usersService: UsersService,
    ) {}


    async create(userId: string, bakeryId: string): Promise<Like> {

        const existingLike = await this.likeModel.findOne({ user:userId, bakery:bakeryId });
        if (existingLike) {
            throw new HttpException('User has already liked this bakery', 400);
        }

        const like = new this.likeModel({
            user:userId,
            bakery:bakeryId,
        });
        await like.save()
        await this.bakeryModel.findByIdAndUpdate(bakeryId, { $inc: { like: 1 }, $push: { likes: like._id } });
        await this.userModel.findByIdAndUpdate(userId, { $push: { likes: like._id } });
        return await like.save();
    }

    async findByUser(userId: string): Promise<Like[]> {
        try{
            return await this.likeModel
            .find({ user: userId })
            .populate('user','name thumbnail')
            .populate('bakery','name thumbnail')
            .exec();
        }catch(error){
            logger.error(error);
            throw new HttpException('서버에러',500);
        }
    }

    async findByBakery(bakeryId: string): Promise<Like[]> {
        try{
            return await this.likeModel
            .find({ bakery: bakeryId })
            .populate('user','name thumbnail')
            .populate('bakery','name thumbnail')
            .exec();
        }catch(error){
            logger.error(error);
            throw new HttpException('서버에러',500);
        }
    }

    
    async delete(userId: string, bakeryId: string): Promise<Like> {
        try{
            const existingLike = await this.likeModel.findOne({ user: userId, bakery: bakeryId });
            if (!existingLike) {
                throw new HttpException('User has not liked this bakery', 400);
            }
            if(existingLike.user.toString() !== userId){
                throw new HttpException('User has not liked this bakery', 400);
            }
            if(existingLike.bakery.toString() !== bakeryId){
                throw new HttpException('User has not liked this bakery', 400);
            }
            const bakeryUpdate = await this.bakeryModel.findByIdAndUpdate(
                bakeryId, { $inc: { like: -1 } },
                { $pull: {likes:existingLike._id} })
                .exec();
            if(bakeryUpdate.like<0){
                await this.bakeryModel.findByIdAndUpdate(bakeryId, { like: 0 }).exec();
            }
            await this.userModel.findByIdAndUpdate(userId, { $pull: { likes: existingLike._id } }).exec();
            return await this.likeModel.findOneAndDelete({ user: userId, bakery: bakeryId }).exec();
        }catch(error){
            logger.error(error);
            if(error instanceof HttpException){
                throw new HttpException('User has not liked this bakery', 400);
            }
            throw new HttpException('서버에러',500);
        }
    }

}
