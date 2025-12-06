'use client';

import { Session } from '@/types';

interface HistoryClientProps {
  sessions: Session[];
}

export function HistoryClient({ sessions }: HistoryClientProps) {
  // Group sessions by date
  const groupedSessions: { [key: string]: Session[] } = {};
  sessions.forEach(session => {
    const date = new Date(session.date).toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
    if (!groupedSessions[date]) groupedSessions[date] = [];
    groupedSessions[date].push(session);
  });

  return (
    <div className="w-full max-w-2xl h-full flex flex-col gap-8 animate-fade-in pb-20">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">History</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {sessions.filter(s => s.focusMinutes > 0).length} Focus Sessions
          </p>
        </div>
      </div>

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
              {daySessions
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .map(session => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-zinc-200">
                        {session.focusMinutes > 0 ? 'Deep Work' : 'Break'}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {session.note && (
                        <span className="text-xs text-zinc-600 italic mt-1">{session.note}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {session.focusMinutes > 0 && (
                        <span className="text-lg font-light tabular-nums">{session.focusMinutes}m</span>
                      )}
                      {session.breakMinutes > 0 && (
                        <span className="text-lg font-light tabular-nums text-zinc-500">{session.breakMinutes}m</span>
                      )}
                      <div className={`w-2 h-2 rounded-full ${session.focusMinutes > 0 ? 'bg-white' : 'bg-zinc-600'}`} />
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

