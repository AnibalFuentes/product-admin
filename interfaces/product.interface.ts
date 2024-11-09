import { Timestamp } from "firebase/firestore";
import { ItemImage } from "./item-image.interface";

export interface Product{
    id?:string;
    name:string;
    price:number;
    toppings?:number
    salsas?:number
    image?:ItemImage;
    state:boolean;
    createtAt?: Timestamp;
}
