import { Timestamp } from "firebase/firestore";
import { User } from "./user.interface";

export interface Solicitud {
  uid: string;
  name: string;
  description: string;
  type: TipoSolicitud;
  subtype: Subtipo;
  state: EstadoSolicitud;
  createdAt?: Timestamp;
  assignedAt?: Timestamp;
  answerAt?: Timestamp;
  answer?: string;
  user: User;
  operario?: User;
}
export enum TipoSolicitud {
  SIVIGILA = "sivigila",
  // PROTOCOLO = "protocolo",
}

export enum SubtipoSivigila {
  // Define los subtipos específicos de Sivigila aquí
  SUBTIPO_1 = "Instalación",
  SUBTIPO_2 = "Actualización",
  SUBTIPO_3 = "Capacitación",
  SUBTIPO_4 = "Fortalecimiento",
  SUBTIPO_5 = "Ajustes",
  SUBTIPO_6 = "BAI",
 
}

// export enum SubtipoProtocolo {
//   // Define los subtipos específicos de Protocolo aquí
//   SUBTIPO_A = "Protocolo 1",
//   SUBTIPO_B = "Protocolo 2",
// }

// type Subtipo = SubtipoSivigila | SubtipoProtocolo;
type Subtipo = SubtipoSivigila ;

export enum EstadoSolicitud {
  PENDIENTE = "pendiente",
  ASIGNADA = "asignada",
  FINALIZADA = "finalizada",
}
