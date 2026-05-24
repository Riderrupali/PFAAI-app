import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Language = "en" | "mr" | "hi";
export type VoiceType = "male" | "female" | "child";
export type AppMode = "chat" | "voice";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

interface AppState {
  isOnboarded: boolean;
  isLoading: boolean;
  language: Language;
  userName: string;
  aiName: string;
  voiceType: VoiceType;
  wakeWord: string;
  mode: AppMode;
  messages: Message[];
}

interface AppContextType extends AppState {
  setLanguage: (lang: Language) => void;
  setUserName: (name: string) => void;
  setAiName: (name: string) => void;
  setVoiceType: (type: VoiceType) => void;
  setWakeWord: (word: string) => void;
  setMode: (mode: AppMode) => void;
  completeOnboarding: (data: {
    userName: string;
    aiName: string;
    voiceType: VoiceType;
    language: Language;
  }) => void;
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  resetApp: () => void;
}

const STORAGE_KEY = "pfaai_state_v1";

const defaultState: AppState = {
  isOnboarded: false,
  isLoading: true,
  language: "en",
  userName: "",
  aiName: "PFAAI",
  voiceType: "female",
  wakeWord: "Hey PFAAI",
  mode: "chat",
  messages: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    loadFromStorage();
  }, []);

  async function loadFromStorage() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setState((prev) => ({ ...prev, ...saved, isLoading: false }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }

  function persist(updates: Partial<AppState>) {
    setState((prev) => {
      const next = { ...prev, ...updates };
      const { messages, isLoading, ...toSave } = next;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
      return next;
    });
  }

  const setLanguage = (language: Language) => persist({ language });
  const setUserName = (userName: string) => persist({ userName });
  const setAiName = (aiName: string) => persist({ aiName });
  const setVoiceType = (voiceType: VoiceType) => persist({ voiceType });
  const setWakeWord = (wakeWord: string) => persist({ wakeWord });
  const setMode = (mode: AppMode) => persist({ mode });

  const completeOnboarding = (data: {
    userName: string;
    aiName: string;
    voiceType: VoiceType;
    language: Language;
  }) => {
    persist({ ...data, isOnboarded: true });
  };

  const addMessage = (msg: Message) => {
    setState((prev) => ({ ...prev, messages: [msg, ...prev.messages] }));
  };

  const clearMessages = () => {
    setState((prev) => ({ ...prev, messages: [] }));
  };

  const resetApp = async () => {
    await AsyncStorage.clear();
    setState({ ...defaultState, isLoading: false });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setLanguage,
        setUserName,
        setAiName,
        setVoiceType,
        setWakeWord,
        setMode,
        completeOnboarding,
        addMessage,
        clearMessages,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
