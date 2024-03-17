import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

export const addNewRoom = async (userId: string) => {
  const roomName = prompt("ルーム名を入力してください。*10文字以内");

  if (roomName && roomName.length <= 10) {
    const newRoomRef = collection(db, "rooms");
    await addDoc(newRoomRef, {
      name: roomName,
      userid: userId,
      createdAt: serverTimestamp(),
    });
  } else {
    alert("新しいチャットルームを作成する際は10文字以内で入力してください。");
  }
};
