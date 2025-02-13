import Live2DWrapper from "@/components/live2d/live-2d-wrapper";
import { InitTTSModel } from "@/components/voice/init-tts";
import { ChatClient } from "@/components/chat/chat-client";
import { createId } from "@paralleldrive/cuid2";

export default function Home() {
  const id = createId();
  return (
        <div>
          <InitTTSModel />
          <div className="absolute -translate-x-1/2 left-1/2 bottom-2 flex flex-col gap-2 select-none">
            <ChatClient initialMessages={[]} id={id} isMobile={false} />
          </div>
        </div>
  );
}
