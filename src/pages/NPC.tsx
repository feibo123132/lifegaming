import { useState, useEffect, useRef } from 'react';
import { Send, Zap, Crown, Gamepad2 } from 'lucide-react';
import { cn } from '../utils/helpers';

interface Message {
  id: string;
  role: 'user' | 'npc';
  content: string;
  timestamp: Date;
}

type NPCState = 'working' | 'resting' | 'roast' | 'encourage';

export function NPC() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'npc',
      content: '早安！今天的任务已经准备好了，准备好了吗？🦞',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [npcState, setNpcState] = useState<NPCState>('working');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate NPC response
    setTimeout(() => {
      const responses = [
        '不错的想法！继续保持这个状态 💪',
        '哈哈，我就喜欢你这种态度！',
        '嗯...让我想想...其实你可以做得更好',
        '今天完成的任务比昨天多，进步明显！',
        '别偷懒了，快去完成任务吧！😏',
        '你刷短视频的速度比做视频快十倍吧？',
      ];
      
      const npcMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'npc',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, npcMessage]);
    }, 1000);
  };

  const stateConfig = {
    working: {
      emoji: '💻',
      title: '工作中',
      desc: '虾教头正在处理数据...',
      bgColor: 'bg-pop-blue',
      iconColor: 'text-pop-blue',
    },
    resting: {
      emoji: '😴',
      title: '休息中',
      desc: '劳逸结合才能走得更远',
      bgColor: 'bg-pop-green',
      iconColor: 'text-pop-green',
    },
    roast: {
      emoji: '🔥',
      title: '吐槽模式',
      desc: '你刷短视频的速度比做视频快十倍吧？',
      bgColor: 'bg-pop-red',
      iconColor: 'text-pop-red',
    },
    encourage: {
      emoji: '✨',
      title: '鼓励模式',
      desc: '太棒了！今天的你闪闪发光！',
      bgColor: 'bg-pop-yellow',
      iconColor: 'text-pop-yellow',
    },
  };

  const currentState = stateConfig[npcState];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="pop-title flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-pop-red" />
            虾教头
          </h2>
          <p className="text-pop-black/70 font-bold mt-1">你的专属游戏NPC，嘴硬心软</p>
        </div>
        <div className="pop-tag bg-pop-yellow">
          <Crown className="w-4 h-4 mr-1 inline" />
          Lv.5 NPC
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-full">
        {/* NPC Status Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className={cn("pop-card !p-6 text-center", currentState.bgColor, "!text-white")}>
            {/* NPC Avatar */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="absolute inset-0 bg-white rounded-pop border-4 border-pop-black animate-pulse-slow" />
              <div className="relative w-full h-full bg-white rounded-pop border-4 border-pop-black flex items-center justify-center text-6xl shadow-pop">
                🦞
              </div>
              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-pop border-4 border-pop-black flex items-center justify-center text-2xl shadow-pop-sm">
                {currentState.emoji}
              </div>
            </div>

            <h3 className="font-black text-2xl mb-1">{currentState.title}</h3>
            <p className="font-bold text-white/90">{currentState.desc}</p>

            {/* State Switcher */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {(['working', 'resting', 'roast', 'encourage'] as NPCState[]).map((state) => (
                <button
                  key={state}
                  onClick={() => setNpcState(state)}
                  className={cn(
                    "pop-card !p-3 text-left !shadow-pop-sm",
                    npcState === state
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/80"
                  )}
                >
                  <span className="text-xl mr-2">{stateConfig[state].emoji}</span>
                  <span className="font-bold text-pop-black text-sm">{stateConfig[state].title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pop-card">
            <h3 className="font-black text-lg text-pop-black mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-pop-yellow" />
              快捷对话
            </h3>
            <div className="space-y-2">
              {[
                '今天任务完成了！',
                '我需要一些建议',
                '我今天感觉很累',
                '给我一点鼓励',
              ].map((text) => (
                <button
                  key={text}
                  onClick={() => {
                    setInput(text);
                    handleSend();
                  }}
                  className="w-full text-left p-3 rounded-pop border-3 border-pop-black/20 hover:border-pop-black hover:bg-pop-yellow/20 font-bold text-pop-black transition-all"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 pop-card !p-0 flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-pop border-4 border-pop-black flex items-center justify-center flex-shrink-0 shadow-pop-sm",
                  message.role === 'user' ? "bg-pop-yellow" : "bg-pop-blue"
                )}>
                  <span className="text-2xl">
                    {message.role === 'user' ? '👤' : '🦞'}
                  </span>
                </div>
                <div className={cn(
                  "max-w-[70%] rounded-pop px-5 py-3 border-4",
                  message.role === 'user'
                    ? "bg-pop-yellow border-pop-black text-pop-black"
                    : "bg-white border-pop-black text-pop-black"
                )}>
                  <p className="font-bold">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1 font-bold",
                    message.role === 'user' ? "text-pop-black/50" : "text-pop-black/40"
                  )}>
                    {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t-4 border-pop-black">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="和虾教头聊聊天..."
                className="pop-input flex-1"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={cn(
                  "pop-btn !px-5 !py-3",
                  !input.trim() && "opacity-50 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-pop-black/50 mt-2 text-center font-bold">
              按 Enter 发送消息
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
