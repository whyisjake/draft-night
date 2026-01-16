'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Draft, Team, Player } from '@/lib/schema';
import { getTeamColors } from '@/lib/team-colors';

const PICK_TIME_SECONDS = 60;

interface Props {
  draft: Draft;
  teams: Team[];
  players: Player[];
}

function calculateTimeRemaining(pickStartedAt: Date | string | null): number {
  if (!pickStartedAt) return PICK_TIME_SECONDS;
  const startTime = new Date(pickStartedAt).getTime();
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  return Math.max(0, PICK_TIME_SECONDS - elapsed);
}

export default function CoachView({ draft: initialDraft, teams, players: initialPlayers }: Props) {
  const [draft, setDraft] = useState(initialDraft);
  const [players, setPlayers] = useState(initialPlayers);
  const [connected, setConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(initialDraft.pickStartedAt));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastBeepTime = useRef<number>(0);

  // Play beep sound for countdown
  function playBeep(frequency: number = 800, duration: number = 150) {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch {
      // Audio not supported
    }
  }

  // Play beeps during countdown
  useEffect(() => {
    if (!soundEnabled) return;

    // Beep at 10, 5, 4, 3, 2, 1, 0 seconds
    if (timeRemaining <= 10 && timeRemaining !== lastBeepTime.current) {
      lastBeepTime.current = timeRemaining;
      if (timeRemaining === 0) {
        // Final alarm - three quick beeps
        playBeep(1000, 200);
        setTimeout(() => playBeep(1000, 200), 250);
        setTimeout(() => playBeep(1000, 200), 500);
      } else if (timeRemaining <= 5) {
        playBeep(900, 150);
      } else {
        playBeep(700, 100);
      }
    }
  }, [timeRemaining, soundEnabled]);

  // Timer countdown - recalculate from server time every second
  useEffect(() => {
    const tick = () => {
      setTimeRemaining(calculateTimeRemaining(draft.pickStartedAt));
    };
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [draft.pickStartedAt]);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  async function enableNotifications(teamId: string) {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      setMyTeamId(teamId);
      setNotificationsEnabled(true);
      new Notification('Notifications Enabled', {
        body: `You'll be notified when it's your turn to pick.`,
        icon: '/favicon.ico',
      });
    }
  }

  // Fetch full state from server (used for polling and reconnect)
  const refreshState = async () => {
    try {
      const res = await fetch(`/api/drafts/${draft.id}/state`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setDraft(data.draft);
        setPlayers(data.players);
      }
    } catch {
      // Ignore fetch errors, will retry on next poll
    }
  };

  // Poll for state updates every 3 seconds
  // (SSE doesn't work reliably on Vercel serverless due to instance isolation)
  useEffect(() => {
    // Fetch immediately on mount to get fresh data
    refreshState();
    // Then poll every 3 seconds
    const pollInterval = setInterval(refreshState, 3000);
    return () => clearInterval(pollInterval);
  }, [draft.id]);

  // Connect to SSE for connection status indicator only
  // Note: SSE events are unreliable on Vercel serverless (different instances),
  // so we rely on polling for actual state updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/drafts/${draft.id}/events`);

    eventSource.addEventListener('connected', () => {
      setConnected(true);
    });

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [draft.id]);

  // Calculate current team based on snake draft
  const currentTeam = useMemo(() => {
    const isForward = draft.currentRound % 2 === 1;
    const position = isForward ? draft.currentPick : teams.length - draft.currentPick + 1;
    return teams.find((t) => t.draftPosition === position);
  }, [draft.currentRound, draft.currentPick, teams]);

  // Send notification when it's my turn
  useEffect(() => {
    if (notificationsEnabled && myTeamId && currentTeam?.id === myTeamId) {
      const myTeam = teams.find((t) => t.id === myTeamId);
      new Notification("You're on the clock!", {
        body: `Round ${draft.currentRound} - It's time to make your pick!`,
        icon: '/favicon.ico',
        tag: 'draft-pick', // Prevents duplicate notifications
      });
    }
  }, [currentTeam?.id, myTeamId, notificationsEnabled, draft.currentRound, teams]);

  // Get available players (not drafted)
  const availablePlayers = useMemo(() => {
    let available = players.filter((p) => !p.isDrafted);

    if (searchTerm) {
      available = available.filter((p) =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return available.sort((a, b) => (a.rankingNumber || 999) - (b.rankingNumber || 999));
  }, [players, searchTerm]);

  // Build draft board grid - columns always match team order (by draft position)
  const draftBoard = useMemo(() => {
    const board: (Player | null)[][] = [];

    for (let round = 1; round <= draft.totalRounds; round++) {
      const row: (Player | null)[] = [];

      // Each column corresponds to a team in draft position order
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i]; // teams is already sorted by draftPosition
        const player = players.find(
          (p) => p.isDrafted && p.draftedByTeamId === team?.id && p.roundDrafted === round
        );
        row.push(player || null);
      }
      board.push(row);
    }

    return board;
  }, [players, teams, draft.totalRounds]);

  const isComplete = draft.currentRound > draft.totalRounds;
  const overallPick = (draft.currentRound - 1) * teams.length + draft.currentPick;

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {draft.year} {draft.division} Draft
            </h1>
            <p className="text-sm text-gray-500">Coach View (Read-only)</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Controls */}
            <div className="flex items-center gap-2">
              {notificationsEnabled ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Alerts on for {teams.find((t) => t.id === myTeamId)?.coachNames}
                  <button
                    onClick={() => {
                      new Notification('Test Alert', {
                        body: 'If you see this, notifications are working!',
                        tag: 'test',
                      });
                    }}
                    className="text-blue-600 hover:text-blue-800 ml-2 text-xs"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => {
                      setNotificationsEnabled(false);
                      setMyTeamId(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <select
                  onChange={(e) => e.target.value && enableNotifications(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                  defaultValue=""
                >
                  <option value="">Enable alerts for...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name ? `${team.name} (${team.coachNames})` : team.coachNames}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {/* Sound Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) {
                  // Play a test beep when enabling
                  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();
                  oscillator.connect(gainNode);
                  gainNode.connect(audioContext.destination);
                  oscillator.frequency.value = 700;
                  oscillator.type = 'sine';
                  gainNode.gain.value = 0.3;
                  oscillator.start();
                  oscillator.stop(audioContext.currentTime + 0.1);
                }
              }}
              className={`px-3 py-1 rounded text-sm ${
                soundEnabled
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
            </button>
            <div
              className={`flex items-center gap-2 text-sm ${
                connected ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </div>
            {!isComplete && (
              <div
                className={`text-3xl font-mono font-bold px-3 py-1 rounded-lg ${
                  timeRemaining <= 10
                    ? 'bg-red-600 text-white animate-pulse'
                    : timeRemaining <= 30
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
            )}
            {!isComplete ? (
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Round {draft.currentRound} of {draft.totalRounds} | Pick {overallPick}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  On the clock: {currentTeam?.coachNames || 'Unknown'}
                </div>
              </div>
            ) : (
              <div className="text-lg font-bold text-green-600">Draft Complete!</div>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Draft Board */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-xs font-medium text-right w-16">Round</th>
                  {teams.map((team) => {
                    const colors = getTeamColors(team.name);
                    const isOnClock = currentTeam?.id === team.id && !isComplete;
                    return (
                      <th
                        key={team.id}
                        onClick={() => !notificationsEnabled && enableNotifications(team.id)}
                        className={`px-2 py-2 text-xs font-medium text-center min-w-[100px] cursor-pointer transition ${
                          isOnClock ? 'ring-2 ring-yellow-400 ring-inset' : ''
                        } ${myTeamId === team.id ? 'ring-2 ring-white' : ''}`}
                        style={colors ? { backgroundColor: colors.bg, color: colors.text } : undefined}
                        title={notificationsEnabled ? '' : 'Click to enable alerts for this team'}
                      >
                        {team.name && <div className="truncate font-bold">{team.name}</div>}
                        <div className="truncate">{team.coachNames}</div>
                        <div className={`font-normal ${colors ? 'opacity-75' : 'text-gray-400'}`}>#{team.draftPosition}</div>
                        {isOnClock && <div className="text-yellow-300 font-bold text-xs animate-pulse">ON CLOCK</div>}
                        {myTeamId === team.id && <div className="text-yellow-300 text-xs">Alerts On</div>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {draftBoard.map((row, roundIndex) => {
                  const round = roundIndex + 1;
                  const isCurrentRound = round === draft.currentRound;
                  return (
                    <tr key={round} className={isCurrentRound && !isComplete ? 'bg-green-50' : ''}>
                      <td className="px-2 py-2 text-sm font-bold text-gray-900 border-r text-right">{round}</td>
                      {row.map((player, colIndex) => {
                        // Check if this cell is the current pick (column matches current team)
                        const isCurrentPick = isCurrentRound && teams[colIndex]?.id === currentTeam?.id;

                        return (
                          <td
                            key={colIndex}
                            className={`px-2 py-2 text-xs text-center border ${
                              isCurrentPick && !isComplete
                                ? 'bg-green-200 border-green-500 border-2'
                                : player
                                ? player.isCoachKid
                                  ? 'bg-yellow-100'
                                  : 'bg-gray-50'
                                : ''
                            }`}
                          >
                            {player ? (
                              <div className="truncate font-medium">{player.fullName}</div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Player List */}
        <div className="w-80 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-900 mb-2">Available Players ({availablePlayers.length})</h2>
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex-1 overflow-auto">
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className={`p-3 border-b ${player.isCoachKid ? 'bg-yellow-50' : ''}`}
              >
                <div className="font-medium text-gray-900">{player.fullName}</div>
                <div className="text-xs text-gray-500">
                  #{player.rankingNumber} | Rating: {player.rating?.toFixed(1)} | Age: {player.llAge}
                  {player.isCoachKid && <span className="ml-1 text-yellow-600">(Coach Kid)</span>}
                </div>
                {player.notes && (
                  <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded px-2 py-1 mt-2">
                    {player.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
