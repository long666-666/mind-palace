import ThoughtInput from "@/components/ThoughtInput";
import ThoughtList from "@/components/ThoughtList"; // <--- 1. 引入新组件

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 bg-black p-4 overflow-hidden relative">
      {/* 注意：我把 justify-center 改成了 justify-start pt-24，让内容靠上一点，不然列表长了很难看 */}
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="z-10 flex flex-col items-center gap-8 w-full">
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 tracking-tighter">
            Mind_Palace_
          </h1>
          <p className="text-gray-500 font-mono text-sm tracking-widest">
            [System Online] Waiting for neural link...
          </p>
        </div>

        <ThoughtInput />
        
        {/* 2. 把列表放在这里 */}
        <ThoughtList />
        
      </div>
    </main>
  );
}