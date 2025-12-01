"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react"; // 引入 Loader2 图标做加载状态
import { supabase } from "@/lib/supabase"; // 引入刚才写的传送门

export default function ThoughtInput() {
  const [thought, setThought] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false); // 新增：发送状态

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim() || isSending) return;
    
    setIsSending(true);

    try {
      // 1. 先存入 Supabase (这一步你之前就有)
      const { data, error } = await supabase
        .from('thoughts')
        .insert([{ content: thought }])
        .select() // <--- 关键修改：我们需要它返回刚刚生成的 ID
        .single();

      if (error) throw error;

      console.log("发射成功, ID:", data.id);
      setThought(""); 

      // 2. 🚀 新增：立刻呼叫我们的 API 路由去分析
      // 我们不需要等它分析完，让它在后台跑就行（Fire and Forget）
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          thoughtId: data.id, 
          content: data.content 
        }),
      });

    } catch (err) {
      console.error("错误:", err);
      alert("发送失败");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="w-full max-w-2xl relative"
    >
      <motion.div
        animate={{
          opacity: isFocused ? 0.6 : 0.2,
          scale: isFocused ? 1.02 : 1,
        }}
        className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-20 transition duration-500"
      />

      <div className="relative flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl">
        <Sparkles className={`w-5 h-5 ml-3 transition-colors duration-300 ${isFocused ? 'text-purple-400' : 'text-gray-500'}`} />
        
        <input
          type="text"
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isSending} // 发送时禁止输入
          placeholder="What's on your mind? (捕捉灵感...)"
          className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 outline-none font-mono text-sm sm:text-base disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!thought.trim() || isSending}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" /> // 发送时显示转圈圈
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.form>
  );
}