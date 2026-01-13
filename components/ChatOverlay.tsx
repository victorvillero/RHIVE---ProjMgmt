import React, { useState } from 'react';
import { MessageCircle, Users, Phone, Video, Search, X, Send, Paperclip, Smile } from 'lucide-react';
import { User, ChatSession } from '../types';

interface ChatOverlayProps {
    currentUser: User;
    sessions: ChatSession[];
    onSendMessage: (sessionId: string, text: string) => void;
    onStartVideoCall: () => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ currentUser, sessions, onSendMessage, onStartVideoCall }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');

    const activeSession = sessions.find(s => s.id === activeSessionId);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = () => {
        if (!inputText.trim() || !activeSessionId) return;
        onSendMessage(activeSessionId, inputText);
        setInputText('');
    };

    return (
        <>
            {/* The Main Chat Window */}
            {isOpen && (
                <div className="fixed bottom-14 right-6 w-[350px] md:w-[800px] h-[500px] bg-slate-900 shadow-2xl rounded-2xl border border-slate-700 z-40 flex overflow-hidden font-sans ring-1 ring-black/50">
                    {/* Sidebar List */}
                    <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-900">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-100">Messages</h3>
                            <button className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded"><Search size={16}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {sessions.map(session => (
                                <div 
                                    key={session.id}
                                    onClick={() => setActiveSessionId(session.id)}
                                    className={`p-4 flex items-center cursor-pointer hover:bg-slate-800/50 transition-colors ${activeSessionId === session.id ? 'bg-slate-800 border-l-2 border-teal-500' : 'border-l-2 border-transparent'}`}
                                >
                                    <div className="relative">
                                        {session.type === 'group' ? (
                                            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                                <Users size={18} />
                                            </div>
                                        ) : (
                                            <img src={`https://picsum.photos/40/40?random=${session.id}`} className="w-10 h-10 rounded-full border border-slate-700" alt="avatar" />
                                        )}
                                        {session.unread > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                {session.unread}
                                            </span>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="text-sm font-medium text-slate-200 truncate">{session.name}</span>
                                            <span className="text-[10px] text-slate-500">10:42 AM</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{session.messages[session.messages.length - 1]?.text || 'No messages'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Chat Area */}
                    <div className="flex-1 flex flex-col bg-slate-950/50 relative">
                        {/* Chat Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

                        {activeSession ? (
                            <>
                                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/90 backdrop-blur-sm z-10">
                                    <div className="flex items-center space-x-3">
                                        <div>
                                            <span className="font-semibold text-slate-100 block">{activeSession.name}</span>
                                            {activeSession.type === 'group' && <span className="text-[10px] text-teal-400 uppercase tracking-wider font-bold">Team Channel</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 text-slate-400">
                                        <button className="hover:text-teal-400 hover:bg-slate-800 p-2 rounded-full transition-colors"><Phone size={18} /></button>
                                        <button className="hover:text-teal-400 hover:bg-slate-800 p-2 rounded-full transition-colors" onClick={onStartVideoCall}><Video size={18} /></button>
                                        <button className="hover:text-white hover:bg-slate-800 p-2 rounded-full transition-colors" onClick={() => setIsOpen(false)}><X size={18} /></button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {activeSession.messages.map(msg => {
                                        const isMe = msg.senderId === currentUser.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                {!isMe && <div className="w-8 h-8 rounded-full bg-slate-700 mr-3 overflow-hidden mt-1"><img src={`https://picsum.photos/40/40?random=${msg.senderId}`} alt=""/></div>}
                                                <div className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-md ${isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}`}>
                                                    {!isMe && <div className="text-[10px] font-bold text-slate-500 mb-1">{msg.senderName}</div>}
                                                    {msg.text}
                                                    <div className={`text-[9px] text-right mt-1 ${isMe ? 'text-teal-200' : 'text-slate-500'}`}>10:30 AM</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="p-4 border-t border-slate-800 bg-slate-900">
                                    <div className="flex items-center bg-slate-950 rounded-xl px-4 py-2 border border-slate-800 focus-within:border-teal-500/50 focus-within:ring-1 focus-within:ring-teal-500/50 transition-all">
                                        <button className="text-slate-500 hover:text-white mr-3"><Paperclip size={18} /></button>
                                        <input 
                                            type="text" 
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Type a message..." 
                                            className="flex-1 bg-transparent outline-none text-sm text-slate-200 placeholder-slate-600"
                                        />
                                        <button className="text-slate-500 hover:text-white ml-3"><Smile size={18} /></button>
                                        <button onClick={handleSend} className="text-teal-500 hover:text-teal-400 ml-3 bg-teal-500/10 p-2 rounded-lg"><Send size={16} /></button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                                     <MessageCircle size={32} className="opacity-50" />
                                </div>
                                <p className="font-medium">Your Messages</p>
                                <p className="text-xs mt-2">Select a conversation to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Bar Floating Pill */}
            <div className="fixed bottom-6 right-6 z-50">
               <button 
                    onClick={toggleChat}
                    className="h-14 w-14 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/30 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
               >
                   {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                   {!isOpen && <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 border-2 border-slate-900 rounded-full"></span>}
               </button>
            </div>
        </>
    );
};