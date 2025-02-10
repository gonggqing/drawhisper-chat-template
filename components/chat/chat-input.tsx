"use client";

import React, { useEffect } from "react";
import { ChatProps } from "./chat-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Stop,
  PaperPlaneRight,
} from "@phosphor-icons/react";
import { SendHorizonal } from "lucide-react";
import useChatStore from "@/lib/store/chat-store";
import Image from "next/image";
import { ChatRequestOptions, Message } from "ai";
import { Textarea } from "@/components/ui/textarea";
import MultiImagePicker from "@/components/image-picker";

interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  setInput?: React.Dispatch<React.SetStateAction<string>>;
  input: string;
}

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  setInput,
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const base64Images = useChatStore((state) => state.base64Images);
  const setBase64Images = useChatStore((state) => state.setBase64Images);
  const selectedModel = useChatStore((state) => state.selectedModel);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      console.log("Input focused");
    }
  }, [inputRef]);

  return (
    <div className="px-4 pb-7 flex justify-between w-full items-center relative ">
      <AnimatePresence initial={false}>
        <form
          onSubmit={handleSubmit}
          className="w-full items-center flex flex-col rounded-lg border-none bg-accent/80"
        >
          <Textarea
            value={input}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name="message"
            placeholder={"Enter your prompt here"}
            className="flex-1 bg-accent/80 text-sm w-[572px] border-none shadow-none resize-none focus-visible:ring-accent font-mono"
            rows={2}
          />

          <div className="flex items-center p-2 gap-2 w-full">
            {isLoading ? (
              // Loading state
                <div className="flex flex-row w-full justify-between">
                  <MultiImagePicker onImagesPick={setBase64Images} disabled />
                  <Button
                    className="shrink-0 rounded-full w-9 h-9"
                    variant="ghost"
                    size="icon"
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      stop();
                    }}
                  >
                    <Stop weight="fill" size={24} />
                  </Button>
                </div>
            ) : (
              // Default state
                <div className="flex flex-row w-full justify-between">
                  <MultiImagePicker disabled={isLoading} onImagesPick={setBase64Images}  />
                  <Button
                    className="h-9 w-9 rounded-full bg-[color:#e2eafc] hover:bg-[color:#d7e3fc] text-foreground flex-shrink-0"
                    variant="ghost"
                    size="icon"
                    type="submit"
                    disabled={
                      isLoading ||
                      !input.trim()
                    }
                  >
                    <PaperPlaneRight weight="fill" size={24} />
                  </Button>
                </div>
            )}
          </div>
          {base64Images && (
            <div className="w-full flex px-2 pb-2 gap-2 ">
              {base64Images.map((image, index) => {
                return (
                  <div
                    key={index}
                    className="relative group bg-muted-foreground/20 flex w-fit flex-col gap-2 p-1 border-t border-x rounded-md"
                  >
                    <div className="flex text-sm">
                      <Image
                        src={image}
                        width={20}
                        height={20}
                        className="h-auto rounded-md w-auto max-w-[100px] max-h-[100px] cursor-pointer"
                        alt={""}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const updatedImages = (prevImages: string[]) =>
                        prevImages.filter((_, i) => i !== index);
                        setBase64Images(updatedImages(base64Images));
                      }}
                      size="icon"
                      className="bg-accent opacity-0 group-hover:opacity-100 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <X weight="bold" size={24} color="pink" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </form>
      </AnimatePresence>
    </div>
  );
}
