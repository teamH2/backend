import { utilities, WinstonModule } from 'nest-winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';

const dailyOptions = (level: string) => {
    return {
      level,
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + `/${level}`,
      filename: `%DATE%.${level}.log`,
      maxFiles: 30, //30일치 로그파일 저장
      zippedArchive: true, // 로그가 쌓이면 압축하여 관리
    };
  };

const env = process.env.NODE_ENV;
const logDir = __dirname + '/../../logs'; // log 파일을 관리할 폴더
export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'production',
      format:
          winston.format.combine(
              winston.format.timestamp(),
              utilities.format.nestLike('backend', {
                prettyPrint: true, 
              }),
            ),
    }),

    // info, warn, error 로그는 파일로 관리
    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('warn')),
    new winstonDaily(dailyOptions('error')),
  ],
});

