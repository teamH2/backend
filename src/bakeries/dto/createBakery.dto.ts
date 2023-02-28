import { Prop } from "@nestjs/mongoose";
import { Food } from "../food.schema";
import { LocationDto } from "./location.dto";

export class CreateBakeryDto {
    address: string;
    description: string;
    location: LocationDto;
    menu: Food[];
    name: string;
    phone: string;
    photos: string[];
    tags: string[];
    thumbnail: string;

}