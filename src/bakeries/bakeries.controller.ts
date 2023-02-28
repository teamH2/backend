import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { BakeriesService } from './bakeries.service';
import { Bakery } from './bakery.schema';
import { Review } from './reviews.schema';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiResponse, ApiTags,ApiParam,ApiQuery } from '@nestjs/swagger';
import { CreateBakeryDto } from './dto/createBakery.dto';
import { SuccessInterceptor } from 'src/common/interceptors/success.interceptor';
import { IsUserReviedBakeryInterceptor } from 'src/common/interceptors/isUserReviewdBakery.interceptor';
import { User } from 'src/users/user.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import {isMongoId} from 'class-validator';
import { ParseObjectIdPipe, ValidateObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { UserData } from 'src/common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optionalJwt.guard';
import { SearchDto } from './dto/search.dto';


@ApiTags ("api/bakeries")
@UseInterceptors(SuccessInterceptor)
@Controller("/api/bakeries")
export class BakeriesController { 

    constructor(private readonly bakeryService: BakeriesService) {}
    
    /* Bakery CRUD */

    @ApiOperation({ 
        summary: 'tag로 빵집 찾기(빵집 이름으로 정렬) ',
        description: `<h1>tag로 빵집 찾기(빵집 이름으로 정렬)입니다.</h1>
            <h2>찾기에 성공하면 200 status code를 반환합니다.</h2>
            <h2>찾기에 실패하면 500 status code를 반환합니다.</h2>`, 
    })
    @ApiQuery({
        name: 'search',
        description: 'search할 항목을 입력해주세요',
        required: true,
        example:"붕붕 빵집"
    })
    @ApiQuery({
        name: 'tags',
        description: 'tags를 예시처럼 입력해주세요',
        required: true,
        example:"송파구,아늑함,커피"
    })
    @ApiQuery({
        name: 'perPage',
        description: '한 페이지에 보여줄 빵집의 수를 입력해주세요',
        required: true,
        example: 20
    })
    @ApiQuery({
        name: 'page',
        description: '페이지를 입력해주세요',
        required: true,
        example: 1
    })
    @ApiQuery({
        name: 'order',
        description: '정렬방식을 입력해주세요 오름차순: asc, 내림차순: desc',
        required: true,
        example: 'asc'
    })
    @ApiResponse({ status: 200, description: '빵집찾기 성공', schema: { example: []}})
    @ApiResponse({ status: 500, description: '서버에러',  })  
    @Get('tags_with_name')
    @UseGuards(OptionalJwtAuthGuard)
    async findByTagsWithName(@Query() searchDto: SearchDto, @UserData() user:User ): Promise<Bakery[]> {
        return await this.bakeryService.findBakeryByTagsWithName(searchDto,user?._id);
    }
    @ApiOperation({ 
        summary: 'tag로 빵집 찾기(평가 순으로 정렬) ',
        description: `<h1>tag로 빵집 찾기(평가 순으로 정렬)입니다.</h1>
            <h2>찾기에 성공하면 200 status code를 반환합니다.</h2>
            <h2>찾기에 실패하면 500 status code를 반환합니다.</h2>`, 
    })
    @ApiQuery({
        name: 'search',
        description: 'search할 항목을 입력해주세요',
        required: true,
        example:"붕붕 빵집"
    })
    @ApiQuery({
        name: 'tags',
        description: 'tags를 예시처럼 입력해주세요',
        required: true,
        example:"송파구,아늑함,커피"
    })
    @ApiQuery({
        name: 'perPage',
        description: '한 페이지에 보여줄 빵집의 수를 입력해주세요',
        required: true,
        example: 20
    })
    @ApiQuery({
        name: 'page',
        description: '페이지를 입력해주세요',
        required: true,
        example: 1
    })
    @ApiQuery({
        name: 'order',
        description: '정렬방식을 입력해주세요 오름차순: asc, 내림차순: desc',
        required: true,
        example: 'asc'
    })
    @ApiResponse({ status: 200, description: '빵집찾기 성공', schema: { example: [{ _id: '60d9f2b0b0b5b8a0b4b0b0b0', userId: '60d9f2b0b0b5b8a0b4b0b0b0', bakeryId: '60d9f2b0b0b5b8a0b4b0b0b0', content: '맛있어요', rating: 5, createdAt: '2021-06-30T07:00:00.000Z', updatedAt: '2021-06-30T07:00:00.000Z', __v: 0 }]}})
    @ApiResponse({ status: 500, description: '서버에러',  })  
    @Get('tags_with_rating')
    @UseGuards(OptionalJwtAuthGuard)
    async findByTagsWithRating(@Query() searchDto: SearchDto, @UserData() user:User ): Promise<Bakery[]> {
        return await this.bakeryService.findBakeryByTagsWithRating(searchDto,user?._id);
    }

    @ApiOperation({ 
        summary: 'tag로 빵집 찾기(리뷰 순으로 정렬) ',
        description: `<h1>tag로 빵집 찾기(리뷰 순으로 정렬)입니다.</h1>
            <h2>찾기에 성공하면 200 status code를 반환합니다.</h2>
            <h2>찾기에 실패하면 500 status code를 반환합니다.</h2>`, 
    })
    @ApiQuery({
        name: 'search',
        description: 'search할 항목을 입력해주세요',
        required: true,
        example:"붕붕 빵집"
    })
    @ApiQuery({
        name: 'tags',
        description: 'tags를 예시처럼 입력해주세요',
        required: true,
        example:"송파구,아늑함,커피"
    })
    @ApiQuery({
        name: 'perPage',
        description: '한 페이지에 보여줄 빵집의 수를 입력해주세요',
        required: true,
        example: 20
    })
    @ApiQuery({
        name: 'page',
        description: '페이지를 입력해주세요',
        required: true,
        example: 1
    })
    @ApiQuery({
        name: 'order',
        description: '정렬방식을 입력해주세요 오름차순: asc, 내림차순: desc',
        required: true,
        example: 'asc'
    })
    @ApiResponse({ status: 200, description: '빵집찾기 성공', schema: { example: [{ _id: '60d9f2b0b0b5b8a0b4b0b0b0', userId: '60d9f2b0b0b5b8a0b4b0b0b0', bakeryId: '60d9f2b0b0b5b8a0b4b0b0b0', content: '맛있어요', rating: 5, createdAt: '2021-06-30T07:00:00.000Z', updatedAt: '2021-06-30T07:00:00.000Z', __v: 0 }]}})
    @ApiResponse({ status: 500, description: '서버에러',  })  
    @Get('tags_with_reviews')
    @UseGuards(OptionalJwtAuthGuard)
    async findByTagsWithCount(@Query() searchDto: SearchDto, @UserData() user:User): Promise<Bakery[]> {
        return await this.bakeryService.findBakeryByTagsWithReviewCount(searchDto,user?._id);
    }

    @Post()
    async create(@Body() createBakeryDto: CreateBakeryDto) {
        return await this.bakeryService.createBakery(createBakeryDto);
    }

    @Get()
    async findBakeryById(@Query('bakeryId') id: string) {
        return await this.bakeryService.findBakeryById(id);
    }

    /* Review CRUD */

    @ApiOperation({ 
        summary: 'bakeryId로 reviews 찾기 ',
        description: `<h1>bakeryId로 reviews 찾기입니다</h1>
            <h2>찾기에 성공하면 200 status code를 반환합니다.</h2>
            <h2>찾기에 실패하면 500 status code를 반환합니다.</h2>`, 
    })
    @ApiQuery({
        name: 'bakeryId',
        description: 'bakeryId를 입력해주세요',
        required: true,
        example:"60d9f2b0b0b5b8a0b4b0b0b0"
    })
    @ApiResponse({ status: 200, description: '리뷰찾기 성공', schema: { example: [{ _id: '60d9f2b0b0b5b8a0b4b0b0b0', userId: '60d9f2b0b0b5b8a0b4b0b0b0', bakeryId: '60d9f2b0b0b5b8a0b4b0b0b0', content: '맛있어요', rating: 5, createdAt: '2021-06-30T07:00:00.000Z', updatedAt: '2021-06-30T07:00:00.000Z', __v: 0 }]}})
    @ApiResponse({ status: 500, description: '서버에러',  })  
    @Get('/review/bakery/:bakeryId')
    async findReviewsByBakeryId(@Param('bakeryId') bakeryId: string): Promise<Review[]> {
        return await this.bakeryService.findReviewsByBakeryId(bakeryId);
    }

    @ApiOperation({ 
        summary: 'userId로 reviews 찾기 ',
        description: `<h1>userId로 reviews 찾기입니다</h1>
            <h2>찾기에 성공하면 200 status code를 반환합니다.</h2>
            <h2>유저가 존재하지 않을 경우 404 status code를 반환합니다.</h2>
            <h2>찾기에 실패하면 500 status code를 반환합니다.</h2>`, 
    })
    @ApiQuery({
        name: 'userId',
        description: 'userId를 입력해주세요',
        required: true,
        example:"60d9f2b0b0b5b8a0b4b0b0b0"
    })
    @ApiResponse({ status: 200, description: '리뷰찾기 성공', schema: { example: [{ _id: '60d9f2b0b0b5b8a0b4b0b0b0', userId: '60d9f2b0b0b5b8a0b4b0b0b0', bakeryId: '60d9f2b0b0b5b8a0b4b0b0b0', content: '맛있어요', rating: 5, createdAt: '2021-06-30T07:00:00.000Z', updatedAt: '2021-06-30T07:00:00.000Z', __v: 0 }]}})
    @ApiResponse({ status: 400, description: `User not found`,  })  
    @ApiResponse({ status: 500, description: '서버에러',  })  
    @Get('/review/user/:userId')
    async findReviewsByUserId(@Param('userId') userId: string): Promise<Review[]> {
        return await this.bakeryService.findReviewsByUserId(userId);
    }

    @ApiOperation({ 
        summary: 'reviewId로 reviews 찾기 ',
        description: `<h1>reviewId로 reviews 찾기입니다</h1>
            <h2>찾기에 성공하면 200 status code를 반환합니다.</h2>
            <h2>찾기에 실패하면 500 status code를 반환합니다.</h2>`, 
    })
    @ApiQuery({
        name: 'reviewId',
        description: 'reviewId를 입력해주세요',
        required: true,
        example:"60d9f2b0b0b5b8a0b4b0b0b0"
    })
    @ApiResponse({ status: 200, description: '리뷰찾기 성공', schema: { example: { _id: '60d9f2b0b0b5b8a0b4b0b0b0', userId: '60d9f2b0b0b5b8a0b4b0b0b0', bakeryId: '60d9f2b0b0b5b8a0b4b0b0b0', content: '맛있어요', rating: 5, createdAt: '2021-06-30T07:00:00.000Z', updatedAt: '2021-06-30T07:00:00.000Z', __v: 0 }}})
    @ApiResponse({ status: 500, description: '서버에러',  })  
    @Get('/review/:reviewId')
    async findReviewByReviewId(@Param('reviewId') reviewId: string): Promise<Review> {
        return await this.bakeryService.findReviewByReviewId(reviewId);
    }

    @ApiOperation({ 
        summary: 'review 업로드 ',
        description: `<h1>review업로드 입니다</h1>
            <h2>body에 userId, bakeryId, rating, content를 넣어서 보내주세요</h2>
            <h2>찾기에 성공하면 201 status code를 반환합니다.</h2>
            <h2>찾기에 실패하면 500 status code를 반환합니다.</h2>`, 
    })
    @ApiQuery({
        name: 'post review',
        description: '다읍과 같이 보내주세요',
        required: true,
        example:{    
            userId: "60d9f2b0b0b5b8a0b4b0b0b0",
            bakeryId: "60d9f2b0b0b5b8a0b4b0b0b0",
            content: "맛있어요",
            rating: 5,
        }
    })
    @ApiResponse({ status: 200, description: '리뷰업로드 성공', schema: { example:'아직' }})
    @ApiResponse({ status: 400, description: '이미 리뷰를 작성하셨습니다.',  }) 
    @ApiResponse({ status: 500, description: '서버에러',  }) 
    // @UseGuards(JwtAuthGuard)
    @Post('/review')
    async createReview(@Body() review: Review): Promise<Review> {
        const check = await this.bakeryService.isUserReviewedBakery(review.userId, review.bakeryId);
        if(check) throw new HttpException('이미 리뷰를 작성하셨습니다.', 400);
        return await this.bakeryService.createReview(review);
    }

    // @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'review 수정',
        description: `<h1>review 수정입니다</h1>
            <h2>param에 reviewId, body에 수정할 userId, bakeryId, rating, content를 넣어서 보내주세요</h2>
            <h2>수정에 성공하면 201 status code를 반환합니다.</h2>
            <h2>수정에 실패하면 500 status code를 반환합니다.</h2>`,
    })
    @ApiParam({
        name: 'reviewId',
        description: 'reviewId를 입력해주세요',
        required: true,
        example:"60d9f2b0b0b5b8a0b4b0b0b0"
    })
    @ApiQuery({
        name: 'body',
        description: '다읍과 같이 보내주세요',
        required: true,
        example:{
            userId: "60d9f2b0b0b5b8a0b4b0b0b0",
            bakeryId: "60d9f2b0b0b5b8a0b4b0b0b0",
            content: "맛있어요",
            rating: 5,
        }
    })
    // @UseGuards(JwtAuthGuard)
    @Put('/review/:reviewId')
    async updateReview(@Param('reviewId') reviewId: string, @Body() review: Review): Promise<Review> {
        return await this.bakeryService.updateReview(reviewId, review);
    }

    @Delete('/review/:reviewId')
    async deleteReview(@Param('reviewId') reviewId: string): Promise<Review> {
        return await this.bakeryService.deleteReview(reviewId);
    }

    @Get('/district')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiQuery({ name: 'district', required: true, description: 'Search district' })
    @ApiResponse({ status: 200, type: [Bakery] })
    async findByDistrict(@UserData() user:any, @Query('district') district: string): Promise<Bakery[]> {
        const bakeries = await this.bakeryService.findByDistrict(district, user?._id);
        return bakeries;
    }

    @Post('upload/review/photo')
    @UseInterceptors(FileInterceptor('file',{
        storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
            cb(null, `${randomName}${extname(file.originalname)}`)
        }
        })
    }))
    uploadPhoto(@UploadedFiles() file) {
        return {
        url: `${process.env.BACKEND_URL}/${file.path}`
        }
    }

}
