'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Draft, Team, Player } from '@/lib/schema';
import { getTeamColors } from '@/lib/team-colors';
import Link from 'next/link';

const PICK_TIME_SECONDS = 60;

interface Props {
  draft: Draft;
  teams: Team[];
  players: Player[];
}

export default function LiveDraft({ draft: initialDraft, teams, players: initialPlayers }: Props) {
  const [draft, setDraft] = useState(initialDraft);
  const [players, setPlayers] = useState(initialPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'ranking' | 'rating' | 'name' | 'age'>('ranking');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(PICK_TIME_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown effect
  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((t) => t - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerRunning, timeRemaining]);

  // Reset timer when pick changes
  useEffect(() => {
    setTimeRemaining(PICK_TIME_SECONDS);
    setTimerRunning(true);
  }, [draft.currentRound, draft.currentPick]);

  function resetTimer() {
    setTimeRemaining(PICK_TIME_SECONDS);
    setTimerRunning(true);
  }

  function toggleTimer() {
    setTimerRunning(!timerRunning);
  }

  // Calculate current team based on snake draft
  const currentTeam = useMemo(() => {
    const isForward = draft.currentRound % 2 === 1;
    const position = isForward ? draft.currentPick : teams.length - draft.currentPick + 1;
    return teams.find((t) => t.draftPosition === position);
  }, [draft.currentRound, draft.currentPick, teams]);

  // Get available players (not drafted)
  const availablePlayers = useMemo(() => {
    let available = players.filter((p) => !p.isDrafted);

    if (searchTerm) {
      available = available.filter((p) =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return available.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'age':
          return (b.llAge || 0) - (a.llAge || 0);
        default:
          return (a.rankingNumber || 999) - (b.rankingNumber || 999);
      }
    });
  }, [players, searchTerm, sortBy]);

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

  async function makePick() {
    if (!selectedPlayer || !currentTeam) return;

    const res = await fetch(`/api/drafts/${draft.id}/pick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: selectedPlayer, teamId: currentTeam.id }),
    });

    if (res.ok) {
      const { draft: updatedDraft, player: updatedPlayer } = await res.json();
      setDraft(updatedDraft);
      setPlayers(players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
      setSelectedPlayer(null);
    }
  }

  async function undoPick() {
    const res = await fetch(`/api/drafts/${draft.id}/undo`, {
      method: 'POST',
    });

    if (res.ok) {
      const { draft: updatedDraft, player: updatedPlayer } = await res.json();
      setDraft(updatedDraft);
      if (updatedPlayer) {
        setPlayers(players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
      }
    }
  }

  async function saveNotes(playerId: string) {
    const res = await fetch(`/api/drafts/${draft.id}/players/${playerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: noteValue }),
    });

    if (res.ok) {
      const updated = await res.json();
      setPlayers(players.map((p) => (p.id === playerId ? updated : p)));
    }
    setEditingNotes(null);
  }

  const isComplete = draft.currentRound > draft.totalRounds;
  const overallPick = (draft.currentRound - 1) * teams.length + draft.currentPick;

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <Link href={`/admin/drafts/${draft.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
              &larr; Setup
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              {draft.year} {draft.division} Draft
            </h1>
          </div>
          <div className="flex items-center gap-6">
            {!isComplete && (
              <div className="flex items-center gap-2">
                <div
                  className={`text-4xl font-mono font-bold px-4 py-2 rounded-lg ${
                    timeRemaining <= 10
                      ? 'bg-red-600 text-white animate-pulse'
                      : timeRemaining <= 30
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={toggleTimer}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                  >
                    {timerRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Reset
                  </button>
                </div>
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
            <button
              onClick={undoPick}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              Undo
            </button>
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
                  <th className="px-2 py-2 text-xs font-medium text-left w-16">Round</th>
                  {teams.map((team) => {
                    const colors = getTeamColors(team.name);
                    const isOnClock = currentTeam?.id === team.id && !isComplete;
                    return (
                      <th
                        key={team.id}
                        className={`px-2 py-2 text-xs font-medium text-center min-w-[100px] ${
                          isOnClock ? 'ring-2 ring-yellow-400 ring-inset' : ''
                        }`}
                        style={colors ? { backgroundColor: colors.bg, color: colors.text } : undefined}
                      >
                        {team.name && <div className="truncate font-bold">{team.name}</div>}
                        <div className="truncate">{team.coachNames}</div>
                        <div className={`font-normal ${colors ? 'opacity-75' : 'text-gray-400'}`}>#{team.draftPosition}</div>
                        {isOnClock && <div className="text-yellow-300 font-bold text-xs animate-pulse">ON CLOCK</div>}
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
                      <td className="px-2 py-2 text-sm font-bold text-gray-900 border-r">{round}</td>
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
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-900 mb-2">Available Players ({availablePlayers.length})</h2>
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
            />
            <div className="flex gap-1">
              {(['ranking', 'rating', 'name', 'age'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-2 py-1 text-xs rounded ${
                    sortBy === sort ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedPlayer === player.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                } ${player.isCoachKid ? 'bg-yellow-50' : ''}`}
                onClick={() => setSelectedPlayer(player.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{player.fullName}</div>
                    <div className="text-xs text-gray-500">
                      #{player.rankingNumber} | Rating: {player.rating?.toFixed(1)} | Age: {player.llAge}
                      {player.isCoachKid && <span className="ml-1 text-yellow-600">(Coach Kid)</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-1">
                  {editingNotes === player.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border rounded"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveNotes(player.id);
                          if (e.key === 'Escape') setEditingNotes(null);
                        }}
                      />
                      <button
                        onClick={() => saveNotes(player.id)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      className="text-xs text-gray-500 italic cursor-text"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNotes(player.id);
                        setNoteValue(player.notes || '');
                      }}
                    >
                      {player.notes || 'Click to add notes...'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Make Pick Button */}
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={makePick}
              disabled={!selectedPlayer || isComplete}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedPlayer
                ? `Draft ${players.find((p) => p.id === selectedPlayer)?.fullName}`
                : 'Select a player'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
