"use client";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import Textarea from "@mui/joy/Textarea";
import LoadingIcons from "react-loading-icons";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FiLogOut, FiSend } from "react-icons/fi";
import { db } from "../../../firebase";
import { useAppContext } from "@/hooks/useAppContext";
import OpenAI from "openAi";
import { addNewRoom } from "../../utils/addNewRoom";
import { IoIosArrowUp } from "react-icons/io";
import { IoAddSharp } from "react-icons/io5";
import { Disclosure } from "@headlessui/react";
import { RoomsInfo } from "@/types/types";
import { useHandleLogout } from "@/hooks/useHandleLogout";

type Message = {
  text: string;
  sender: string;
  createdAt: Timestamp;
};

const Chat = () => {
  const openAi = useMemo(
    () =>
      new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
        dangerouslyAllowBrowser: true,
      }),
    []
  );

  const { selectedRoom, selectedRoomName } = useAppContext();
  const [input, setInput] = useState<string>("");
  const [massages, setMassages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { userId, setSelectedRoom, setSelectedRoomName } = useAppContext();
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

  useEffect(() => {
    if (selectedRoom) {
      const fetchMessages = async () => {
        const roomDocRef = doc(db, "rooms", selectedRoom);
        const messageCollectionRef = collection(roomDocRef, "messages");

        const q = query(messageCollectionRef, orderBy("createdAt"));

        const undubscribe = onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
          setMassages(newMessages);
        });

        return () => {
          undubscribe();
        };
      };
      fetchMessages();
    }
  }, [selectedRoom]);

  const scrollDiv = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const messageData = {
      text: input,
      sender: "user",
      createdAt: serverTimestamp(),
    };

    // messageをFirebaseに保存
    const roomDocRef = doc(db, "rooms", selectedRoom!);
    const messageCollectionRef = collection(roomDocRef, "messages");
    await addDoc(messageCollectionRef, messageData);

    setInput("");
    setIsLoading(true);

    const element = scrollDiv.current;
    element?.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });

    // OpenAIからの返信
    const gpt3Response = await openAi.chat.completions.create({
      messages: [{ role: "user", content: input }],
      model: "gpt-3.5-turbo",
    });

    setIsLoading(false);

    element?.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });

    const botResponse = gpt3Response.choices[0].message.content;
    await addDoc(messageCollectionRef, {
      text: botResponse,
      sender: "bot",
      createdAt: serverTimestamp(),
    });

    element?.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }, [input, selectedRoom, openAi]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      sendMessage();
      setInput("");
    }
  };

  const selectRoom = (roomId: string, roomName: string) => {
    setSelectedRoom(roomId);
    setSelectedRoomName(roomName);
  };

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <div className="h-full flex flex-col">
            <div>
              <div className="bg-custom-green w-full fixed z-20 py-4 pl-4 pr-4">
                <div className="flex justify-between">
                  <h1
                    style={{ fontSize: "1.35rem" }}
                    className="text-center text-white font-semibold truncate"
                  >
                    {selectedRoomName ?? "※ルーム未選択"}
                  </h1>
                  <div className="flex items-center gap-4 md:hidden">
                    <div
                      onClick={handleLogout}
                      className="flex items-center gap-6 cursor-pointer text-slate-100"
                    >
                      <FiLogOut />
                    </div>
                    <Disclosure.Button>
                      <IoIosArrowUp
                        size={20}
                        color="#fff"
                        className={`${
                          open
                            ? "rotate-180 transform flex duration-300"
                            : "rotate-0 duration-300"
                        }`}
                      />
                    </Disclosure.Button>
                    <div
                      onClick={() => (userId ? addNewRoom(userId) : null)}
                      className="pr-2 md:none"
                    >
                      <span className="text-white">
                        <IoAddSharp size={22} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Disclosure.Panel className="mt-[64.4px]">
                <div className="h-full">
                  <ul
                    style={{ zIndex: "5" }}
                    className="w-full absolute overflow-y-auto flex flex-col"
                  >
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
                          className="bg-blue-500 text-center md:text-left cursor-pointer border-b p-4 text-slate-100 hover:bg-blue-500 duration-150 truncate fadeInUp"
                        >
                          {room.name}
                        </li>
                      ))}
                  </ul>
                </div>
              </Disclosure.Panel>
            </div>
            <div
              className="flex-grow overflow-y-auto mb-4 px-3 mt-[64px] md:px-12"
              ref={scrollDiv}
            >
              {massages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.sender === "user" ? "text-right" : "text-left"
                  }
                >
                  <div
                    className={`
              max-w-[70vw]
              md:max-w-[50vw]
              ${
                message.sender === "user"
                  ? "break-words overflow-wrap whitespace-pre-line bg-blue-500 inline-block rounded px-4 py-2 m-1"
                  : "break-words overflow-wrap whitespace-pre-line bg-green-500 inline-block rounded px-4 py-2 m-1"
              }
              `}
                  >
                    <p className="text-white">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <LoadingIcons.TailSpin width="50" stroke="#BDBDBD" />
              )}
            </div>
            <div className="flex-shrink-0 relative px-6 pb-2 md:pb-4 md:px-12">
              <Textarea
                disabled={selectedRoom === null}
                className="border-2 resize-none rounded w-full pr-10 fadeInUp duration-300 focus:outline-none p-2 disabled:bg-gray-400"
                placeholder="質問内容を入力してください"
                onChange={handleInputChange}
                value={input}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={sendMessage}
                className="h-fit absolute bottom-[0.9rem] right-10 md:bottom-[1.55rem] md:right-16 flex items-center"
              >
                <FiSend style={{ marginBottom: "0.25rem" }} />
              </button>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
};

export default Chat;
