import { Timestamp } from "firebase/firestore";

export type RoomsInfo = {
  id: string;
  name: string;
  createdAt: Timestamp;
};