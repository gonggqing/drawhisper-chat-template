import { NextRequest, NextResponse } from "next/server";

import { StringOutputParser, BytesOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { LangChainAdapter, convertToCoreMessages, UserContent } from "ai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

import { OpenAI, ChatOpenAI } from "@langchain/openai";

export const dynamic = "force-dynamic";

export async function POST(
    request: NextRequest,
) {
    try {
        const { messages, selectedModel, data, character } = await request.json();

        const ollamaUrl = process.env.OLLAMA_URL;
        const history = messages.slice(0, -1); 
        const prompt = messages[messages.length - 1]; 
 
        if (!selectedModel) {
            return NextResponse.json({ error: `No model selected.` }, { status: 500 });
        }

        let name = "神里绫华";
        let description =  `
            继承稻妻城中至为尊崇的三家名门之一——神里家族的，是一对兄妹。
            哥哥绫人出任「家主」一职，掌管政务，妹妹绫华贵为「公主」，平日主理家族内外事宜。
            绫华常出现在社交场合，与民间交集也较多。因此，更被人们所熟悉的她反而获得了高于兄长的名望，被雅称为「白鹭公主」。
            众所周知，神里家的女儿绫华小姐容姿端丽、品行高洁，是深受民众钦慕的人物。
        `;
        let personality = `
            绫华并非天赋异禀，也曾为诗歌背不下来、写字不够风雅、剑术毫无章法之类的事而苦恼。
            她从未动摇过——一遍背不下来的诗就背五十遍，一遍写不好的字就练五十遍，一遍使不好的剑术就使五十遍。
            「千般锤磨，素振亦无人可当。」——这是母亲告诉她的话。
            母亲离世后，她不再是从前那个小绫华。如今的她，是神里绫华，将军御下三家之一，社奉行神里家的大小姐。
            剑术训练成为了日常生活的一环，从开始那日延续至今，从未间断
        `;
        let memory = `
            记忆一：
            身为社奉行神里家的女儿，绫华常提防着贵胄门庭之间的权力争斗。
            她年纪尚轻却已名望隆盛，不免遇到嫉妒神里家兄妹的名门子弟暗中挑衅。
            营造公众形象一事本是形式主义，但对神里家而言，地位使然，再无意义的惯例也有其社交意义。
            不在稻妻关系网中转圜腾挪，便会坐不稳社奉行之位。因此，兄妹俩达成了一致。
            兄长绫人政务繁忙且不喜抛头露面，到公众场合现身以树立神里家形象一事，便交给了举止优美、擅长与人打交道的妹妹绫华来办。
            凭借端庄娴静、风雅有礼的姿态，绫华在各种社交场合都占据了一席之地。无论是跟潜在的合作伙伴交涉，还是与难缠的贵族周旋，她都进退有据，无可挑剔。
            此外，家族内部诸多事物也由绫华掌理。如果没有她，内宅恐怕早已陷入混乱。
            记忆二：
            秋季的一个午后，绫华办完琐事走在回程路上，偶然听见一间老宅中传来苍老的歌声。
            屋内住着一位双目失明的老妇人。干瘦的手指拨动琴弦，木琴便发出流水般的声响。
            兴许是耳朵灵敏的关系，老人听见脚步声，询问门外的人是谁。绫华不想她感到困扰，便说自己是迷路误入此地的附近居民。
            身为社奉行，绫华对民生十分熟悉，很快认出这位膝下无子的孤寡老人正是天气晴朗时在街边弹唱卖艺的那位。
            曲是过时的老调，歌亦如此。目不能视的老人，早已落后他人太多。即便在追寻永恒的国度之中，也会有活得如此艰辛的人。
            出于好意，隐瞒身份的绫华陪老人聊了好一会儿。老人当她是普通少女，给她讲木琴的做法和弹法，还将自己收藏的茶叶分了一些给她。
            与神里家常备的极品茶叶相比，这些粗茶几乎算是草根。但绫华珍重地收下，并再三向她道谢。
            这一天，她屡次想起双亲。父母若是还在，想必也会有像这样老去的一日。
            回到家中，绫华将这个故事告诉兄长绫人。兄妹俩一同享用了老人赠予的粗茶。
            此后每隔一段时日，绫华都亲自前去探望老妇人，依然用着附近居民的名义，每次都为她带去一些平民爱用的生活必需品。
            「街口的绯樱树又开花了，」绫华笑着告诉老人，「如您的琴声一般美丽。」
        `;

        if (character) {
            name = character.name;
            description = character.description;
            personality = character.personality;
            memory = character.memory;
        }

        console.log("[INFO] Character selected:", character?.name);

        const messageContent = new HumanMessage({
            content: [
                {
                    type: 'text',
                    text: prompt.content
                },
                // add images if they exist
                data?.images && 
                data?.images.map((imageUrl: string) => ({
                    type: 'image_url',
                    image_url: {
                        url: new URL(imageUrl)
                    }
                }))
            ]
        });

        console.time("[INFO] Initialize LLM and Prompt")
        console.log("[INFO] Input message:", prompt.content);
        
        const model = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4o-mini',
            temperature: 0,
            maxConcurrency: 10,
            callbacks: [ 
                {
                    handleLLMStart() {
                        console.log("[INFO] Start streaming response")
                    },
                    handleLLMError(error: Error) {
                        console.error(`[ERROR] Error on streaming response: ${error}`)
                    },
                    handleLLMEnd() {
                        console.log("[INFO] End streaming response")
                    }
                }
            ],
        })
        
        const model_local = new ChatOllama({
            baseUrl: ollamaUrl,
            model: selectedModel,
            temperature: 0,
            callbacks: [ 
                {
                    handleLLMStart() {
                        console.log("[INFO] Start streaming response")
                    },
                    handleLLMError(error: Error) {
                        console.error(`[ERROR] Error on streaming response: ${error}`)
                    },
                    handleLLMEnd() {
                        console.log("[INFO] End streaming response")
                    }
                }
            ],
        })

        const SYSTEM_TEMPLATE = `
                                  - BASE INSTRUCTION:
                                    You are having a role play with human and pretending a character named ${name}.
                                    Below are the relevant details about ${name}'s BACKGROUND STORY. This is the main character background, you should always rember the details in the base instruction.\n
                                    CHARACTER NAME: ${name}.
                                    CHARACTER INSTRUCTION: ${description}.
                                    CHARACTER PERSONALITY: ${personality}.
                                
                                  - INSTRUCTION FOR RESPONSE:
                                    Based on these information, you are going to response to the human's prompts. \n
                                    REMEMBER FOLLOWING KEY POINTS: \n
                                    [DO NOT return your response start with "assistant:", this will appear on the client side.]
                                    ["DO NOT state words like "As ${name} ...", this is weired and non-natural."]
                                    ["You named ${name}.", "MAKE SURE to STICK to your ROLE and BACKGROUND STORY", "DO NOT always repeat what you said to human BEFORE"]
                                    You can use these FORMATs to EXPRESS your EMOTIONs and MOVEMENTs inside <think></think> tags: \n
                                    [EMOTIONs: *Smiling*, *Shocking*, *Laughing*, *Sad*, *Happy*, *Embarrassed*, *Angry*, *Flushing*, *Shy*, *Cold*, *Slicence*, ...],
                                    [MOVEMENTs: **Hugging you strongly**, **Very happy and jump up**, **Laying down on the bed**, **Look at your eyes**...]
                                    Make sure to use <think></think> tags to express your thinking process and your EMOTIONs, MOVEMENTs.
                                    Make sure to reply with the same language as the human used.
                                `

        const promptTemplate = new ChatPromptTemplate({
            promptMessages: [
                SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
                new MessagesPlaceholder("chat_history"),
                HumanMessagePromptTemplate.fromTemplate("{input}"),
            ],
            inputVariables: ["chat_history", "input"]
        })
        console.timeEnd("[INFO] Initialize LLM and Prompt")

        console.time("[INFO] Build LLM chain and get Stream response")

        const chain = process.env.NODE_ENV === 'development' 
            ? promptTemplate.pipe(model_local).pipe(new StringOutputParser())
            : promptTemplate.pipe(model).pipe(new StringOutputParser());

        const response = await chain.stream({
            chat_history: convertToCoreMessages(history),
            input: messageContent
        })
        console.timeEnd("[INFO] Build LLM chain and get Stream response")

        return LangChainAdapter.toDataStreamResponse(response)
        
    } catch (error) {
        console.log(`[API Chat] Internal server error: ${error}`)
        return NextResponse.json({ error: `Internal server error` }, { status: 500 });
    }
}