import { Body, Controller, Get, HttpException, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { Bakery, BakeryDocument } from 'src/bakeries/bakery.schema';
import { Review, ReviewDocument } from 'src/bakeries/reviews.schema';
import { UserData } from 'src/common/decorators/user.decorator';
import { SuccessInterceptor } from 'src/common/interceptors/success.interceptor';
import { logger } from 'src/main';
import { User, UserDocument } from './user.schema';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import { extname } from 'path';


@ApiTags ("api/user")
@UseInterceptors(SuccessInterceptor)
@Controller("api/user")
export class UsersController { 

    constructor(
        private readonly usersService: UsersService,
    ) { }
    
    @Get("/:userId")
    async findUserById(@Param()  userId: string): Promise<User>   {
        return this.usersService.findUserById(userId);
    }

    @Get("/")
    async findAllUsers(): Promise<User[]> {
        try{
            return this.usersService.findAllUsers();
        }catch(error){
            logger.error(error);
            throw new HttpException("서버에러", 500);
        }
    }

    @Put("/")
    async updateUser(@UserData() user:User,@Body() body:User): Promise<User> {
        try{
            return this.usersService.updateUserById(user._id,body);
        }catch(error){
            logger.error(error);
            throw new HttpException("서버에러", 500);
        }
    }

    @Post('upload/photo')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
            cb(null, `${randomName}${extname(file.originalname)}`)
        }
        })
    }))
    uploadPhoto(@UploadedFile() file) {
        return {
        url: `${process.env.BACKEND_URL}/${file.path}`
        }
    }

}
