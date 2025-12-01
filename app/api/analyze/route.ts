import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // 🟢 修复动作：把初始化全部搬到了函数内部
  // 这样构建服务器就不会在没有 Key 的情况下尝试启动 AI 了

  // 1. 初始化 AI 客户端 (注意：这里我帮你改成了 DEEPSEEK_API_KEY，跟你 Vercel 填的一致)
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY, 
    baseURL: "https://api.deepseek.com", // 直接写死 DeepSeek 地址，省得你再去配置变量
  });

  // 2. 初始化 Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { thoughtId, content } = await req.json();

    console.log("收到分析请求:", content);

    // 3. 呼叫 AI 大脑
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", 
      messages: [
        { 
          role: "system", 
          content: "你是一个赛博朋克风格的数字助手。请用简短、犀利、略带哲理或幽默的语气点评用户的想法。字数控制在50字以内。" 
        },
        { role: "user", content: content },
      ],
      temperature: 0.7,
    });

    const insight = completion.choices[0]?.message?.content || "系统繁忙，思维短路中...";

    // 4. 把 AI 的想法存回数据库
    const { error } = await supabase
      .from("thoughts")
      .update({ ai_insight: insight })
      .eq("id", thoughtId);

    if (error) throw error;

    return NextResponse.json({ success: true, insight });

  } catch (error) {
    console.error("AI 处理失败:", error);
    // 这里改成返回 200 但带错误信息，防止前端崩掉，或者保持 500
    return NextResponse.json({ error: "Brain failure: " + String(error) }, { status: 500 });
  }
}