import { Timestamp } from "firebase/firestore";
import { ItemImage } from "./item-image.interface";

export interface Topping{
    id?:string;
    name:string;
    price:number;
    image?:ItemImage;
    state:boolean;
    createtAt?: Timestamp;
}
