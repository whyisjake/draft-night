'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Draft, Team, Player } from '@/lib/schema';
import Link from 'next/link';

interface Props {
  draft: Draft;
  teams: Team[];
  players: Player[];
}

type Tab = 'players' | 'teams' | 'settings';

const MLB_TEAMS = [
  'Angels', 'Astros', 'Athletics', 'Blue Jays', 'Braves',
  'Brewers', 'Cardinals', 'Cubs', 'Diamondbacks', 'Dodgers',
  'Giants', 'Guardians', 'Mariners', 'Marlins', 'Mets',
  'Nationals', 'Orioles', 'Padres', 'Phillies', 'Pirates',
  'Rangers', 'Rays', 'Red Sox', 'Reds', 'Rockies',
  'Royals', 'Tigers', 'Twins', 'White Sox', 'Yankees',
];

export default function DraftSetup({ draft, teams: initialTeams, players: initialPlayers }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('teams');
  const [teams, setTeams] = useState(initialTeams);
  const [players, setPlayers] = useState(initialPlayers);
  const [newCoachName, setNewCoachName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editCoachName, setEditCoachName] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [useCustomTeamName, setUseCustomTeamName] = useState(false);

  // Sort players by ranking number, then by name as secondary
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const rankA = a.rankingNumber || 999;
      const rankB = b.rankingNumber || 999;
      if (rankA !== rankB) return rankA - rankB;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [players]);

  async function addTeam() {
    if (!newCoachName.trim()) return;

    const res = await fetch(`/api/drafts/${draft.id}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachNames: newCoachName }),
    });

    if (res.ok) {
      const team = await res.json();
      setTeams([...teams, team]);
      setNewCoachName('');
    }
  }

  async function removeTeam(teamId: string) {
    const res = await fetch(`/api/drafts/${draft.id}/teams/${teamId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setTeams(teams.filter((t) => t.id !== teamId));
    }
  }

  function startEditingTeam(team: Team) {
    setEditingTeam(team.id);
    setEditCoachName(team.coachNames);
    setEditTeamName(team.name || '');
    // Check if current name is a custom name (not in MLB list)
    setUseCustomTeamName(team.name ? !MLB_TEAMS.includes(team.name) : false);
  }

  async function saveTeamEdit(teamId: string) {
    const res = await fetch(`/api/drafts/${draft.id}/teams/${teamId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachNames: editCoachName, name: editTeamName || null }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTeams(teams.map((t) => (t.id === teamId ? updated : t)));
      setEditingTeam(null);
    }
  }

  async function randomizeOrder() {
    const res = await fetch(`/api/drafts/${draft.id}/teams/randomize`, {
      method: 'POST',
    });

    if (res.ok) {
      const newTeams = await res.json();
      setTeams(newTeams);
    }
  }

  async function handleCsvUpload() {
    if (!csvFile) return;
    setImporting(true);

    const formData = new FormData();
    formData.append('file', csvFile);

    const res = await fetch(`/api/drafts/${draft.id}/players/import`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const newPlayers = await res.json();
      setPlayers(newPlayers);
      setCsvFile(null);
    } else {
      alert('Failed to import CSV');
    }
    setImporting(false);
  }

  async function assignCoachKid(playerId: string, teamId: string | null) {
    const res = await fetch(`/api/drafts/${draft.id}/players/${playerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachKidTeamId: teamId, isCoachKid: !!teamId }),
    });

    if (res.ok) {
      const updated = await res.json();
      setPlayers(players.map((p) => (p.id === playerId ? updated : p)));
    }
  }

  async function startDraft() {
    if (teams.length === 0) {
      alert('Add at least one team before starting the draft');
      return;
    }

    const res = await fetch(`/api/drafts/${draft.id}/start`, {
      method: 'POST',
    });

    if (res.ok) {
      router.push(`/admin/drafts/${draft.id}/run`);
    }
  }

  const coachKids = players.filter((p) => p.isCoachKid);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm">
              &larr; Back to drafts
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {draft.year} {draft.division} Draft
            </h1>
            <p className="text-gray-600">Setup and configuration</p>
          </div>
          <div className="flex gap-4">
            {draft.status !== 'setup' && (
              <Link
                href={`/admin/drafts/${draft.id}/run`}
                className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Go to Draft
              </Link>
            )}
            {draft.status === 'setup' && (
              <button
                onClick={startDraft}
                className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Start Draft
              </button>
            )}
          </div>
        </div>

        {/* Access Key */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Coach View URL:</strong>{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">
              {baseUrl}/draft/{draft.accessKey}
            </code>
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            {(['teams', 'players', 'settings'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'teams' && ` (${teams.length})`}
                {tab === 'players' && ` (${players.length})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Teams & Draft Order</h2>

              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  value={newCoachName}
                  onChange={(e) => setNewCoachName(e.target.value)}
                  placeholder="Coach name(s)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && addTeam()}
                />
                <button
                  onClick={addTeam}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Add Team
                </button>
                <button
                  onClick={randomizeOrder}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition"
                  disabled={teams.length < 2}
                >
                  Randomize Order
                </button>
              </div>

              {teams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No teams yet. Add teams to set the draft order.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Draft Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Coach(es)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Team Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teams.map((team) => (
                      <tr key={team.id}>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{team.draftPosition}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {editingTeam === team.id ? (
                            <input
                              type="text"
                              value={editCoachName}
                              onChange={(e) => setEditCoachName(e.target.value)}
                              className="w-full px-2 py-1 border rounded"
                            />
                          ) : (
                            team.coachNames
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {editingTeam === team.id ? (
                            <div className="flex gap-2">
                              {useCustomTeamName ? (
                                <input
                                  type="text"
                                  value={editTeamName}
                                  onChange={(e) => setEditTeamName(e.target.value)}
                                  placeholder="Custom team name"
                                  className="flex-1 px-2 py-1 border rounded"
                                />
                              ) : (
                                <select
                                  value={editTeamName}
                                  onChange={(e) => setEditTeamName(e.target.value)}
                                  className="flex-1 px-2 py-1 border rounded"
                                >
                                  <option value="">Select team...</option>
                                  {MLB_TEAMS.map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                  ))}
                                </select>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setUseCustomTeamName(!useCustomTeamName);
                                  setEditTeamName('');
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                              >
                                {useCustomTeamName ? 'MLB' : 'Custom'}
                              </button>
                            </div>
                          ) : (
                            team.name || '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          {editingTeam === team.id ? (
                            <>
                              <button
                                onClick={() => saveTeamEdit(team.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingTeam(null)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditingTeam(team)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeTeam(team.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Import Players</h2>
              <div className="flex gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <button
                  onClick={handleCsvUpload}
                  disabled={!csvFile || importing}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import CSV'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Expected columns: Drafted, Number, Round, Coach Kid, Full Name, Rating, LL Age, Previous Manager, Notes
              </p>
            </div>

            {players.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">Players ({players.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Round</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coach Kid</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assign To Team</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedPlayers.map((player) => (
                        <tr key={player.id} className={player.isCoachKid ? 'bg-yellow-50' : ''}>
                          <td className="px-4 py-2 text-sm">{player.rankingNumber}</td>
                          <td className="px-4 py-2 text-sm font-medium">{player.fullName}</td>
                          <td className="px-4 py-2 text-sm">{player.rating?.toFixed(2) || '-'}</td>
                          <td className="px-4 py-2 text-sm">{player.llAge || '-'}</td>
                          <td className="px-4 py-2 text-sm">{player.coachKidRound || '-'}</td>
                          <td className="px-4 py-2 text-sm">{player.isCoachKid ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-2 text-sm">
                            {player.isCoachKid && (
                              <select
                                value={player.coachKidTeamId || ''}
                                onChange={(e) => assignCoachKid(player.id, e.target.value || null)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="">Select team...</option>
                                {teams.map((team) => (
                                  <option key={team.id} value={team.id}>
                                    {team.coachNames}{team.name ? ` (${team.name})` : ''}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Coach Kids Summary */}
            {coachKids.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Coach Kids ({coachKids.length})</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {coachKids.map((p) => (
                    <li key={p.id}>
                      {p.fullName} - Round {p.coachKidRound}
                      {p.coachKidTeamId
                        ? ` → ${teams.find((t) => t.id === p.coachKidTeamId)?.coachNames}${teams.find((t) => t.id === p.coachKidTeamId)?.name ? ` (${teams.find((t) => t.id === p.coachKidTeamId)?.name})` : ''}`
                        : ' (not assigned)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Draft Settings</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Division</dt>
                <dd className="text-lg text-gray-900">{draft.division}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Year</dt>
                <dd className="text-lg text-gray-900">{draft.year}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Rounds</dt>
                <dd className="text-lg text-gray-900">{draft.totalRounds}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-lg text-gray-900 capitalize">{draft.status}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Access Key</dt>
                <dd className="text-lg text-gray-900 font-mono">{draft.accessKey}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </main>
  );
}
