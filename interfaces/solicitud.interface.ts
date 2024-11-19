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
  PROTOCOLO = "protocolo",
}

export enum SubtipoSivigila {
  // Define los subtipos específicos de Sivigila aquí
  SUBTIPO_1 = "sivigila 1",
  SUBTIPO_2 = "sivigila 2",
}

export enum SubtipoProtocolo {
  // Define los subtipos específicos de Protocolo aquí
  SUBTIPO_A = "Protocolo 1",
  SUBTIPO_B = "Protocolo 2",
}

type Subtipo = SubtipoSivigila | SubtipoProtocolo;

export enum EstadoSolicitud {
  PENDIENTE = "pendiente",
  ASIGNADA = "asignada",
  FINALIZADA = "finalizada",
}
