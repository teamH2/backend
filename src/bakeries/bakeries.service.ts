import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { throws } from 'assert';
import { Model } from 'mongoose';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { logger } from 'src/main';
import { User, UserDocument } from 'src/users/user.schema';
import { UsersService } from 'src/users/users.service';
import { Bakery, BakeryDocument } from './bakery.schema';
import { CreateBakeryDto } from './dto/createBakery.dto';
import { LocationDto } from './dto/location.dto';
import { SearchDto } from './dto/search.dto';
import { Review, ReviewDocument } from './reviews.schema';

@Injectable()
export class BakeriesService { 
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Bakery.name) private bakeryModel: Model<BakeryDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        private readonly usersService: UsersService,
    ) {}


     /* Review CRUD */
    
    async findReviewsByBakeryId(bakeryId: string): Promise<Review[]> {
        try{
            return this.reviewModel
            .find({  bakeryId })
            .populate('userId', 'name thumbnail temperature')
            .populate('bakeryId', 'name address, tags')
            .exec();
        }catch(error){
            logger.error(error);
            throw new HttpException("서버에러", 500);
        }
    }

    async findReviewsByUserId(userId: string): Promise<Review[]> {
        try{
            return this.reviewModel
            .find({ userId })
            .populate('userId', 'name thumbnail temperature')
            .populate('bakeryId', 'name address, tags')
            .exec();
        
        }catch(error){
            logger.error(error);
            throw new HttpException("서버에러", 500);
        }
    }

    async findReviewByReviewId(reviewId: string): Promise<any> {
        try{
            return this.reviewModel
            .findOne({ _id: reviewId })
            .populate('userId', 'name thumbnail temperature')
            .populate('bakeryId', 'name address, tags')
            .exec();
        }catch(error){
            logger.error(error);
            throw new HttpException("서버에러", 500);
        }
    }

    async createReview(review: Review): Promise<Review> {
        const reviewModel = new this.reviewModel(review);
        const result = await reviewModel.save();
        await this.updateBakeryRatingAndReviewCount(result.bakeryId);
        await this.userModel.findByIdAndUpdate(review.userId, {
            $inc: { temperature: 1, reviewCount: 1 },             
        });
        return result;
    }

    async updateReview(reviewId: string, review: Review): Promise<Review> {
        const updatedReview = await this.reviewModel.findByIdAndUpdate(
            reviewId,
            review,
            { new: true },
        );
        await this.updateBakeryRatingAndReviewCount(updatedReview.bakeryId);
        return updatedReview;
    }

    async deleteReview(reviewId: string): Promise<Review> {
        try{
            const deleteReview = await this.reviewModel.findByIdAndDelete(reviewId);
            if(!deleteReview) throw new NotFoundException('리뷰가 존재하지 않습니다.')
            const user = await this.usersService.findUserById(deleteReview.userId); 
            await this.deleteBakeryRatingAndTemperatureDecrease(user)
            await this.updateBakeryRatingAndReviewCount(deleteReview.bakeryId.toString());
            return deleteReview;
        }catch(error){
            logger.error(error);
            if(error.status===404) throw new NotFoundException('리뷰가 존재하지 않습니다.');
            if(error.kind === 'ObjectId') throw new BadRequestException('잘못된 ObjectId 형식입니다.')
            throw new HttpException('서버에러', 500);
        }
    }
    
    private async updateBakeryRatingAndReviewCount(bakeryId:string): Promise<void> {
        const reviews = await this.reviewModel
        .find({ bakeryId })
        .select('rating ');
        if(reviews.length === 0) return;
        const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = totalRating / reviews.length;
        await this.bakeryModel.findByIdAndUpdate(bakeryId, {
            rating: averageRating.toFixed(1) ,
            reviewCount: reviews.length,
        });
    }
    private async deleteBakeryRatingAndTemperatureDecrease(user:User): Promise<void> {
        if (user.temperature > 0) {
            return await this.userModel.findByIdAndUpdate(user._id, {
                reviewCount: user.reviewCount - 1,
                temperature: user.temperature - 1,
            });
        } else {
            return await this.userModel.findByIdAndUpdate(user._id, {
                temperature: 0,
            });
        }
    }

    async isUserReviewedBakery(userId: string, bakeryId: string): Promise<boolean> {
        const result = await this.reviewModel.find({ userId, bakeryId }).exec();
        if(result.length === 0 ) return false;
        return true;
    }

    /* Bakery CRUD */

    
    async findBakeryAll(): Promise<Bakery[]> {
        return await this.bakeryModel.find().exec();
    }

    async findByDistrict(district: string, userId?: string): Promise<Bakery[]> {
        console.log(userId)
        const bakeries = await this.bakeryModel.find
        ({ address: { $regex: district } })
        .populate('likes')
        .exec();
        if(!userId){
            return bakeries;
        }
        console.log(bakeries)
        return bakeries.map(bakery => {
            const like = bakery.likes.find(like => {
                return like.user.toString() === userId
            });
            console.log(like,"ss")
            return {
                ...bakery.toObject(),
                isLiked: like ? true : false,
            };
        });
    }

    async findBakeryById(id: string): Promise<any> {
        if(!id) return this.bakeryModel.find().exec();
        const bakery = await this.bakeryModel.findById(id).exec();
        if(!bakery) {
            throw new NotFoundException(`Bakery with id ${id} not found`);
        }
        return bakery;

    }

    async findBakerysByName(name: string): Promise<Bakery[]> {
        const bakery = await this.bakeryModel.find({ name: name }).exec();
        if(!bakery) {
            throw new NotFoundException(`Bakery with name ${name} not found`);
        }
        return bakery;
    }


    async findBakeryByTagsWithRating(searchdto :SearchDto, userId?:string): Promise<Bakery[]> {
        return await this.searchBakeriesByKeyword(searchdto, userId,'rating')
    }

    async findBakeryByTagsWithReviewCount(searchdto :SearchDto, userId?:string): Promise<Bakery[]> {
        return await this.searchBakeriesByKeyword(searchdto, userId,'reviewCount')
    }

    async findBakeryByTagsWithName(searchdto :SearchDto, userId?:string): Promise<Bakery[]> {
        return await this.searchBakeriesByKeyword(searchdto, userId,'name');
    }

    async createBakery(bakeryInfo:CreateBakeryDto): Promise<Bakery> {
        try{
            const bakery = new this.bakeryModel(bakeryInfo);
            return await bakery.save();
        }catch(error){
            logger.error(error);
            throw new HttpException("서버에러", 500);
        }
    }   
    async getNearestBakeries(location: LocationDto): Promise<Bakery[]> {
        const MAX_RESULTS = 15;
        const bakeries = await this.bakeryModel
        .find()
        .limit(MAX_RESULTS)
        .lean()
        .exec();
    
        // 각 베이커리와의 거리를 계산하여 오름차순으로 정렬합니다.
        bakeries.sort((a, b) => {
            const aDistance = this.getDistanceFromLatLonInKm(
                +location.x,
                +location.y,
                +a.location.x,
                +a.location.y,
            );
            const bDistance = this.getDistanceFromLatLonInKm(
                +location.x,
                +location.y,
                +b.location.x,
                +b.location.y,
            );
            return aDistance - bDistance;
        });
    
        // 가장 가까운 베이커리 15개를 반환합니다.
        return bakeries.slice(0, MAX_RESULTS);
    }
    
    private async searchBakeriesByKeyword(searchdto: SearchDto,userId:string,sorting:string): Promise<Bakery[]> {
        if(!searchdto.tags){
            searchdto.tags = "";
        }
        const skipCount = (searchdto.page - 1) * searchdto.limit;
        const sort = searchdto.order==='desc'? -1 : 1;
        const tagList = searchdto.tags.split(',');
        const regex = new RegExp(searchdto.search, 'i');

        let findCondition = {} as any;
        if(searchdto.search){
            findCondition.$or =  [{ name: regex }, { address: regex },]
        }
        if(tagList[0]!==""){
            findCondition.$and =  [{ tags: { $all: tagList } }] ;
        }

        const bakeries = await this.bakeryModel          
        .find(findCondition)
        .sort({ [sorting] : sort})
        .populate('likes')
        .skip(skipCount)
        .limit(searchdto.limit).exec();
        if(!userId){
            return bakeries;
        }
        return bakeries.map(bakery => {
            const like = bakery.likes.find(like => {
                return like.user.toString() === userId
            });
            return {
                ...bakery.toObject(),
                isLiked: like ? true : false,
            };
        });
    }

    async findAllBakeries(): Promise<Bakery[]> {
        return await this.bakeryModel.find().exec();
    }
    
    //haversine formula
    private getDistanceFromLatLonInKm(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371; // 지구 반경 (km)
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // 두 지점 사이의 거리 (km)
      return d;
    }
    
    private deg2rad(deg: number): number {
      return deg * (Math.PI / 180);
    }
}
