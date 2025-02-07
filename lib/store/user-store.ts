import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
    username: string;
    avatar: string | null;
    info: string | null;
}

interface Actions {
    setUser: (username: string) => void;
    setAvatar: (avatar: string) => void;
    setInfo: (info: string) => void;

    getUser: () => State;
}

const useUserStore = create<State & Actions>()(
    persist(
        (set, get) => ({
            username: "User",
            avatar: null,
            info: null,

            setUser: (username) => set({ username }),
            setAvatar: (avatar) => set({ avatar }),
            setInfo: (info) => set({ info }),

            getUser: () => get(),
        }),
        {
            name: "drawhsiper-template-user-store",
        }
    )
)

export default useUserStore;