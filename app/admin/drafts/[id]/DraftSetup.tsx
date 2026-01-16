'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Draft, Team, Player } from '@/lib/schema';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableTeamRowProps {
  team: Team;
  position: number;
  isEditing: boolean;
  editCoachName: string;
  editTeamName: string;
  useCustomTeamName: boolean;
  onEditCoachName: (value: string) => void;
  onEditTeamName: (value: string) => void;
  onToggleCustomName: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}

function SortableTeamRow({
  team,
  position,
  isEditing,
  editCoachName,
  editTeamName,
  useCustomTeamName,
  onEditCoachName,
  onEditTeamName,
  onToggleCustomName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: SortableTeamRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? 'bg-blue-50' : ''}>
      <td className="px-4 py-3 text-sm font-bold text-gray-900">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
            title="Drag to reorder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
          {position}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {isEditing ? (
          <input
            type="text"
            value={editCoachName}
            onChange={(e) => onEditCoachName(e.target.value)}
            className="w-full px-2 py-1 border rounded"
          />
        ) : (
          team.coachNames
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {isEditing ? (
          <div className="flex gap-2">
            {useCustomTeamName ? (
              <input
                type="text"
                value={editTeamName}
                onChange={(e) => onEditTeamName(e.target.value)}
                placeholder="Custom team name"
                className="flex-1 px-2 py-1 border rounded"
              />
            ) : (
              <select
                value={editTeamName}
                onChange={(e) => onEditTeamName(e.target.value)}
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
              onClick={onToggleCustomName}
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
        {isEditing ? (
          <>
            <button onClick={onSaveEdit} className="text-green-600 hover:text-green-800">
              Save
            </button>
            <button onClick={onCancelEdit} className="text-gray-600 hover:text-gray-800">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={onStartEdit} className="text-blue-600 hover:text-blue-800">
              Edit
            </button>
            <button onClick={onRemove} className="text-red-600 hover:text-red-800">
              Remove
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

export default function DraftSetup({ draft: initialDraft, teams: initialTeams, players: initialPlayers }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('teams');
  const [draft, setDraft] = useState(initialDraft);
  const [teams, setTeams] = useState(initialTeams);
  const [players, setPlayers] = useState(initialPlayers);
  const [newCoachName, setNewCoachName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pasteData, setPasteData] = useState('');
  const [importSource, setImportSource] = useState<'file' | 'paste'>('paste');
  const [importAction, setImportAction] = useState<'replace' | 'addNew' | 'update'>('replace');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; updated: number; skipped: number } | null>(null);
  const [previewDiff, setPreviewDiff] = useState<any[] | null>(null);
  const [previewStats, setPreviewStats] = useState<{ add: number; update: number; delete: number; skip: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editCoachName, setEditCoachName] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [useCustomTeamName, setUseCustomTeamName] = useState(false);

  // Settings form state (year and rounds as strings for clean editing)
  const [settingsDivision, setSettingsDivision] = useState(draft.division);
  const [settingsYear, setSettingsYear] = useState(String(draft.year));
  const [settingsRounds, setSettingsRounds] = useState(String(draft.totalRounds));
  const [settingsStatus, setSettingsStatus] = useState(draft.status);
  const [savingSettings, setSavingSettings] = useState(false);

  // Sort players by ranking number, then by name as secondary
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const rankA = a.rankingNumber || 999;
      const rankB = b.rankingNumber || 999;
      if (rankA !== rankB) return rankA - rankB;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [players]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = teams.findIndex((t) => t.id === active.id);
      const newIndex = teams.findIndex((t) => t.id === over.id);

      const newTeams = arrayMove(teams, oldIndex, newIndex).map((team, index) => ({
        ...team,
        draftPosition: index + 1,
      }));

      setTeams(newTeams);

      // Save new order to server
      await fetch(`/api/drafts/${draft.id}/teams/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamIds: newTeams.map((t) => t.id),
        }),
      });
    }
  }

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

  async function handlePreview() {
    if (importSource === 'file' && !csvFile) return;
    if (importSource === 'paste' && !pasteData.trim()) return;

    setImporting(true);
    setImportResult(null);
    setPreviewDiff(null);
    setPreviewStats(null);

    let res: Response;

    if (importSource === 'file' && csvFile) {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('importMode', importAction);
      formData.append('preview', 'true');
      res = await fetch(`/api/drafts/${draft.id}/players/import`, {
        method: 'POST',
        body: formData,
      });
    } else {
      res = await fetch(`/api/drafts/${draft.id}/players/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: pasteData, importMode: importAction, preview: true }),
      });
    }

    if (res.ok) {
      const result = await res.json();
      setPreviewDiff(result.diff);
      setPreviewStats(result.stats);
      setShowPreview(true);
    } else {
      alert('Failed to preview import');
    }
    setImporting(false);
  }

  async function handleConfirmImport() {
    if (importSource === 'file' && !csvFile) return;
    if (importSource === 'paste' && !pasteData.trim()) return;

    setImporting(true);

    let res: Response;

    if (importSource === 'file' && csvFile) {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('importMode', importAction);
      res = await fetch(`/api/drafts/${draft.id}/players/import`, {
        method: 'POST',
        body: formData,
      });
    } else {
      res = await fetch(`/api/drafts/${draft.id}/players/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: pasteData, importMode: importAction }),
      });
    }

    if (res.ok) {
      const result = await res.json();
      setPlayers(result.players);
      setImportResult(result.stats);
      setCsvFile(null);
      setPasteData('');
      setShowPreview(false);
      setPreviewDiff(null);
      setPreviewStats(null);
    } else {
      alert('Failed to import data');
    }
    setImporting(false);
  }

  function cancelPreview() {
    setShowPreview(false);
    setPreviewDiff(null);
    setPreviewStats(null);
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

  async function saveSettings() {
    setSavingSettings(true);
    const res = await fetch(`/api/drafts/${draft.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        division: settingsDivision,
        year: parseInt(settingsYear, 10) || draft.year,
        totalRounds: parseInt(settingsRounds, 10) || draft.totalRounds,
        status: settingsStatus,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setDraft(updated);
      // Sync form state with saved values
      setSettingsDivision(updated.division);
      setSettingsYear(String(updated.year));
      setSettingsRounds(String(updated.totalRounds));
      setSettingsStatus(updated.status);
    } else {
      alert('Failed to save settings');
    }
    setSavingSettings(false);
  }

  const settingsChanged =
    settingsDivision !== draft.division ||
    parseInt(settingsYear, 10) !== draft.year ||
    parseInt(settingsRounds, 10) !== draft.totalRounds ||
    settingsStatus !== draft.status;

  function downloadSampleCsv() {
    const headers = ['Number', 'Full Name', 'Rating', 'LL Age', 'Previous Manager', 'Notes', 'Coach Kid', 'Round', 'Team Name'];
    const sampleRows = [
      ['1', 'John Smith', '9.5', '12', 'Coach Jones', 'Strong arm', 'No', '', ''],
      ['2', 'Jane Doe', '8.0', '11', '', 'Fast runner', 'No', '', ''],
      ['3', 'Mike Johnson', '7.5', '10', 'Coach Smith', '', 'Yes', '2', 'Giants'],
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'player-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

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
            <a
              href={`/draft/${draft.accessKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition"
            >
              {baseUrl}/draft/{draft.accessKey}
            </a>
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

              {teams.length > 1 && (
                <p className="text-sm text-gray-500 mb-4">
                  Drag rows to reorder teams
                </p>
              )}

              {teams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No teams yet. Add teams to set the draft order.</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
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
                    <SortableContext items={teams.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {teams.map((team, index) => (
                          <SortableTeamRow
                            key={team.id}
                            team={team}
                            position={index + 1}
                            isEditing={editingTeam === team.id}
                            editCoachName={editCoachName}
                            editTeamName={editTeamName}
                            useCustomTeamName={useCustomTeamName}
                            onEditCoachName={setEditCoachName}
                            onEditTeamName={setEditTeamName}
                            onToggleCustomName={() => {
                              setUseCustomTeamName(!useCustomTeamName);
                              setEditTeamName('');
                            }}
                            onStartEdit={() => startEditingTeam(team)}
                            onSaveEdit={() => saveTeamEdit(team.id)}
                            onCancelEdit={() => setEditingTeam(null)}
                            onRemove={() => removeTeam(team.id)}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </DndContext>
              )}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-6">
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

            {/* Import Players */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Import Players</h2>

              {/* Import result message */}
              {importResult && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  Import complete: {importResult.added} added
                  {importResult.updated > 0 && `, ${importResult.updated} updated`}
                  {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
                </div>
              )}

              {/* Import action selector */}
              {players.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Import Mode</label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setImportAction('replace')}
                      className={`py-1.5 px-3 rounded-lg text-sm font-medium transition ${
                        importAction === 'replace'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Replace All
                    </button>
                    <button
                      onClick={() => setImportAction('addNew')}
                      className={`py-1.5 px-3 rounded-lg text-sm font-medium transition ${
                        importAction === 'addNew'
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Add New Only
                    </button>
                    <button
                      onClick={() => setImportAction('update')}
                      className={`py-1.5 px-3 rounded-lg text-sm font-medium transition ${
                        importAction === 'update'
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Update Existing
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {importAction === 'replace' && 'Deletes all existing players and imports fresh'}
                    {importAction === 'addNew' && 'Only adds players that don\'t already exist (by name)'}
                    {importAction === 'update' && 'Updates existing players by name, adds new ones'}
                  </p>
                </div>
              )}

              {/* Import source tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setImportSource('paste')}
                  className={`py-2 px-4 rounded-lg font-medium transition ${
                    importSource === 'paste'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  Paste from Google Sheets
                </button>
                <button
                  onClick={() => setImportSource('file')}
                  className={`py-2 px-4 rounded-lg font-medium transition ${
                    importSource === 'file'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  Upload CSV File
                </button>
              </div>

              {/* Preview Diff */}
              {showPreview && previewDiff && previewStats && (
                <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Import Preview</h3>
                    <div className="flex gap-4 text-sm">
                      {previewStats.add > 0 && (
                        <span className="text-green-600 font-medium">+{previewStats.add} new</span>
                      )}
                      {previewStats.update > 0 && (
                        <span className="text-blue-600 font-medium">{previewStats.update} updated</span>
                      )}
                      {previewStats.delete > 0 && (
                        <span className="text-red-600 font-medium">-{previewStats.delete} deleted</span>
                      )}
                      {previewStats.skip > 0 && (
                        <span className="text-gray-500">{previewStats.skip} unchanged</span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewDiff.filter(d => d.type !== 'skip').map((entry, idx) => (
                          <tr key={idx} className={
                            entry.type === 'add' ? 'bg-green-50' :
                            entry.type === 'update' ? 'bg-blue-50' :
                            entry.type === 'delete' ? 'bg-red-50' : ''
                          }>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                entry.type === 'add' ? 'bg-green-100 text-green-800' :
                                entry.type === 'update' ? 'bg-blue-100 text-blue-800' :
                                entry.type === 'delete' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {entry.type === 'add' ? 'Add' : entry.type === 'update' ? 'Update' : entry.type === 'delete' ? 'Delete' : 'Skip'}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-medium">{entry.player.fullName}</td>
                            <td className="px-3 py-2 text-gray-600">
                              {entry.type === 'add' && (
                                <span>#{entry.player.rankingNumber} {entry.player.isCoachKid && '(Coach Kid)'}</span>
                              )}
                              {entry.type === 'update' && entry.changes && (
                                <span className="text-xs">
                                  {entry.changes.map((c: any, i: number) => (
                                    <span key={c.field}>
                                      {i > 0 && ', '}
                                      <span className="font-medium">{c.field}</span>: {String(c.from ?? '—')} → {String(c.to ?? '—')}
                                    </span>
                                  ))}
                                </span>
                              )}
                              {entry.type === 'delete' && (
                                <span className="text-red-600">Will be removed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 border-t flex justify-end gap-3">
                    <button
                      onClick={cancelPreview}
                      className="py-2 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      disabled={importing}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {importing ? 'Importing...' : 'Confirm Import'}
                    </button>
                  </div>
                </div>
              )}

              {!showPreview && (
                <>
                  {importSource === 'paste' ? (
                    <div className="space-y-4">
                      <textarea
                        value={pasteData}
                        onChange={(e) => setPasteData(e.target.value)}
                        placeholder="Select your data in Google Sheets (including header row) and paste here..."
                        className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                          Paste directly from Google Sheets (tab-separated) or CSV format
                        </p>
                        <button
                          onClick={handlePreview}
                          disabled={!pasteData.trim() || importing}
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {importing ? 'Loading...' : 'Preview Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-4 items-center">
                        <label className="flex-1 flex items-center gap-3">
                          <span className="py-2 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition cursor-pointer">
                            Choose File
                          </span>
                          <span className="text-sm text-gray-600">
                            {csvFile ? csvFile.name : 'No file selected'}
                          </span>
                          <input
                            type="file"
                            accept=".csv,.tsv,.txt"
                            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={handlePreview}
                          disabled={!csvFile || importing}
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {importing ? 'Loading...' : 'Preview Changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Expected columns: Number, Full Name, Rating, LL Age, Previous Manager, Notes, Coach Kid, Round, Team Name
                </p>
                <button
                  onClick={downloadSampleCsv}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Download Sample CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Draft Settings</h2>
            <div className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <input
                  type="text"
                  value={settingsDivision}
                  onChange={(e) => setSettingsDivision(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Majors, AAA, AA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={settingsYear}
                  onChange={(e) => setSettingsYear(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Rounds</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={settingsRounds}
                  onChange={(e) => setSettingsRounds(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={settingsStatus}
                  onChange={(e) => setSettingsStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="setup">Setup</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Key</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 bg-gray-100 rounded-lg font-mono text-sm">
                    {draft.accessKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${baseUrl}/draft/${draft.accessKey}`);
                    }}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t">
                <button
                  onClick={saveSettings}
                  disabled={!settingsChanged || savingSettings}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingSettings ? 'Saving...' : 'Save Changes'}
                </button>
                {settingsChanged && (
                  <span className="ml-3 text-sm text-amber-600">You have unsaved changes</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
