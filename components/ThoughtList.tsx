"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

// 定义数据的形状（TypeScript 的好处：防呆）
interface Thought {
  id: number;
  content: string;
  created_at: string;
  ai_insight?: string;
}

export default function ThoughtList() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);

  // 这个函数专门用来去云端取数据
  const fetchThoughts = async () => {
    try {
      const { data, error } = await supabase
        .from('thoughts') // 查哪张表
        .select('*')      // 查哪些字段 (* 代表所有)
        .order('created_at', { ascending: false }); // 按时间倒序（最新的在上面）

      if (error) throw error;
      
      if (data) {
        setThoughts(data);
      }
    } catch (error) {
      console.error("读取失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect: 当组件“出生”时，执行一次
  useEffect(() => {
    fetchThoughts();
    
    // 这是一个高阶技巧：订阅实时更新！
    // 当有人插入新数据，这个频道会收到通知，我们立刻刷新列表
    const channel = supabase
      .channel('realtime thoughts')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'thoughts' }, // 监听所有事件 (INSERT, UPDATE, DELETE)
        (payload) => {
          console.log('收到实时信号:', payload);

          if (payload.eventType === 'INSERT') {
            // 如果是新数据，加到最前面
            setThoughts((prev) => [payload.new as Thought, ...prev]);
          } 
          else if (payload.eventType === 'UPDATE') {
            // 🚨 如果是更新 (AI 回复了)，我们在列表里找到它并更新它
            setThoughts((prev) => 
              prev.map((item) => 
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            );
          }
        }
      )
      .subscribe();

    // 当组件“销毁”时，取消订阅，防止内存泄漏
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className="text-gray-500 animate-pulse">正在读取大脑皮层数据...</div>;

  return (
    <div className="w-full max-w-2xl space-y-4 mt-8">
      {thoughts.map((item, index) => (
       <motion.div
       key={item.id}
       // ... 保持原来的动画属性
       className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors space-y-3" // <--- 加上 space-y-3
     >
       <p className="text-gray-200 font-mono text-lg">{item.content}</p>
       
       {/* 🔮 AI 回复区域 - 如果有 ai_insight 才显示 */}
       {item.ai_insight && (
         <motion.div 
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: "auto" }}
           className="bg-purple-900/20 border-l-2 border-purple-500 pl-3 py-1 text-purple-200 text-sm font-sans italic"
         >
           AI: {item.ai_insight}
         </motion.div>
       )}
     
       <p className="text-xs text-gray-600">
         {new Date(item.created_at).toLocaleString()}
       </p>
     </motion.div>
      ))}
    </div>
  );
}