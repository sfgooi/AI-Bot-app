"use client";
import { User, onAuthStateChanged } from "firebase/auth";
import React, { ReactNode, createContext, useEffect, useState } from "react";
import { auth } from "../../firebase";
import { usePathname, useRouter } from "next/navigation";

type AppProviderProps = {
  children: ReactNode;
};

type AppContextType = {
  user: User | null;
  userId: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  selectedRoom: string | null;
  setSelectedRoom: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRoomName: string | null;
  setSelectedRoomName: React.Dispatch<React.SetStateAction<string | null>>;
};

const defaultContext = {
  user: null,
  userId: null,
  setUser: () => {},
  selectedRoom: null,
  setSelectedRoom: () => {},
  selectedRoomName: null,
  setSelectedRoomName: () => {},
};

export const AppContext = createContext<AppContextType>(defaultContext);

export function AppProvider({ children }: AppProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
      setUserId(newUser ? newUser.uid : null);

      if (typeof window !== "undefined") {
        if (!newUser && pathname !== "/auth/login") {
          router.push("/auth/login");
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        userId,
        setUser,
        selectedRoom,
        setSelectedRoom,
        selectedRoomName,
        setSelectedRoomName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
