import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
    username: string;
    avatar: string | null;
    info: string | null;
    appellation: string | null;
}

interface Actions {
    setUser: (username: string) => void;
    setAvatar: (avatar: string) => void;
    setInfo: (info: string) => void;
    setAppellation: (appellation: string) => void;
    getUser: () => State;
}

const useUserStore = create<State & Actions>()(
    persist(
        (set, get) => ({
            username: "User",
            avatar: null,
            info: null,
            appellation: null,
            setUser: (username) => set({ username }),
            setAvatar: (avatar) => set({ avatar }),
            setInfo: (info) => set({ info }),
            setAppellation: (appellation) => set({ appellation }),
            getUser: () => get(),
        }),
        {
            name: "drawhsiper-template-user-store",
        }
    )
)

export default useUserStore;