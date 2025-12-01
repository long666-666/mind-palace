import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// 1. 初始化 AI 客户端
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

// 2. 初始化 Supabase (为了在服务器端更新数据)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { thoughtId, content } = await req.json();

    console.log("收到分析请求:", content);

    // 3. 呼叫 AI 大脑
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", // 如果你用别的厂商，改这里的模型名字，比如 "gpt-4o-mini"
      messages: [
        { 
          role: "system", 
          content: "你是一个赛博朋克风格的数字助手。请用简短、犀利、略带哲理或幽默的语气点评用户的想法。字数控制在50字以内。" 
        },
        { role: "user", content: content },
      ],
      temperature: 0.7,
    });

    const insight = completion.choices[0].message.content;

    // 4. 把 AI 的想法存回数据库
    const { error } = await supabase
      .from("thoughts")
      .update({ ai_insight: insight })
      .eq("id", thoughtId);

    if (error) throw error;

    return NextResponse.json({ success: true, insight });

  } catch (error) {
    console.error("AI 处理失败:", error);
    return NextResponse.json({ error: "Brain failure" }, { status: 500 });
  }
}