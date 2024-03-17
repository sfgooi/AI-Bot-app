"use client";
import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { db } from "../../../firebase";
import { useAppContext } from "@/hooks/useAppContext";
import { addNewRoom } from "../../utils/addNewRoom";
import { IoAddSharp } from "react-icons/io5";
import { useHandleLogout } from "@/hooks/useHandleLogout";

type RoomsInfo = {
  id: string;
  name: string;
  createdAt: Timestamp;
};

const Slider: React.FC = () => {
  const { user, userId, setSelectedRoom, setSelectedRoomName } =
    useAppContext();
  const [rooms, setRooms] = useState<RoomsInfo[]>([]);

  const handleLogout = useHandleLogout();

  useEffect(() => {
    const fetchRooms = async () => {
      const roomCollectionRef = collection(db, "rooms");
      const q = query(
        roomCollectionRef,
        where("userid", "==", userId),
        orderBy("createdAt")
      );
      const undubscribe = onSnapshot(q, (snapshot) => {
        const newRooms: RoomsInfo[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          createdAt: doc.data().createdAt,
        }));
        setRooms(newRooms);
      });
      return () => {
        undubscribe();
      };
    };

    fetchRooms();
  }, [userId]);

  const selectRoom = (roomId: string, roomName: string) => {
    setSelectedRoom(roomId);
    setSelectedRoomName(roomName);
  };

  return (
    <div className="bg-custom-green h-full overflow-hidden px-5 flex flex-col">
      <div className="flex-grow w-260px h-[60%]">
        <div className="cursor-pointer flex items-center border mt-6 rounded-md hover:bg-blue-500 duration-150 fadeInUp">
          <div
            onClick={() => (userId ? addNewRoom(userId) : null)}
            className="flex justify-around items-center gap-6 px-4 py-2"
          >
            <span className="text-white">
              <IoAddSharp />
            </span>
            <h1 className="text-white font-semibold">New Chat Room</h1>
          </div>
        </div>
        <div className="h-[90%] overflow-y-scroll">
          <ul className="flex flex-col">
            {rooms
              .slice()
              .sort((a, b) => {
                // createdAtが存在し、Timestampオブジェクトであることを確認
                const aSeconds = a.createdAt?.seconds ?? 0;
                const bSeconds = b.createdAt?.seconds ?? 0;
                return bSeconds - aSeconds;
              })
              .map((room, index) => (
                <li
                  style={{
                    animationDelay: `${index * 0.1}s`, // 各liタグのアニメーション開始を遅延
                  }}
                  key={room.id}
                  onClick={() => selectRoom(room.id, room.name)}
                  className="cursor-pointer border-b p-4 text-slate-100 hover:bg-blue-500 duration-150 truncate fadeInUp"
                >
                  {room.name}
                </li>
              ))}
          </ul>
        </div>
      </div>
      {user && (
        <div className="m-2 p-4 text-white duration-150 fadeInUp">
          {user.email}
        </div>
      )}
      <div
        onClick={handleLogout}
        className="flex items-center gap-6 mb-2 cursor-pointer p-4 text-slate-100 hover:bg-slate-700 duration-300"
      >
        <FiLogOut className="fadeInUp duration-300" />
        <span className="fadeInUp duration-300">ログアウト</span>
      </div>
    </div>
  );
};

export default Slider;
