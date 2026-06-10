const { useState, useEffect, useRef } = React;

const INITIAL_MESSAGES = [
    { id: 1, sender: 'system', text: 'PRINOX AI IS VERIFYING CONNECTION...', type: 'status' },
    { id: 2, sender: 'system', text: 'VERIFYING BIOMETRICS: PRINAN SAHA (EE, NANO, MECH)...', type: 'status' },
    { id: 3, sender: 'system', text: 'YOU MAY CONTINUE, MY GOOD SIR 🗿', type: 'status' },
    { id: 4, sender: 'ai', text: 'WELCOME MR.PRINAN SAHA🗿, I AM PRINOX AI YOUR AI ASSISTANT.' }
];

// --- ICON COMPONENTS ---
const Icon = ({ path, size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{path}</svg>
);

const Icons = {
    Send: (props) => <Icon {...props} path={<><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></>} />,
    Activity: (props) => <Icon {...props} path={<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></>} />,
    Terminal: (props) => <Icon {...props} path={<><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></>} />,
    Zap: (props) => <Icon {...props} path={<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></>} />,
    Menu: (props) => <Icon {...props} path={<><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>} />,
    X: (props) => <Icon {...props} path={<><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>} />,
    Lock: (props) => <Icon {...props} path={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></>} />,
    Database: (props) => <Icon {...props} path={<><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></>} />,
    RefreshCw: (props) => <Icon {...props} path={<><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.5 9a8 8 0 0 1 14.5-5.5"></path><path d="M20.5 15a8 8 0 0 1-14.5 5.5"></path></>} />,
    Mic: (props) => <Icon {...props} path={<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></>} />,
    Headphones: (props) => <Icon {...props} path={<><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></>} />
};

// --- MESSAGE COMPONENTS ---
const StatusMessage = ({ text }) => (
    <div className="flex items-center gap-2 text-xs text-primary/80 font-mono my-2 pl-1">
        <span className="animate-pulse">►</span> {text}
    </div>
);

const ChatMessage = ({ msg }) => {
    const isUser = msg.sender === 'user';
    const isVoice = msg.voiceMode;
    const aiIcon = isVoice ? <Icons.Headphones size={12} className="text-primary" /> : <Icons.Database size={12} className="text-primary" />;
    
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className="max-w-[85%] md:max-w-[70%]">
                <div className={`relative p-5 rounded-xl border backdrop-blur-md transition-all duration-300 ${isUser? 'bg-secondary/20 border-primary/50 text-white rounded-br-none shadow-[0_0_10px_rgba(var(--color-secondary),0.1)]': 'bg-black/60 border-primary/30 text-primary rounded-bl-none shadow-glow'}`}>
                    {msg.sender === 'ai' && (
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-black border border-primary rounded-lg flex items-center justify-center shadow-glow">
                            {aiIcon}
                        </div>
                    )}
                    <p className="text-sm md:text-base leading-relaxed tracking-wide whitespace-pre-wrap">{msg.text}</p>
                </div>
            </div>
        </div>
    )
};

// --- MAIN APP COMPONENT ---
const PrinoxAI = () => {
    const [viewMode, setViewMode] = useState('chat');
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef(null);
    
    const isVoiceMode = viewMode === 'voice';
    const colorClass = isVoiceMode ? 'voice-mode' : '';
    const primaryColorName = isVoiceMode ? 'VOICE' : 'CHAT';

    const speakText = (text) => {
        if (!window.speechSynthesis) return;
        const cleanText = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '').replace(/🗿/g, '');
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.pitch = 0.9;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice Input not supported in this browser.");
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };
        recognition.onend = () => setIsRecording(false);
        recognition.start();
    };

    const startNewChat = (mode = viewMode) => {
        if (isLoading) return;
        window.speechSynthesis.cancel();
        
        const initialVoiceMsg = [
            { id: 1, sender: 'system', text: 'INITIATING VOCAL INTERFACE...', type: 'status' },
            { id: 2, sender: 'ai', text: 'VOICE MODE ACTIVE MR.PRINAN SAHA🗿. I AM LISTENING.', voiceMode: true }
        ];
        
        if (mode === 'voice') speakText("Voice mode active Mr Prinan Saha. I am listening.");
        setMessages(mode === 'chat' ? INITIAL_MESSAGES : initialVoiceMsg);
        setIsSidebarOpen(false);
    };

    const switchMode = (newMode) => {
        setViewMode(newMode);
        startNewChat(newMode);
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e, overrideInput = null) => {
        if (e) e.preventDefault();
        const textToSend = overrideInput || input;
        
        if (!textToSend.trim() || isLoading) return;
        
        setInput('');
        setIsLoading(true);
        
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: textToSend, voiceMode: isVoiceMode }]);
        
        const loadingId = Date.now() + 1;
        setMessages(prev => [...prev, { id: loadingId, sender: 'system', text: isVoiceMode ? "ANALYZING AUDIO WAVEFORM..." : "Processing Logic...", type: 'status' }]);
        
        // Note: fetchGeminiResponse is pulled from api/gemini.js globally
        const aiResponse = await fetchGeminiResponse(textToSend, isVoiceMode);
        
        if (isVoiceMode) {
            speakText(aiResponse);
        }
        
        setIsLoading(false);
        setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== loadingId);
            return [...filtered, { id: Date.now(), sender: 'ai', text: aiResponse, voiceMode: isVoiceMode }];
        });
    };

    return (
        <div className={`min-h-screen bg-black text-primary font-mono selection:bg-secondary/40 selection:text-white overflow-hidden relative flex flex-col md:flex-row ${colorClass}`}>
            {/* Background FX */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{backgroundImage: `linear-gradient(rgba(var(--color-glow), 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--color-glow), 0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px'}}></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 blur-[100px] rounded-full pointer-events-none animate-pulse-glow"></div>
            
            {/* Mobile Header */}
            <div className="md:hidden relative z-50 flex items-center justify-between p-4 border-b border-primary/30 bg-black/90 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Icons.Database className={`w-5 h-5 text-primary animate-pulse ${isVoiceMode ? 'hidden' : ''}`} />
                    <Icons.Headphones className={`w-5 h-5 text-primary animate-pulse ${isVoiceMode ? '' : 'hidden'}`} />
                    <span className="font-bold tracking-widest text-white">PRINOX - {isVoiceMode ? 'VOICE' : 'CHAT'}</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 border border-primary/30 rounded hover:bg-secondary/20 text-primary">
                    {isSidebarOpen ? <Icons.X size={20} /> : <Icons.Menu size={20} />}
                </button>
            </div>
            
            {/* Sidebar */}
            <div className={`fixed md:relative inset-y-0 left-0 z-40 w-80 bg-black/95 md:bg-black/40 border-r border-primary/30 backdrop-blur-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="relative group">
                            <div className="absolute inset-0 blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" style={{backgroundColor: `rgb(var(--color-primary))`}}></div>
                            <Icons.Database className={`w-10 h-10 relative z-10 text-white ${isVoiceMode ? 'hidden' : ''}`} />
                            <Icons.Headphones className={`w-10 h-10 relative z-10 text-white ${isVoiceMode ? '' : 'hidden'}`} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-[0.2em] text-white">PRINOX</h1>
                            <p className="text-[10px] text-primary tracking-[0.3em] uppercase">SYSTEM V6.9</p>
                        </div>
                    </div>
                    
                    {/* Mode Switcher */}
                    <div className="mb-6 p-1 flex bg-black border border-primary/30 rounded-lg">
                        <button onClick={() => switchMode('chat')} className={`flex-1 p-2 text-xs font-bold rounded ${!isVoiceMode ? 'bg-secondary/50 text-white shadow-glow' : 'text-primary/70 hover:text-primary'}`}>
                            <Icons.Database size={14} className="inline mr-1" /> CHAT
                        </button>
                        <button onClick={() => switchMode('voice')} className={`flex-1 p-2 text-xs font-bold rounded ${isVoiceMode ? 'bg-secondary/50 text-white shadow-glow' : 'text-primary/70 hover:text-primary'}`}>
                            <Icons.Mic size={14} className="inline mr-1" /> VOICE
                        </button>
                    </div>
                    
                    {/* New Chat Button */}
                    <button onClick={() => startNewChat()} className="w-full mb-6 p-3 flex items-center justify-center gap-2 bg-secondary/30 text-white rounded-lg border border-primary/50 hover:bg-secondary/50 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50" disabled={isLoading}>
                        <Icons.RefreshCw size={16} /> RESTART {isVoiceMode ? 'SESSION' : 'CHAT'}
                    </button>
                    
                    {/* Visualizer (Only in Voice Mode) */}
                    {isVoiceMode && (
                        <div className="mb-6 p-4 bg-black/30 border border-primary/30 rounded-lg flex items-center justify-center gap-1 h-16">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="sound-bar" style={{ animationDelay: `${i * 0.1}s`, opacity: isRecording || isLoading ? 1 : 0.2 }}></div>
                            ))}
                        </div>
                    )}
                    
                    {/* Credentials Badge */}
                    <div className="mb-6 p-4 bg-black/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-green-400 font-bold tracking-wider flex items-center gap-2"><Icons.Lock size={12} /> SECURITY</span>
                            <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e] animate-pulse"></span>
                        </div>
                        <div className="text-[10px] text-primary/70 font-mono leading-relaxed">
                            PRINOX AI: INITIALIZED <br/>
                            IDENTITY: VERIFIED<br/>
                            ACCESS: GRANTED
                        </div>
                    </div>
                    
                    {/* Stats Modules */}
                    <div className="space-y-4">
                        <div className="border border-primary/30 bg-black/10 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-primary/70 uppercase tracking-wider">Developer</span>
                                <Icons.Activity size={12} />
                            </div>
                            <div className="text-sm text-white font-bold mb-2">MR. PRINAN SAHA🗿</div>
                        </div>
                        
                        <div className="border border-primary/30 bg-black/10 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2 text-primary text-xs">
                                <Icons.Database size={12} />KNOWLEDGE BASE
                            </div>
                            <div className="w-full bg-black/20 h-1.5 rounded-full mb-2">
                                <div className="h-1.5 rounded-full w-[92%]" style={{backgroundColor: `rgb(var(--color-primary))`, boxShadow: `0 0 10px rgba(var(--color-glow), 0.5)`}}></div>
                            </div>
                            <div className="text-[10px] font-mono opacity-70 flex justify-between text-primary/70">
                                <span>MODE: {primaryColorName}</span>
                                <span>STATUS: {isLoading ? 'BUSY' : 'IDLE'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-primary/30 text-[10px] text-center text-primary/70">PRINOX AI 🗿© 2025</div>
                </div>
            </div>
            
            {/* Main Interface */}
            <div className="flex-1 flex flex-col relative z-10 bg-gradient-to-b from-black/20 to-black/90">
                {/* Desktop Header */}
                <div className="hidden md:flex justify-between items-center p-6 border-b border-primary/30 bg-black/40 backdrop-blur-sm">
                    <h2 className="text-sm font-light tracking-[0.2em] flex items-center gap-2 text-white">
                        {isVoiceMode ? <Icons.Headphones size={16} /> : <Icons.Terminal size={16} />}
                        PRINOX IS READY - {isVoiceMode ? 'VOICE INTERFACE' : 'TEXT CHAT'} 🗿
                    </h2>
                    <div className="flex gap-4 text-xs tracking-widest text-primary/70">
                        <span className="flex items-center gap-1 text-yellow-400">
                            <Icons.Zap size={10} className="text-yellow-400" /> POWER: 100%
                        </span>
                    </div>
                </div>
                
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
                    {messages.map((msg) => (
                        msg.type === 'status' ? <StatusMessage key={msg.id} text={msg.text} /> : <ChatMessage key={msg.id} msg={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-4 md:p-6 bg-black/80 border-t border-primary/30 backdrop-blur-md">
                    <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
                        <button type="button" onClick={() => switchMode(isVoiceMode ? 'chat' : 'voice')} disabled={isLoading} className={`p-3 mr-4 rounded-lg border text-primary disabled:opacity-30 transition-all ${isVoiceMode ? 'bg-rose-500/10 border-rose-400 hover:bg-rose-500/20' : 'bg-cyan-500/10 border-cyan-400 hover:bg-cyan-500/20'}`} title={isVoiceMode ? 'Switch to Text Mode' : 'Switch to Voice Mode'}>
                            {isVoiceMode ? <Icons.Headphones size={18} /> : <Icons.Database size={18} />}
                        </button>
                        
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(e); }} disabled={isLoading || isRecording} placeholder={isLoading ? (isVoiceMode ? "SPEAKING..." : "COMPUTING...") : isRecording ? "LISTENING..." : (isVoiceMode ? "Type or Click Mic to Speak..." : "WAITING FOR INPUT...")} className="flex-1 bg-black/10 border border-primary/30 rounded-lg py-4 pl-4 pr-14 text-white placeholder-primary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-mono shadow-inner"/>
                        
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                            {isVoiceMode && (
                                <button type="button" onClick={startListening} className={`p-2 rounded-md transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-secondary/10 text-primary hover:bg-secondary/20 hover:text-white'}`}>
                                    <Icons.Mic size={18} />
                                </button>
                            )}
                            <button type="submit" disabled={!input.trim() || isLoading} className="p-2 bg-secondary/10 text-primary rounded-md hover:bg-secondary/20 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all">
                                <Icons.Send size={18} />
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-3 text-[10px] text-primary/70 tracking-[0.3em]">PRINOX AI // BY PRINAN SAHA</div>
                </div>
            </div>
        </div>
    );
};
