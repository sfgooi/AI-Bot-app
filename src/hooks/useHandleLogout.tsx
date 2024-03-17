import { useRouter } from "next/navigation";
import { auth } from "../../firebase";

export const useHandleLogout = () => {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/login");
    auth.signOut();
  };

  return handleLogout;
};