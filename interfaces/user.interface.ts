import { Timestamp } from "firebase/firestore";
import { ItemImage } from "./item-image.interface";

export interface User {
    uid: string;
    image: ItemImage;
    name: string;
    email: string;
    password?: string;
    phone: string; // Nuevo campo de teléfono
    unit: 'UI' | 'UPGD'; // Nuevo campo de unidad, restringido a 'UI' o 'UPGD'
    role: 'ADMIN' | 'OPERARIO' | 'USUARIO'; // Nuevo campo de rol
    Entity:string;
    state: boolean;
    createdAt?: Timestamp;
  }
  
  export interface Entity{
    id: string;
    name: string;
    type:'UI' | 'UPGD';
  }