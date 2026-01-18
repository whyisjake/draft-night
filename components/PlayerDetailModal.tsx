'use client';

import type { Player, Team } from '@/lib/schema';

interface PlayerDetailModalProps {
  player: Player;
  teams: Team[];
  onClose: () => void;
}

export default function PlayerDetailModal({ player, teams, onClose }: PlayerDetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{player.fullName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Rating</label>
              <p className="text-lg font-semibold">{player.rating?.toFixed(2) || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">LL Age</label>
              <p className="text-lg font-semibold">{player.llAge || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Ranking #</label>
              <p className="text-lg font-semibold">{player.rankingNumber || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Pre-Assigned</label>
              <p className="text-lg font-semibold">
                {player.coachKidTeamId ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  'No'
                )}
              </p>
            </div>
          </div>

          {/* Previous Season */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Previous Season</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Previous Team</label>
                <p className="text-sm">{player.previousTeam || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Previous Coach</label>
                <p className="text-sm">{player.previousManager || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Pitch Count</label>
                <p className="text-sm font-medium">{player.pitchCount || '-'}</p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Availability</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Swim Team</label>
                <p className={`text-sm font-medium ${player.swimTeam ? 'text-blue-600' : 'text-gray-600'}`}>
                  {player.swimTeam ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Other Sports</label>
                <p className={`text-sm font-medium ${player.otherSports ? 'text-amber-600' : 'text-gray-600'}`}>
                  {player.otherSports ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">80% Available</label>
                <p className={`text-sm font-medium ${player.availability80 === false ? 'text-red-600' : 'text-green-600'}`}>
                  {player.availability80 === false ? 'No' : 'Yes'}
                </p>
              </div>
            </div>
          </div>

          {/* Requests */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Requests</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Teammate Request</label>
                <p className="text-sm">{player.teammateRequest || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Special Request</label>
                <p className="text-sm">{player.specialRequest || '-'}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {player.notes && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{player.notes}</p>
            </div>
          )}

          {/* Pre-Assignment */}
          {player.coachKidTeamId && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Pre-Assignment</h3>
              <p className="text-sm text-green-600 font-medium">
                Assigned to: {teams.find((t) => t.id === player.coachKidTeamId)?.coachNames}
                {teams.find((t) => t.id === player.coachKidTeamId)?.name
                  ? ` (${teams.find((t) => t.id === player.coachKidTeamId)?.name})`
                  : ''}
                {player.coachKidRound && ` - Round ${player.coachKidRound}`}
              </p>
            </div>
          )}

          {/* Draft Status */}
          {player.isDrafted && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Draft Status</h3>
              <p className="text-sm text-green-600 font-medium">
                Drafted in Round {player.roundDrafted}, Pick #{player.pickNumber}
                {player.draftedByTeamId && (
                  <> by {teams.find((t) => t.id === player.draftedByTeamId)?.coachNames}</>
                )}
              </p>
            </div>
          )}
        </div>
        <div className="border-t px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
