import { IsNotEmpty } from "class-validator"

export class SearchDto {
    @IsNotEmpty()
    search:string

    tags: string

    @IsNotEmpty()
    page: number 

    @IsNotEmpty()
    limit: number

    @IsNotEmpty()
    order : string
}