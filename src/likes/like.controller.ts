import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserData } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/user.schema';
import { LikeDto } from './like.dto';
import { Like } from './like.schema';
import { LikeService } from './like.service';

@Controller("/api/like")
export class LikeController {

    constructor(
        private readonly likeService: LikeService
    ) {}
    @Post()
    // @UseGuards(JwtAuthGuard)
    async createLike(
        @UserData() user: User,
        @Body() body: LikeDto): Promise<Like> {

        return this.likeService.create(body.userId, body.bakeryId);
    }

    @Get("/user/:userId")
    async findByUser(@Param() likeDto: LikeDto): Promise<Like[]> {

        return this.likeService.findByUser(likeDto.userId);
    }

    @Get("/bakery/:bakeryId")
    async findByBakery(@Param() likeDto: LikeDto): Promise<Like[]> {
        return this.likeService.findByBakery(likeDto.bakeryId);
    }

    @Delete()
    // @UseGuards(JwtAuthGuard)
    async deleteLike(@Body() body: LikeDto): Promise<Like> {
        return this.likeService.delete(body.userId, body.bakeryId);
    }


 }
