import { Body, Controller, Get, Post, Req, Res, Session, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NaverAuthGuard } from './guards/naver.guard';
import { KakaoAuthGuard } from './guards/kakao.guard';
import { GoogleAuthGuard } from './guards/google.guard';
import axios from 'axios';
import { Request, response, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from 'src/common/decorators/user.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { winstonLogger } from 'src/common/winston.util';
import { logger } from 'src/main';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiResponse, ApiTags,ApiParam,ApiQuery } from '@nestjs/swagger';
import { RefreshAuthFilter } from 'src/common/filters/Refresh-auth.filter';
@ApiTags ("api/auth")
@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @ApiOperation({ 
        summary: '구글로그인 api',
        description: `<h1>구글로그인 api입니다.</h1>
            <h3>구글로그인 방법</h3>
            <h2>구글로그인 credentials를 받아서 서버에 보냈을 때, 로그인이 성공하면 accessToken과 refreshToken을 쿠키에 저장합니다.</h2>
            <h2>로그인이 성공하면 201 status code를 반환합니다.</h2>
            <h2>로그인이 실패하면 401 status code를 반환합니다.</h2>
            <h2>파라메터 포멧이 옳지 않을 경우 400 status code를 반환합니다.</h2>`, 
    })
    @ApiQuery({
        name: 'password',
        description: '아무거나 입력해서 보내주세요',
        required: true,
        example:"1234"
    })
    @ApiQuery({
        name: 'credentials',
        description: '구글로그인 credentials',
        required: true,
        example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5NjJlN2EwNTljN2Y1YzBjMGQ1NmNiYWQ1MWZlNjRjZWVjYTY3YzYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2NzY4NjM4NzIsImF1ZCI6IjUxNTEyMDgyMDA5LTBlczUzZGk2dTA3azI1Z240OGd1N2lwYWM2bjl2c2trLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTEzMzE2NDA4MDc2MzM5MDc3OTkzIiwiZW1haWwiOiJjaHcyMTA2MDFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6IjUxNTEyMDgyMDA5LTBlczUzZGk2dTA3azI1Z240OGd1N2lwYWM2bjl2c2trLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwibmFtZSI6IuydtOywrOyasCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BRWRGVHA0R1RleDY5M2VwZGpUS19EcFlQQWhHM1h1X2VnTVlCMEw3RGxwaz1zOTYtYyIsImdpdmVuX25hbWUiOiLssKzsmrAiLCJmYW1pbHlfbmFtZSI6IuydtCIsImlhdCI6MTY3Njg2NDE3MiwiZXhwIjoxNjc2ODY3NzcyLCJqdGkiOiIyZjc2NTVkNmE1NGU0MDM5ZmI2ZjVkNGFlMTBhMGIyNzhiNzVjMmYwIn0.HG4XM0qtImo_xewrPWSlXFg559nDq19QgnjqNAwpaSxCSFGbE1cht5ucgEz1ah9mGRAgZ1n10aRG4-OQQzlLeBRo6EeQ-e6C70lQx0oOMgyheJU87na5iE5agJkwJ9VylPkYLrIuGAWQwhCXrGvnURl-VRuA_zZOmwxAo-LkNEQiP3qkfbhTJqtnJju-WzU1b6ZWQt-JdqyTd3c07LGEKiF1UVlozer4KYDebCDJUcd8jsTZFTQMKJt7Gh8f6CzSRBEqB78arwwHRjsLcDbNrRyAoh0x3RWcrZs7Cu6ZST0tNGBaFPbxEgzYkEnVOesqOmB7K-Lql63AVDQRg0InSg"
    })
    @ApiResponse({ status: 201, description: '로그인 성공', schema: { example: {"_id":"63f212b10d7f8e35ba4305db","platform":"google","email":"chw210601@gmail.com","name":"이찬우","thumbnail":"https://lh3.googleusercontent.com/a/AEdFTp4GTex693epdjTK_DpYPAhG3Xu_egMYB0L7Dlpk=s96-c","createdAt":"2023-02-19T12:14:41.826Z","__v":0,"refreshToken":"$2b$10$WyATIlSaJYnOYPQhEkp7HePjy/NBKT6nugNm.sj3D/Hyb5.NN9cT."}}})
    @ApiResponse({ status: 401, description: '로그인 실패',  })  
    @Post('/google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@User() user :any, @Res() response:Response) {
        return await this.authService.sendLoginToken(user, response)
    }

    @ApiOperation({ 
        summary: '카카오로그인 api',
        description: `<h1>카카오로그인 api입니다.</h1>
            <h3>카카오로그인 방법</h3>
            <h2>카카오로그인 access_token과 refresh_token을 받아서 서버에 보내면 accessToken과 RefreshToken을 반환합니다.</h2>
            <h2>로그인이 성공하면 201 status code를 반환합니다.</h2>
            <h2>로그인이 실패하면 401 status code를 반환합니다.</h2> `, 
    })
    @ApiQuery({
        name: 'refresh_token',
        description: '카카오로그인 refresh_token',
        required: true,
        example: "zYVjRomfyH3TimntJSir_p5dppJfbq_UQVXzmEqaCisNHgAAAYZtCnwN"
    })
    @ApiQuery({
        name: 'acceess_token',
        description: '카카오 로그인 access_token',
        required: true,
        example:"XkcJzPX2arkyIIeTPRO1whhaTrD4TOjpA55ljoFQCisNHgAAAYZtCnwO"
    })
    @ApiResponse({ status: 201, description: '로그인 성공', schema: { example: {"_id":"63f206e98989248fb1ecebc2","platform":"kakao","email":"mosekiya@naver.com","name":"이찬우","thumbnail":"http://k.kakaocdn.net/dn/jpEbd/btrSQT03cpu/uaCqirAOv8xhN6Zr5MRF10/img_110x110.jpg","createdAt":"2023-02-19T11:24:25.833Z","__v":0,"refreshToken":"$2b$10$50Wv18CMRznVl0r1RZahGetizTBPKrkLo2PZC2wu8MnEoiG5fDknG"}}})
    @ApiResponse({ status: 401, description: '로그인 실패',  })  
    @Post('/kakao')
    @UseGuards(KakaoAuthGuard)
    async kakaoAuth(@User() user :any, @Res() response:Response) {
        return await this.authService.sendLoginToken(user, response)
    }

    @ApiOperation({ 
        summary: '네이버로그인 api',
        description: `<h1>네이버로그인 api입니다.</h1>
            <h3>네이버로그인 방법</h3>
            <h2>네이버로그인 access_token을 받아서 서버에 보내면 accessToken과 RefreshToken을 반환합니다.</h2>
            <h2>로그인이 성공하면 201 status code를 반환합니다.</h2>
            <h2>로그인이 실패하면 401 status code를 반환합니다.</h2>`, 
    })
    @ApiQuery({
        name: 'password',
        description: '아무거나 넣어서 보내주세요',
        required: true,
        example: "1234"
    })
    @ApiQuery({
        name: 'access_token',
        description: '네이버 로그인 access_token',
        required: true,
        example:"AAAAONVBJG5DovPe2MqrfpowwJujuugW6QfX3aMmSEaUucslC_8e8aNnq3xHUHE1imwAN8N6_okmFpVe5yrIL1EJBlw"
    })
    @ApiResponse({ status: 201, description: '로그인 성공', schema: { example: {"_id":"63f206e98989248fb1ecebc2","platform":"naver","email":"mosekiya@naver.com","name":"이찬우","thumbnail":"http://k.kakaocdn.net/dn/jpEbd/btrSQT03cpu/uaCqirAOv8xhN6Zr5MRF10/img_110x110.jpg","createdAt":"2023-02-19T11:24:25.833Z","__v":0,"refreshToken":"$2b$10$50Wv18CMRznVl0r1RZahGetizTBPKrkLo2PZC2wu8MnEoiG5fDknG"}}})
    @ApiResponse({ status: 401, description: '로그인 실패',  })  
    @Post('/naver')
    @UseGuards(NaverAuthGuard)
    async naverAuth(@User() user :any, @Res() response:Response) {
        return await this.authService.sendLoginToken(user, response)
    }

    @ApiOperation({ 
        summary: '로그아웃 api',
        description: `<h1>로그아웃 api입니다.</h1>
            <h2>로그아웃에 성공하면 201 status code를 반환합니다.</h2>
            <h2>로그아웃에 실패하면 401 status code를 반환합니다.</h2>`
    })    
    @Post('/logout')
    @UseGuards(JwtAuthGuard) 
    async signOut(@Req() req : Request, @Res() res: Response): Promise<any> {
        return await this.authService.logOut(req,res);
    }

    @ApiOperation({ 
        summary: 'jwt refresh api',
        description: `<h1>jwt refresh api입니다.</h1>
            <h2>api 요청 시 {"statusCode":401,"message":"jwt cookie not found","error":"Unauthorized"} 를 반환 받았다면</h2>
            <h2>이 api를 이용하여 jwt 토큰을 재발급 받을 수 있습니다.</h2>
            <h2>jwt refresh에 성공하면 200 status code를 반환합니다.</h2>
            <h2>jwt refresh에 실패하면 401 status code를 반환합니다.</h2>`
    })    
    @Get('/refresh')
    @UseGuards(JwtRefreshGuard)   
    async refresh(@User() user :any,@Req() req : Request, @Res() res: Response): Promise<any> {
        console.log(user, 'user')
        return await this.authService.refreshToken(user,req,res);
    }

    // @Get('/test2')
    // @UseGuards(JwtAuthGuard)
    // async test(@Req() req : Request,@Res() res: Response): Promise<any> {
    //     const cookie = req.cookies;
    //     console.log(cookie, 'cookie')
    //     return res.send(cookie);
    // }


}

