import { Timestamp } from "firebase/firestore";
import { ItemImage } from "./item-image.interface";

export interface Category{
    id?:string;
    image:ItemImage;
    name:string;
    state:boolean;
    createtAt?: Timestamp;
}
