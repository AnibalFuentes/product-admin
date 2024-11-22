import { Timestamp } from "firebase/firestore";
import { ItemImage } from "./item-image.interface";

export interface User {
  uid: string;
  image: ItemImage;
  name: string;
  email: string;
  password?: string;
  phone: string; // Nuevo campo de teléfono
  unit: Entity; // Nuevo campo de unidad, restringido a 'UI' o 'UPGD'
  role: "ADMINISTRADOR" | "REFERENTE" | "SOLICITANTE"; // Nuevo campo de rol
  state: boolean;
  createdAt?: Timestamp;
}

export interface Entity {
  id: string;
  nombre: string;
  tipo: "UI" | "UPGD";
}
