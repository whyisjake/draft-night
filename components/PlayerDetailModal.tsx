'use client';

import { useState } from 'react';
import type { Player, Team } from '@/lib/schema';

interface PlayerDetailModalProps {
  player: Player;
  teams: Team[];
  draftId?: string;
  onClose: () => void;
  onPlayerUpdate?: (player: Player) => void;
}

export default function PlayerDetailModal({ player, teams, draftId, onClose, onPlayerUpdate }: PlayerDetailModalProps) {
  const [editingRating, setEditingRating] = useState(player.rating?.toString() || '');
  const [editingRanking, setEditingRanking] = useState(player.rankingNumber?.toString() || '');
  const [saving, setSaving] = useState(false);

  const canEdit = !!draftId && !!onPlayerUpdate;

  async function saveChanges() {
    if (!draftId || !onPlayerUpdate) return;
    setSaving(true);

    const updates: { rating?: number | null; rankingNumber?: number | null } = {};

    const newRating = editingRating.trim() ? parseFloat(editingRating) : null;
    const newRanking = editingRanking.trim() ? parseInt(editingRanking, 10) : null;

    if (newRating !== player.rating) {
      updates.rating = newRating;
    }
    if (newRanking !== player.rankingNumber) {
      updates.rankingNumber = newRanking;
    }

    if (Object.keys(updates).length === 0) {
      setSaving(false);
      return;
    }

    const res = await fetch(`/api/drafts/${draftId}/players/${player.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const updated = await res.json();
      onPlayerUpdate(updated);
    }
    setSaving(false);
  }

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
              {canEdit ? (
                <input
                  type="text"
                  inputMode="decimal"
                  value={editingRating}
                  onChange={(e) => setEditingRating(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="-"
                />
              ) : (
                <p className="text-lg font-semibold">{player.rating?.toFixed(2) || '-'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">LL Age</label>
              <p className="text-lg font-semibold mt-1 px-3 py-2">{player.llAge || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Ranking #</label>
              {canEdit ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={editingRanking}
                  onChange={(e) => setEditingRanking(e.target.value.replace(/\D/g, ''))}
                  className="w-full mt-1 px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="-"
                />
              ) : (
                <p className="text-lg font-semibold">{player.rankingNumber || '-'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Pre-Assigned</label>
              <p className="text-lg font-semibold mt-1 px-3 py-2">
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
        <div className="border-t px-6 py-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
          {canEdit && (
            <button
              onClick={saveChanges}
              disabled={saving}
              className="flex-1 py-2 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
