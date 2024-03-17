import { useAppContext } from "@/hooks/useAppContext";

export const useHandleSelectRoom = (roomId: string, roomName: string) => {
  const { setSelectedRoom, setSelectedRoomName } = useAppContext();
    setSelectedRoom(roomId);
    setSelectedRoomName(roomName);
  };
