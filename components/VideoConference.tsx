import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare, Maximize2, BrainCircuit, Sparkles } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface VideoConferenceProps {
  onClose: () => void;
  currentUserAvatar: string;
}

// Function to encode PCM audio to base64
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Function to create blob for Gemini
function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const VideoConference: React.FC<VideoConferenceProps> = ({ onClose, currentUserAvatar }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [transcripts, setTranscripts] = useState<{ speaker: 'User' | 'AI', text: string }[]>([]);
  const [isAiConnected, setIsAiConnected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // AI Scribe Connection (Gemini Live)
  const toggleAiScribe = async () => {
    if (isAiConnected) {
        window.location.reload();
        return;
    }

    if (!process.env.API_KEY) {
        alert("API Key not found in environment.");
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = inputAudioContext;

        const stream = streamRef.current;
        if (!stream) return;

        const audioStream = new MediaStream(stream.getAudioTracks());
        
        let currentInputTranscription = '';
        let currentOutputTranscription = '';

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            callbacks: {
                onopen: () => {
                    setIsAiConnected(true);
                    
                    const source = inputAudioContext.createMediaStreamSource(audioStream);
                    sourceRef.current = source;
                    
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    processorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                        const text = message.serverContent.outputTranscription.text;
                        currentOutputTranscription += text;
                    } else if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentInputTranscription += text;
                    }

                    if (message.serverContent?.turnComplete) {
                        if (currentInputTranscription.trim()) {
                            setTranscripts(prev => [...prev, { speaker: 'User', text: currentInputTranscription }]);
                            currentInputTranscription = '';
                        }
                        if (currentOutputTranscription.trim()) {
                             setTranscripts(prev => [...prev, { speaker: 'AI', text: currentOutputTranscription }]);
                             currentOutputTranscription = '';
                        }
                    }
                },
                onclose: () => setIsAiConnected(false),
                onerror: (err) => console.error("Gemini Error:", err)
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: "You are a helpful project management assistant attending a meeting. Your job is to listen. Occasionally, if asked, summarize what has been said concisely. Otherwise, stay silent and just transcribe.",
            }
        });
    } catch (error) {
        console.error("Failed to connect to AI:", error);
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shadow-2xl z-10">
        <div className="flex flex-col">
            <div className="text-white font-bold text-lg flex items-center gap-3">
                <span>Weekly Sync: Product & Design</span>
                <span className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/50 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    REC
                </span>
            </div>
            <span className="text-slate-500 text-xs">00:12:45</span>
        </div>
        
        <div className="flex items-center space-x-4">
            <button 
                onClick={toggleAiScribe}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${isAiConnected ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
            >
                {isAiConnected ? <Sparkles size={16} className="text-yellow-300" /> : <BrainCircuit size={16} />}
                <span>{isAiConnected ? 'AI Active' : 'Enable AI Scribe'}</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>
            <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                    <img key={i} src={`https://picsum.photos/40/40?random=${i}`} className="w-9 h-9 rounded-full border-2 border-slate-900" alt="Participant" />
                ))}
                <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs text-white font-medium">+2</div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg"><Maximize2 size={20} /></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-6 grid grid-cols-2 gap-6 auto-rows-fr bg-slate-950">
           {/* Self */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden relative shadow-xl border border-slate-800 group">
                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} />
                {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                         <img src={currentUserAvatar} alt="Me" className="w-32 h-32 rounded-full opacity-50 border-4 border-slate-800" />
                    </div>
                )}
                <div className="absolute bottom-4 left-4">
                    <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2">
                        You {isMuted && <MicOff size={12} className="text-rose-400"/>}
                    </div>
                </div>
            </div>
            {/* Participant 1 Mock */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden relative shadow-xl border border-slate-800 ring-2 ring-indigo-500/50">
                <img src="https://picsum.photos/800/600?random=101" className="w-full h-full object-cover" alt="Sarah" />
                <div className="absolute bottom-4 left-4">
                     <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg">Sarah Jenkins</div>
                </div>
                <div className="absolute top-4 right-4 bg-indigo-500 p-1.5 rounded-lg shadow-lg">
                    <div className="flex gap-1">
                        <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                        <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                        <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_300ms]"></div>
                    </div>
                </div>
            </div>
            {/* Participant 2 Mock */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden relative shadow-xl border border-slate-800">
                <img src="https://picsum.photos/800/600?random=102" className="w-full h-full object-cover grayscale opacity-70" alt="Mike" />
                <div className="absolute bottom-4 left-4">
                     <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg">Mike Ross</div>
                </div>
            </div>
            {/* Participant 3 Mock */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden relative shadow-xl border border-slate-800 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900">
                 <div className="text-slate-600 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-slate-800 mb-4 flex items-center justify-center text-2xl text-slate-500 font-bold border-4 border-slate-800 shadow-inner">JD</div>
                    <span className="font-medium">John Doe</span>
                    <span className="text-xs text-slate-500 mt-1">Connecting audio...</span>
                 </div>
            </div>
        </div>

        {/* Sidebar (Chat / Transcripts) */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="flex p-2 bg-slate-900 border-b border-slate-800 gap-1">
                <button className="flex-1 py-2 text-sm text-white bg-slate-800 rounded-lg font-medium shadow-sm">Transcript (AI)</button>
                <button className="flex-1 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg font-medium transition-colors">Chat</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {transcripts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                        <div className={`p-4 rounded-full bg-slate-800 ${isAiConnected ? 'animate-pulse' : ''}`}>
                            <BrainCircuit size={32} className={isAiConnected ? "text-indigo-500" : "text-slate-600"} />
                        </div>
                        <p className="text-sm italic text-center max-w-[200px]">
                            {isAiConnected ? "AI is listening and transcribing the conversation..." : "Activate the AI Scribe to generate real-time meeting notes."}
                        </p>
                    </div>
                ) : (
                    transcripts.map((t, idx) => (
                        <div key={idx} className="flex flex-col space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${t.speaker === 'AI' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                    {t.speaker}
                                </span>
                                <span className="text-[10px] text-slate-600">Now</span>
                            </div>
                            <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-xl border border-slate-800 leading-relaxed">{t.text}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="h-24 bg-slate-900 flex items-center justify-center space-x-6 border-t border-slate-800 pb-4">
        <button onClick={toggleMute} className={`p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 ${isMuted ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button onClick={toggleVideo} className={`p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 ${isVideoOff ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        <button onClick={onClose} className="px-8 py-4 rounded-2xl bg-rose-600 text-white hover:bg-rose-500 flex items-center space-x-3 shadow-xl shadow-rose-600/20 hover:shadow-rose-600/30 transition-all duration-200 transform hover:scale-105">
            <PhoneOff size={24} />
            <span className="font-bold">Leave Meeting</span>
        </button>
        <button className="p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200">
            <Users size={24} />
        </button>
        <button className="p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200">
             <MessageSquare size={24} />
        </button>
      </div>
    </div>
  );
};