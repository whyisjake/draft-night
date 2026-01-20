'use client';

import { useState, useMemo } from 'react';
import type { Player, Team } from '@/lib/schema';

interface FullScreenPlayerListProps {
  players: Player[];
  teams: Team[];
  onClose: () => void;
  onSelectPlayer?: (player: Player) => void;
  showDraftedDefault?: boolean;
}

type SortBy = 'ranking' | 'rating' | 'name' | 'age' | 'pitches';

export default function FullScreenPlayerList({
  players,
  teams,
  onClose,
  onSelectPlayer,
  showDraftedDefault = false,
}: FullScreenPlayerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('ranking');
  const [showDrafted, setShowDrafted] = useState(showDraftedDefault);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const displayedPlayers = useMemo(() => {
    let filtered = players.filter((p) => (showDrafted ? p.isDrafted : !p.isDrafted));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(term) ||
          p.previousTeam?.toLowerCase().includes(term) ||
          p.previousManager?.toLowerCase().includes(term) ||
          p.teammateRequest?.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => {
      if (showDrafted) {
        return (a.pickNumber || 999) - (b.pickNumber || 999);
      }
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'age':
          return (b.llAge || 0) - (a.llAge || 0);
        case 'pitches':
          return (b.pitchCount || 0) - (a.pitchCount || 0);
        default:
          return (a.rankingNumber || 999) - (b.rankingNumber || 999);
      }
    });
  }, [players, searchTerm, sortBy, showDrafted]);

  function handlePlayerClick(player: Player) {
    if (onSelectPlayer) {
      setSelectedPlayerId(player.id);
      onSelectPlayer(player);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold text-gray-900">Player List</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDrafted(false)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                !showDrafted
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Available ({players.filter((p) => !p.isDrafted).length})
            </button>
            <button
              onClick={() => setShowDrafted(true)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                showDrafted
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Drafted ({players.filter((p) => p.isDrafted).length})
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search players, teams, coaches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {!showDrafted && (
            <div className="flex gap-1">
              {(['ranking', 'rating', 'name', 'age', 'pitches'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition ${
                    sortBy === sort
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Player Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedPlayers.map((player) => {
            const team = player.draftedByTeamId
              ? teams.find((t) => t.id === player.draftedByTeamId)
              : player.coachKidTeamId
              ? teams.find((t) => t.id === player.coachKidTeamId)
              : null;

            return (
              <div
                key={player.id}
                onClick={() => handlePlayerClick(player)}
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
                  onSelectPlayer ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : ''
                } ${selectedPlayerId === player.id ? 'ring-4 ring-blue-500' : ''} ${
                  player.coachKidTeamId && !player.isDrafted ? 'border-2 border-green-400' : ''
                }`}
              >
                {/* Player Header */}
                <div
                  className={`px-4 py-3 ${
                    player.isDrafted
                      ? 'bg-gray-100'
                      : player.coachKidTeamId
                      ? 'bg-green-100'
                      : 'bg-blue-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className={`font-bold text-lg ${
                          player.isDrafted || player.coachKidTeamId ? 'text-gray-900' : 'text-white'
                        }`}
                      >
                        {player.fullName}
                        {player.specialRequest && (
                          <span className="ml-2 text-amber-500" title={player.specialRequest}>
                            *
                          </span>
                        )}
                      </h3>
                      {player.isDrafted ? (
                        <p className="text-sm text-gray-600">
                          Pick #{player.pickNumber} • Round {player.roundDrafted} • {team?.coachNames}
                        </p>
                      ) : player.coachKidTeamId ? (
                        <p className="text-sm text-green-700">Pre-assigned to {team?.coachNames}</p>
                      ) : (
                        <p className="text-sm text-blue-100">#{player.rankingNumber || '-'}</p>
                      )}
                    </div>
                    <div
                      className={`text-right ${
                        player.isDrafted || player.coachKidTeamId ? 'text-gray-900' : 'text-white'
                      }`}
                    >
                      <div className="text-2xl font-bold">{player.rating?.toFixed(1) || '-'}</div>
                      <div className="text-xs opacity-75">Rating</div>
                    </div>
                  </div>
                </div>

                {/* Player Details */}
                <div className="px-4 py-3 space-y-3">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded px-2 py-1">
                      <div className="text-lg font-semibold text-gray-900">{player.llAge || '-'}</div>
                      <div className="text-xs text-gray-500">Age</div>
                    </div>
                    <div className="bg-gray-50 rounded px-2 py-1">
                      <div className="text-lg font-semibold text-gray-900">
                        {player.rankingNumber || '-'}
                      </div>
                      <div className="text-xs text-gray-500">Rank</div>
                    </div>
                    <div className="bg-gray-50 rounded px-2 py-1">
                      <div className="text-lg font-semibold text-gray-900">
                        {player.pitchCount ? `⚾ ${player.pitchCount}` : '-'}
                      </div>
                      <div className="text-xs text-gray-500">Pitches</div>
                    </div>
                  </div>

                  {/* Previous Season */}
                  {(player.previousTeam || player.previousManager) && (
                    <div className="text-sm">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Previous Season
                      </div>
                      <div className="text-gray-700">
                        {player.previousTeam && <span>{player.previousTeam}</span>}
                        {player.previousTeam && player.previousManager && <span> • </span>}
                        {player.previousManager && <span>{player.previousManager}</span>}
                      </div>
                    </div>
                  )}

                  {/* Availability Flags */}
                  <div className="flex gap-2 flex-wrap">
                    {player.swimTeam && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        🏊 Swim Team
                      </span>
                    )}
                    {player.otherSports && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                        🏃 Other Sports
                      </span>
                    )}
                    {player.availability80 === false && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                        ⚠️ &lt;80% Available
                      </span>
                    )}
                  </div>

                  {/* Requests */}
                  {player.teammateRequest && (
                    <div className="text-sm">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Teammate Request
                      </div>
                      <div className="text-gray-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                        {player.teammateRequest}
                      </div>
                    </div>
                  )}

                  {player.specialRequest && (
                    <div className="text-sm">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Special Request
                      </div>
                      <div className="text-gray-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                        {player.specialRequest}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {player.notes && (
                    <div className="text-sm">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</div>
                      <div className="text-gray-700 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                        {player.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {displayedPlayers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'No players match your search' : 'No players to display'}
            </p>
          </div>
        )}
      </div>

      {/* Footer with count */}
      <div className="bg-white border-t px-6 py-3 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {displayedPlayers.length} of {players.length} players
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
