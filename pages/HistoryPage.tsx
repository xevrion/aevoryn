import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { generateFocusInsight } from '../services/geminiService';
import { BrainCircuit, Play } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';

export const HistoryPage: React.FC = () => {
  const { sessions } = useStore();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Group sessions by date
  const groupedSessions: { [key: string]: typeof sessions } = {};
  sessions.forEach(session => {
    const date = new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groupedSessions[date]) groupedSessions[date] = [];
    groupedSessions[date].push(session);
  });

  const handleGetInsight = async () => {
    setLoading(true);
    const result = await generateFocusInsight(sessions);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl h-full flex flex-col gap-8 animate-fade-in pb-20">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">History</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {sessions.filter(s => s.type === 'FOCUS').length} Focus Sessions
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGetInsight} 
          disabled={loading || sessions.length === 0}
          className="gap-2 text-xs"
        >
          {loading ? (
            <span className="animate-pulse">Thinking...</span>
          ) : (
            <>
              <BrainCircuit className="w-4 h-4" /> AI Insight
            </>
          )}
        </Button>
      </div>

      {/* AI Insight Card */}
      {insight && (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 opacity-50"></div>
            <p className="text-zinc-300 font-light italic leading-relaxed">"{insight}"</p>
        </div>
      )}

      {/* History List */}
      <div className="flex flex-col gap-8 overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="text-center py-20 text-zinc-600 font-light">
            No sessions recorded yet. Start focusing.
          </div>
        ) : (
          Object.entries(groupedSessions).map(([date, daySessions]) => (
            <div key={date} className="flex flex-col gap-3">
              <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-widest sticky top-0 bg-transparent backdrop-blur-md py-2 z-10 w-fit px-2 rounded">
                {date}
              </h3>
              {daySessions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(session => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-zinc-200">
                      {session.type === 'FOCUS' ? 'Deep Work' : session.type === 'SHORT_BREAK' ? 'Short Break' : 'Long Break'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-light tabular-nums">{session.durationMinutes}m</span>
                    <div className={`w-2 h-2 rounded-full ${session.type === 'FOCUS' ? 'bg-white' : 'bg-zinc-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};