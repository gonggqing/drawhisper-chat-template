import React, { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "ai/react";
import { ChatRequestOptions } from "ai";
import { Check, Copy, Play, ArrowsClockwise } from "@phosphor-icons/react";
import Image from "next/image";
import {
  ChatBubble,
  ChatBubbleMessage,
} from "../ui/chat/chat-bubble";
import { Button } from "../ui/button";
import { ThinkingBubble } from "../ui/chat/thinking-bubble";
import CodeDisplayBlock from "../code-block";
import Avatar from "@/components/avatar-wrapper"
import useUser from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import { WaterBubble } from "../ui/water-bubble";
import useCharacter, { Character } from "@/lib/store/character-store";

export type ChatMessageProps = {
  character: Character | null;
  message: Message;
  isLast: boolean;
  isLoading: boolean | undefined;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  play: (message: Message) => void;
};

const MOTION_CONFIG = {
  initial: { opacity: 0, scale: 1, y: 20, x: 0 },
  animate: { opacity: 1, scale: 1, y: 0, x: 0 },
  exit: { opacity: 0, scale: 1, y: 20, x: 0 },
  transition: {
    opacity: { duration: 0.1 },
    layout: {
      type: "spring",
      bounce: 0.3,
      duration: 0.2,
    },
  },
};

function ChatMessage({ character, message, isLast, isLoading, reload, play }: ChatMessageProps) {
  
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const avatar = useUser((state) => state.getUser()?.avatar);
  // Extract "think" content from Deepseek R1 models and clean message (rest) content
  const { thinkContent, cleanContent } = useMemo(() => {
    const getThinkContent = (content: string) => {
      const match = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
      return match ? match[1].trim() : null;
    };

    return {
      thinkContent: message.role === "assistant" ? getThinkContent(message.content) : null,
      cleanContent: message.content.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim(),
    };
  }, [message.content, message.role]);

  const contentParts = useMemo(() => cleanContent.split("```"), [cleanContent]);

  const handlePlay = () => {
    setGenerating(true);
    try {
      play(message);
    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const renderAttachments = () => (
    <div className="flex gap-2">
      {message.experimental_attachments
        ?.filter((attachment) => attachment.contentType?.startsWith("image/"))
        .map((attachment, index) => (
          <Image
            key={`${message.id}-${index}`}
            src={attachment.url}
            width={200}
            height={200}
            alt="attached image"
            className="rounded-md object-contain"
          />
        ))}
    </div>
  );

  const renderThinkingProcess = () => (
    thinkContent && message.role === "assistant" && (
      <div className="mb-1 text-sm relative max-h-[192px] overflow-y-auto">
        <WaterBubble className="absolute top-1 left-1" variant="finished" />
        <div className="mt-1 text-muted-foreground pl-8 " >
          <Markdown remarkPlugins={[remarkGfm]}>{thinkContent}</Markdown>
        </div>
      </div>
    )
  );

  const renderContent = () => (
    contentParts.map((part, index) => (
      index % 2 === 0 ? (
        <Markdown key={index} remarkPlugins={[remarkGfm]}>{part}</Markdown>
      ) : (
        <pre className="whitespace-pre-wrap" key={index}>
          <CodeDisplayBlock code={part} />
        </pre>
      )
    ))
  );

  const renderActionButtons = () => (
    message.role === "assistant" && (
      <div className="pt-2 flex gap-2 items-center text-muted-foreground">
        {!isLoading && (
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full hover:bg-transparent hover:text-foreground"
          >
            {isCopied ? (
              <Check weight="bold" className="w-3.5 h-3.5 transition-all" />
            ) : (
              <Copy weight="fill" className="w-3.5 h-3.5 transition-all" />
            )}
          </Button>
        )}
        {!isLoading && (
          <Button
            onClick={handlePlay}
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
        )}
        {!isLoading && isLast && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 hover:bg-transparent hover:text-foreground"
            onClick={() => reload()}
          >
            <ArrowsClockwise weight="bold" className="w-3.5 h-3.5 scale-100 transition-all" />
          </Button>
        )}
      </div>
    )
  );

  return (
    <motion.div {...MOTION_CONFIG} className="flex flex-col gap-2 whitespace-pre-wrap">
      {message.role === "assistant" && thinkContent && (
        <ThinkingBubble variant="received" className="ml-12 opacity-95 backdrop-blur-sm ">
          {renderThinkingProcess()}
        </ThinkingBubble>
      )}
      <ChatBubble variant={message.role === "user" ? "sent" : "received"}>
        <Avatar 
          src={message.role === "user" ? avatar || "/image/radien.jpg" : character?.avatar || "/image/radien.jpg"} 
          fallback={message.role === "user" ? "U" : character?.name || "AI"} 
        />
        <ChatBubbleMessage className={cn(
          message.role === "assistant" && "bg-[color:#ffc2d1]",
          message.role === "user" && "bg-[color:#bde0fe]",
        )}>
          {renderAttachments()}
          {renderContent()}
          {renderActionButtons()}
        </ChatBubbleMessage>
      </ChatBubble>
    </motion.div>
  );
}

export default memo(ChatMessage, (prevProps, nextProps) => {
  if (nextProps.isLast) return false;
  return prevProps.isLast === nextProps.isLast && prevProps.message === nextProps.message;
});