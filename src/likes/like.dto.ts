import { ApiProperty } from "@nestjs/swagger";
export class LikeDto {
    @ApiProperty({
        example: '5f9f3c9c0b5c1c2c0c0c0c0c',
        description: 'userId',
        required: false,
    })
    userId: string;

    @ApiProperty({
        example: '5f9f3c9c0b5c1c2c0c0c0c0c',
        description: 'bakeryrId',
        required: false,
    })
    bakeryId: string;
}