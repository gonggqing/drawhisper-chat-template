"use client";

import { ChatList } from "./chat-list"
import ChatInput from "./chat-input";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { Attachment, ChatRequestOptions, generateId } from "ai";
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import useChatStore, { ChatSession } from "@/lib/store/chat-store";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, Play } from "@phosphor-icons/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import AvatarWrapper from "@/components/avatar-wrapper";

import useCharacter from "@/lib/store/character-store";
import { cn } from "@/lib/utils";

import { useContext } from "react";
import { Live2DContext } from "@/context/live2d/live2d-context";

import { FishTTS } from "@/lib/tts/fish.ai";
import { useVoice } from "@/context/voice/voice-context";

import { ChatBubble, ChatBubbleMessage, ChatBubbleActionWrapper } from "../ui/chat/chat-bubble";

export interface ChatProps {
  id: string;
  initialMessages: Message[] | [];
  isMobile?: boolean;
}

interface AudioMessage extends Message {
  audio?: string;
}

interface Character {
    id: string;
    name: string;
    avatar: string | null;
    initial_message: string | null;
    description: string | null;
    personality: string | null;
    memory: string | null;
}

export function ChatClient({ initialMessages, id, isMobile }: ChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
  } = useChat({
    streamProtocol: 'data',
    api: '/api/chat',
    id,
    initialMessages,
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onFinish: (message) => {
      const savedMessages = getMessagesById(id);
      saveMessages(id, [...savedMessages, message]);
      setLoadingSubmit(false);
      router.replace(`/c/${id}`);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      router.replace("/");
      console.error(error.message);
      console.error(error.cause);
    },
  });
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const base64Images = useChatStore((state) => state.base64Images);
  const setBase64Images = useChatStore((state) => state.setBase64Images);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const saveMessages = useChatStore((state) => state.saveMessages);
  const getMessagesById = useChatStore((state) => state.getMessagesById);
  const getChatById = useChatStore((state) => state.getChatById);
  const router = useRouter();

  const currentCharacter = useCharacter((state) => state.currentCharacter);
  const getCharacterById = useCharacter((state) => state.getCharacterById);

  const [character, setCharacter] = useState<Character | null>(null);
  const [chat, setChat] = useState<ChatSession | null>(null);

  // audio
  const [audio, setAudio] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [audioList, setAudioList] = useState<Record<string, AudioMessage>>({});

  const { controller } = useContext(Live2DContext);
  const { voice } = useVoice();

  useEffect(() => {
    const currentChat = getChatById(id);
    console.log(`[ChatInfo] currentChat:${currentChat}`);
    if (currentChat) {
      setChat(currentChat);
      const c = getCharacterById(currentChat.characterId);
      if (c) {
        setCharacter(c);
      }
      console.log(`[ChatInfo] character: :${currentChat.characterId} ${c}`);
      console.log(`[ChatInfo] Current Character:${currentCharacter}`);
    }
  }, [id]);

  const timbre = useCallback(async () => {
      if (!voice?.audio) return null;
      
      try {
          // Fetch the actual file and get blob directly
          const response = await fetch(voice.audio);
          if (!response.ok) throw new Error('Failed to fetch audio file');
          
          // Get blob and create File object
          const blob = await response.blob();
          return new File([blob], `${voice.speaker_id}.wav`, { type: 'audio/wav' });
      } catch (error) {
          console.error('Failed to load audio file:', error);
          return null;
      }
  }, [voice?.speaker_id]);

  const tts = new FishTTS({
      apiKey: process.env.FISH_API_KEY,
      baseUrl: "http://127.0.0.1:8080/v1/tts",
      streaming: false
  });

  const play = useCallback(async (message: Message) => {
      if (!voice?.speaker_id) {
        toast.error("No voice selected");
        return
      };
      if (!audioList[message.id]?.audio) {      
          // Get the reference audio file as blob
          const referenceFile = await timbre();
          if (!referenceFile) {
              toast.error('Failed to get reference audio file');
              return 
          }

          const content = message.content.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim()
          if (content.length === 0) {
            toast.error("No content to generate speech");
            return;
          }
          console.log(`voice:${voice?.speaker_id}`);
          const response = await tts.generateSpeech({
              text: content,
              referenceAudio: [referenceFile],
              referenceText: [voice?.reference_text || ""],
              options: {
                  format: "wav",
                  normalize: true,
                  chunk_length: 256,
                  latency: "balanced",
                  channels: 2,
                  top_p: 0.5,
                  temperature: 0.7,
                  repetition_penalty: 1.2
              }
          });
          if (response.status === "success" && response.data.audio) {
              const { base64, blob } = response.data.audio;
              setAudio(base64);
              controller?.speak(base64);
              setAudioList((prev)=>({
                ...prev,
                [message.id]: {
                  ...message,
                  audio: base64
                }
              }))
              console.log('generate audio finished')
          }
      } else {
          console.log('generated audio cached')
          controller?.speak(audioList[message.id].audio!);
      }
  }, [voice?.speaker_id, audioList]);

  const handlePlay = (message: Message) => {
    setGenerating(true);
    try {
      play(message);
    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      setGenerating(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.history.replaceState({}, "", `/c/${id}`);

    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
    };

    setLoadingSubmit(true);

    const attachments: Attachment[] = base64Images
      ? base64Images.map((image) => ({
          contentType: "image/base64",
          url: image,
        }))
      : [];

    const requestOptions: ChatRequestOptions = {
      body: {
        selectedModel: selectedModel,
        character: character ? character : currentCharacter,
      },
      ...(base64Images && {
        data: {
          images: base64Images,
        },
      }),
      experimental_attachments: attachments,
    };

    handleSubmit(e, requestOptions);
    saveMessages(id, [...messages, userMessage]);
    setBase64Images(null);
  };

  const removeLatestMessage = () => {
    const updatedMessages = messages.slice(0, -1);
    setMessages(updatedMessages);
    saveMessages(id, updatedMessages);
    return updatedMessages;
  };

  const handleStop = () => {
    stop();
    saveMessages(id, [...messages]);
    setLoadingSubmit(false);
  };

  const initial_message = {
    id: "initial_message",
    role: "assistant",
    content: currentCharacter?.initial_message || "How can I help you today?"
  } satisfies Message;

  const renderActionButtons = () => (
    (
      <div className="pt-2 flex gap-2 items-center text-muted-foreground">
          <Button
            onClick={() => handlePlay(initial_message)}
            variant="ghost"
            size="icon"
            disabled={generating}
            className={cn(
              "h-4 w-4 rounded-full hover:bg-transparent hover:text-foreground",
            )}
          >
            <Play weight="fill" className={cn(
              "w-3.5 h-3.5 transition-all",
              generating && "animate-pulse"
            )} />
          </Button>
      </div>
    )
  );

  return (
    <div className="flex flex-col min-w-[672px] h-full">

      {messages.length === 0 ? (
        <div className="flex flex-col h-full w-full items-center gap-4 justify-center">
            <ChatBubble variant={"received"}>
              <AvatarWrapper
                  src={currentCharacter?.avatar || "/image/radien.jpg"}
                  fallback={currentCharacter?.name || "AI"}
              />
              <ChatBubbleMessage className={cn(
                "bg-[color:#ffc2d1] w-full",
              )}>
                <Markdown remarkPlugins={[remarkGfm]} className="flex flex-row items-center justify-between">
                  {initial_message.content}
                </Markdown>
                {renderActionButtons()}
              </ChatBubbleMessage>
            </ChatBubble>
            <ChatInput  
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={onSubmit}
                isLoading={isLoading}
                stop={handleStop}
                setInput={setInput}
            />
        </div>
      ) : (
        <div className="flex flex-col w-full gap-4 space-y-2">
          <ChatList
            chatId={id}
            messages={messages}
            isLoading={isLoading}
            loadingSubmit={loadingSubmit}
            play={play}
            reload={async () => {
              removeLatestMessage();

              const requestOptions: ChatRequestOptions = {
                body: {
                  selectedModel: selectedModel,
                },
              };

              setLoadingSubmit(true);
              return reload(requestOptions);
            }}
          />
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={onSubmit}
            isLoading={isLoading}
            stop={handleStop}
            setInput={setInput}
          />
        </div>
      )}
    </div>
  );
}
