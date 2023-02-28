import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Platform, User, UserDocument } from 'src/users/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { logger } from 'src/main';
const googleclient = new OAuth2Client(
  process.env.OAUTH_ID,
  process.env.OAUTH_PW,
 );

@Injectable()
export class AuthService {

  constructor(    
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService:UsersService,
  ) {}

  async getGooglePayload(credential:string) {
    try{
      const ticket = await googleclient.verifyIdToken({
        idToken: credential,
        audience: process.env.OAUTH_ID,
      });
      const { email, name, picture } = ticket.getPayload();
      const userinfo = {
        email,
        platform: Platform.GOOGLE,
      }
      const user = await this.userModel.findOne(userinfo).exec();
      if(!user){
        const newUser = await this.userModel.create({
          email,
          name,
          thumbnail: picture,
          platform: Platform.GOOGLE,
        })
        logger.log(`${newUser.platform} ${newUser.email} is created`)
        return newUser;
      }
      return user;
    }catch(err){
      console.log(err)
    }
  }

  async getKakaoPayload(access_token:string) {
    try{
      const data = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const {nickname, thumbnail_image_url} = data.data.kakao_account.profile;
      const {email} = data.data.kakao_account;
      const userinfo = {
        email,
        platform: Platform.KAKAO,
      }
      const user = await this.userModel.findOne(userinfo).exec();
      if(!user){
        const newUser = await this.userModel.create({
          email,
          name: nickname,
          thumbnail: thumbnail_image_url,
          platform: Platform.KAKAO,
        })
        logger.log(`${newUser.platform} ${newUser.email} is created`)
        return newUser;
      }
      return user;
    }catch(err){
      console.log(err)
    }
  }

  async getNaverPayload(access_token:string) {
    try{
      const naverData = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const {email, nickname, profile_image} = naverData.data.response;
      const userinfo = {
        email,
        platform: Platform.NAVER,
      }
      const user = await this.userModel.findOne(userinfo).exec();
      if(!user){
        const newUser = await this.userModel.create({
          email,
          name: nickname,
          thumbnail: profile_image,
          platform: Platform.NAVER,
        })
        logger.log(`${newUser.platform} ${newUser.email} is created`)
        return newUser;
      }
      return user;
    }catch(err){
      console.log(err)
    }
  }

  async logOut( req:any, res : Response ) : Promise< any >{
    try{
        const jwt_name= this.configService.get('JWT_NAME');
        if(req.cookies && jwt_name in req.cookies && req.cookies[jwt_name]){
            res.clearCookie(jwt_name);
            res.clearCookie(this.configService.get('REFRESH_TOKEN_NAME'));
            req.session.destroy((err) => {
                if(err){
                    throw new HttpException('로그아웃 실패',HttpStatus.INTERNAL_SERVER_ERROR);
                }
            });
            logger.log(`${req.user.email} is logged out`);
            return res.end();
        }else{
            throw new UnauthorizedException('you are not logged in');
        }
    }catch(e){
        throw new HttpException(e.message, e.status);        
    }
}
    async getCookieWithJwtAccessToken(payload : any) {
      if(payload.iat && payload.exp){
          delete payload.iat;
          delete payload.exp;
      }else{
          payload = payload.toObject(); 
      }
      const token = this.jwtService.sign(payload,{
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: Number(`${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`),
        })
      return {
        accessToken: token,
        accessOption: {
          httpOnly: false,
          maxAge:
            Number(this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')),
        },
      };
    }
    async getCookieWithJwtRefreshToken(payload : any) {
      payload = payload.toObject(); 
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: Number(`${this.configService.get(
          'JWT_REFRESH_TOKEN_EXPIRATION_TIME', 
          )}`),
      });
      return {
          refreshToken: token,
          refreshOption: {
              httpOnly: false,
              // secure: true,
              maxAge:
                  Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')),
          },
      };
  }

  async getUserRefreshTokenMatches(refreshToken: string,userId: string): Promise<boolean> {
      const user = await this.userService.findUserById(userId);
      if (user == null) {
        throw new UnauthorizedException('user not found');
      }
      const isRefreshTokenMatch = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (isRefreshTokenMatch) {
        return true;
      } else {
        return false
      }
  }
  async sendLoginToken(user : User, res : Response) {
    const { accessToken, accessOption } = await this.getCookieWithJwtAccessToken(user);
    const { refreshToken, refreshOption } = await this.getCookieWithJwtRefreshToken(user);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const users = await this.userModel.findByIdAndUpdate(user._id, { refreshToken : hashedRefreshToken });
    const { reviewCount, bookmark, visitied, ...result } = users.toObject();
    res.cookie(this.configService.get('JWT_NAME'), accessToken, accessOption);
    res.cookie(this.configService.get('REFRESH_TOKEN_NAME'), refreshToken, refreshOption);
    logger.log(`${user.platform} ${user.email} is logged in`);
    return res.status(201).send(result).end();
  }
  async refreshToken( user: any, req ,res: Response ) : Promise< any >{
    try{
      if(user){
          const { accessToken, accessOption } = await this.getCookieWithJwtAccessToken(user);
          res.cookie(this.configService.get('JWT_NAME'), accessToken,accessOption);
          // if(req.header['redirectedFrom'] !== undefined){
          //   logger.verbose(`${user.id} : access token refreshed`);
          //   return res.status(201).redirect(HttpStatus.PERMANENT_REDIRECT,req.header['redirectedFrom']);
          // }
          return res.status(201).end();
      }else{
          throw new UnauthorizedException('you are not logged in');
      }
    }catch(e){
        throw new HttpException(e.message, e.status);
    }
  }
}

