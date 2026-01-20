'use client';

import { useState, useMemo, useEffect } from 'react';
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
      <td className="px-3 md:px-4 py-2 md:py-3 text-sm font-bold text-gray-900">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
            title="Drag to reorder"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
          {position}
        </div>
      </td>
      <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-900">
        {isEditing ? (
          <input
            type="text"
            value={editCoachName}
            onChange={(e) => onEditCoachName(e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        ) : (
          <span className="truncate block max-w-[120px] sm:max-w-none">{team.coachNames}</span>
        )}
      </td>
      <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-500">
        {isEditing ? (
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            {useCustomTeamName ? (
              <input
                type="text"
                value={editTeamName}
                onChange={(e) => onEditTeamName(e.target.value)}
                placeholder="Custom name"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
            ) : (
              <select
                value={editTeamName}
                onChange={(e) => onEditTeamName(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm"
              >
                <option value="">Select...</option>
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
      <td className="px-3 md:px-4 py-2 md:py-3 text-sm">
        <div className="flex gap-2 sm:gap-3">
          {isEditing ? (
            <>
              <button onClick={onSaveEdit} className="text-green-600 hover:text-green-800 text-xs sm:text-sm">
                Save
              </button>
              <button onClick={onCancelEdit} className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={onStartEdit} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm">
                Edit
              </button>
              <button onClick={onRemove} className="text-red-600 hover:text-red-800 text-xs sm:text-sm">
                Remove
              </button>
            </>
          )}
        </div>
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
  const [importAction, setImportAction] = useState<'replace' | 'addNew' | 'update'>('update');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; updated: number; skipped: number } | null>(null);
  const [previewDiff, setPreviewDiff] = useState<any[] | null>(null);
  const [previewStats, setPreviewStats] = useState<{ add: number; update: number; delete: number; skip: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editCoachName, setEditCoachName] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [useCustomTeamName, setUseCustomTeamName] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayerRating, setEditingPlayerRating] = useState<string>('');
  const [editingPlayerRanking, setEditingPlayerRanking] = useState<string>('');
  const [editingPlayerRound, setEditingPlayerRound] = useState<string>('');
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [sortBy, setSortBy] = useState<'ranking' | 'name' | 'rating' | 'age' | 'pitchCount'>('ranking');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Settings form state (year and rounds as strings for clean editing)
  const [settingsLeague, setSettingsLeague] = useState(draft.league || '');
  const [settingsDivision, setSettingsDivision] = useState(draft.division);
  const [settingsYear, setSettingsYear] = useState(String(draft.year));
  const [settingsRounds, setSettingsRounds] = useState(String(draft.totalRounds));
  const [settingsStatus, setSettingsStatus] = useState(draft.status);
  const [savingSettings, setSavingSettings] = useState(false);

  // Collaborators state
  interface CollaboratorInfo {
    id: string;
    userId: string;
    userName: string | null;
    userEmail: string;
    userImage: string | null;
    createdAt: Date | null;
  }
  const [collaboratorsList, setCollaboratorsList] = useState<CollaboratorInfo[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const [collaboratorError, setCollaboratorError] = useState<string | null>(null);

  // Sort players based on current sort settings
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0); // Higher rating first by default
          break;
        case 'age':
          comparison = (b.llAge || 0) - (a.llAge || 0); // Older first by default
          break;
        case 'pitchCount':
          comparison = (b.pitchCount || 0) - (a.pitchCount || 0); // Higher count first by default
          break;
        case 'ranking':
        default:
          comparison = (a.rankingNumber || 999) - (b.rankingNumber || 999); // Lower ranking first
          break;
      }
      // Apply sort direction
      if (sortDirection === 'desc' && sortBy !== 'rating' && sortBy !== 'age' && sortBy !== 'pitchCount') {
        comparison = -comparison;
      } else if (sortDirection === 'asc' && (sortBy === 'rating' || sortBy === 'age' || sortBy === 'pitchCount')) {
        comparison = -comparison;
      }
      // Secondary sort by name if primary values are equal
      if (comparison === 0) {
        comparison = a.fullName.localeCompare(b.fullName);
      }
      return comparison;
    });
  }, [players, sortBy, sortDirection]);

  function handleSort(column: 'ranking' | 'name' | 'rating' | 'age' | 'pitchCount') {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  }

  function getSortIndicator(column: 'ranking' | 'name' | 'rating' | 'age' | 'pitchCount') {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

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

  function openPlayerModal(player: Player) {
    setSelectedPlayer(player);
    setEditingPlayerRating(player.rating?.toString() || '');
    setEditingPlayerRanking(player.rankingNumber?.toString() || '');
    setEditingPlayerRound(player.coachKidRound?.toString() || '');
  }

  async function savePlayerEdits() {
    if (!selectedPlayer) return;
    setSavingPlayer(true);

    const updates: { rating?: number | null; rankingNumber?: number | null; coachKidRound?: number | null } = {};

    const newRating = editingPlayerRating.trim() ? parseFloat(editingPlayerRating) : null;
    const newRanking = editingPlayerRanking.trim() ? parseInt(editingPlayerRanking, 10) : null;
    const newRound = editingPlayerRound.trim() ? parseInt(editingPlayerRound, 10) : null;

    if (newRating !== selectedPlayer.rating) {
      updates.rating = newRating;
    }
    if (newRanking !== selectedPlayer.rankingNumber) {
      updates.rankingNumber = newRanking;
    }
    if (newRound !== selectedPlayer.coachKidRound) {
      updates.coachKidRound = newRound;
    }

    if (Object.keys(updates).length === 0) {
      setSavingPlayer(false);
      return;
    }

    const res = await fetch(`/api/drafts/${draft.id}/players/${selectedPlayer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const updated = await res.json();
      setPlayers(players.map((p) => (p.id === selectedPlayer.id ? updated : p)));
      setSelectedPlayer(updated);
    }
    setSavingPlayer(false);
  }

  async function assignPlayerToTeam(playerId: string, teamId: string | null) {
    const res = await fetch(`/api/drafts/${draft.id}/players/${playerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachKidTeamId: teamId }),
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

  const preAssignedPlayers = players.filter((p) => p.coachKidTeamId);
  const [baseUrl, setBaseUrl] = useState('');

  // Set baseUrl on client side only to avoid hydration mismatch
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // Fetch collaborators
  useEffect(() => {
    async function fetchCollaborators() {
      const res = await fetch(`/api/drafts/${draft.id}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaboratorsList(data);
      }
    }
    fetchCollaborators();
  }, [draft.id]);

  async function addCollaborator() {
    if (!newCollaboratorEmail.trim()) return;
    setAddingCollaborator(true);
    setCollaboratorError(null);

    const res = await fetch(`/api/drafts/${draft.id}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newCollaboratorEmail.trim() }),
    });

    if (res.ok) {
      const newCollab = await res.json();
      setCollaboratorsList([...collaboratorsList, newCollab]);
      setNewCollaboratorEmail('');
    } else {
      const error = await res.json();
      setCollaboratorError(error.error || 'Failed to add collaborator');
    }
    setAddingCollaborator(false);
  }

  async function removeCollaborator(collaboratorId: string) {
    const res = await fetch(`/api/drafts/${draft.id}/collaborators?collaboratorId=${collaboratorId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setCollaboratorsList(collaboratorsList.filter((c) => c.id !== collaboratorId));
    }
  }

  async function saveSettings() {
    setSavingSettings(true);
    const res = await fetch(`/api/drafts/${draft.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        league: settingsLeague || null,
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
    settingsLeague !== (draft.league || '') ||
    settingsDivision !== draft.division ||
    parseInt(settingsYear, 10) !== draft.year ||
    parseInt(settingsRounds, 10) !== draft.totalRounds ||
    settingsStatus !== draft.status;

  function downloadSampleCsv() {
    const headers = [
      'Full Name',
      'Draft Scores',
      'Little League Age (Baseball)',
      'What team did you play for last year?',
      'Previous Coach',
      'Will the player be on a swim team this year?',
      'Will this player be on another sports team or participating in another activity during the baseball/softball season?',
      'Will the player be available for 80% of baseball / softball?',
      'Teammate Request',
      'Special Player Request',
      'Coach Kid',
      'Round',
      'Team Name',
    ];
    const sampleRows = [
      ['John Smith', '85.5', '12', 'Giants', 'Coach Jones', 'No', 'No', 'Yes', 'Mike Johnson', '', 'No', '', ''],
      ['Jane Doe', '78.0', '11', 'Orioles', 'Coach Brown', 'Yes', 'Yes', 'Yes', '', 'Prefers outfield', 'No', '', ''],
      ['Mike Johnson', '72.5', '12', 'Cardinals', 'Coach Smith', 'No', 'No', 'Yes', 'John Smith', '', 'Yes', '2', 'Giants'],
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
    <main className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm">
              &larr; Back to drafts
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {draft.league && <span className="text-gray-500">{draft.league} </span>}
              {draft.year} {draft.division} Draft
            </h1>
            <p className="text-gray-600 text-sm md:text-base">Setup and configuration</p>
          </div>
          <div className="flex gap-2 sm:gap-4">
            {draft.status !== 'setup' && (
              <Link
                href={`/admin/drafts/${draft.id}/run`}
                className="bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:bg-green-700 transition text-sm sm:text-base"
              >
                Go to Draft
              </Link>
            )}
            {draft.status === 'setup' && (
              <button
                onClick={startDraft}
                className="bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:bg-green-700 transition text-sm sm:text-base"
              >
                Start Draft
              </button>
            )}
          </div>
        </div>

        {/* Access Key */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-6">
          <p className="text-sm text-blue-800 break-all">
            <strong>Coach View URL:</strong>{' '}
            <a
              href={`/draft/${draft.accessKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition inline-block mt-1 sm:mt-0"
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
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4">Teams & Draft Order</h2>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
                <input
                  type="text"
                  value={newCoachName}
                  onChange={(e) => setNewCoachName(e.target.value)}
                  placeholder="Coach name(s)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && addTeam()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={addTeam}
                    className="flex-1 sm:flex-none bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base whitespace-nowrap"
                  >
                    Add Team
                  </button>
                  <button
                    onClick={randomizeOrder}
                    className="flex-1 sm:flex-none bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
                    disabled={teams.length < 2}
                  >
                    Randomize
                  </button>
                </div>
              </div>

              {teams.length > 1 && (
                <p className="text-sm text-gray-500 mb-4">
                  Drag rows to reorder teams
                </p>
              )}

              {teams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No teams yet. Add teams to set the draft order.</p>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            <span className="hidden sm:inline">Draft </span>#
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Coach<span className="hidden sm:inline">(es)</span>
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Team
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            {players.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-3 md:p-4 border-b">
                  <h2 className="text-lg md:text-xl font-semibold">Players ({players.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('name')}
                        >
                          Name{getSortIndicator('name')}
                        </th>
                        <th
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('rating')}
                        >
                          Rating{getSortIndicator('rating')}
                        </th>
                        <th
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('age')}
                        >
                          Age{getSortIndicator('age')}
                        </th>
                        <th
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('pitchCount')}
                          title="2025 Season Pitch Count"
                        >
                          Pitches{getSortIndicator('pitchCount')}
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prev Team</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prev Coach</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase" title="Swim Team">Swim</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase" title="Available 80%">Avail</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teammate Req</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pre-Assign Team</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedPlayers.map((player) => (
                        <tr
                          key={player.id}
                          onClick={() => openPlayerModal(player)}
                          className={`cursor-pointer hover:bg-gray-100 ${player.coachKidTeamId ? 'bg-green-50 hover:bg-green-100' : ''} ${player.swimTeam ? 'border-l-4 border-l-blue-400' : ''}`}
                          title="Click to view details"
                        >
                          <td className="px-3 py-2 text-sm font-medium">
                            {player.fullName}
                            {player.specialRequest && (
                              <span className="ml-1 text-amber-500" title={player.specialRequest}>*</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">{player.rating?.toFixed(2) || '-'}</td>
                          <td className="px-3 py-2 text-sm">{player.llAge || '-'}</td>
                          <td className="px-3 py-2 text-sm">{player.pitchCount || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-600 max-w-32 truncate" title={player.previousTeam || undefined}>
                            {player.previousTeam || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 max-w-32 truncate" title={player.previousManager || undefined}>
                            {player.previousManager || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {player.swimTeam ? (
                              <span className="text-blue-600 font-medium">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {player.availability80 === false ? (
                              <span className="text-red-600 font-medium">No</span>
                            ) : (
                              <span className="text-green-600">Yes</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 max-w-40 truncate" title={player.teammateRequest || undefined}>
                            {player.teammateRequest || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={player.coachKidTeamId || ''}
                              onChange={(e) => assignPlayerToTeam(player.id, e.target.value || null)}
                              className={`px-2 py-1 border rounded text-sm ${
                                player.coachKidTeamId ? 'border-green-300 bg-green-50' : 'border-gray-300'
                              }`}
                            >
                              <option value="">-</option>
                              {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                  {team.coachNames}{team.name ? ` (${team.name})` : ''}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pre-Assigned Players Summary */}
            {preAssignedPlayers.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                <h3 className="font-semibold text-green-800 mb-2 text-sm md:text-base">Pre-Assigned Players ({preAssignedPlayers.length})</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  {preAssignedPlayers.map((p) => {
                    const team = teams.find((t) => t.id === p.coachKidTeamId);
                    return (
                      <li key={p.id}>
                        {p.fullName}
                        {p.coachKidRound && ` - Round ${p.coachKidRound}`}
                        {team && ` → ${team.coachNames}${team.name ? ` (${team.name})` : ''}`}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Import Players */}
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
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
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <button
                  onClick={() => setImportSource('paste')}
                  className={`py-2 px-4 rounded-lg font-medium transition text-sm sm:text-base ${
                    importSource === 'paste'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  Paste from Sheets
                </button>
                <button
                  onClick={() => setImportSource('file')}
                  className={`py-2 px-4 rounded-lg font-medium transition text-sm sm:text-base ${
                    importSource === 'file'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  Upload CSV
                </button>
              </div>

              {/* Preview Diff */}
              {showPreview && previewDiff && previewStats && (
                <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 md:px-4 py-3 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Import Preview</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-sm">
                      {previewStats.add > 0 && (
                        <span className="text-green-600 font-medium">+{previewStats.add} to add</span>
                      )}
                      {previewStats.update > 0 && (
                        <span className="text-blue-600 font-medium">{previewStats.update} to update</span>
                      )}
                      {previewStats.delete > 0 && (
                        <span className="text-red-600 font-medium">-{previewStats.delete} to delete</span>
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
                                <span>#{entry.player.rankingNumber} {entry.player.coachKidTeamId && '(Pre-assigned)'}</span>
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
                  Supports: Full Name, Draft Scores/Rating, LL Age, Previous Coach, Previous Team, Swim Team, Teammate Request, etc.
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
                <label className="block text-sm font-medium text-gray-700 mb-1">League</label>
                <input
                  type="text"
                  value={settingsLeague}
                  onChange={(e) => setSettingsLeague(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Walnut Creek Little League"
                />
              </div>
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

              {/* Collaborators Section */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">Collaborators</label>
                <p className="text-sm text-gray-500 mb-3">
                  Collaborators can sign in and edit player notes on the coach view.
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="email"
                    value={newCollaboratorEmail}
                    onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCollaborator()}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addCollaborator}
                    disabled={addingCollaborator || !newCollaboratorEmail.trim()}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingCollaborator ? 'Adding...' : 'Add'}
                  </button>
                </div>
                {collaboratorError && (
                  <p className="text-sm text-red-600 mb-3">{collaboratorError}</p>
                )}
                {collaboratorsList.length > 0 ? (
                  <ul className="space-y-2">
                    {collaboratorsList.map((collab) => (
                      <li
                        key={collab.id}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {collab.userImage && (
                            <img
                              src={collab.userImage}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span className="text-sm">
                            {collab.userName || collab.userEmail}
                          </span>
                          {collab.userName && (
                            <span className="text-xs text-gray-500">({collab.userEmail})</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCollaborator(collab.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No collaborators added yet.</p>
                )}
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

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{selectedPlayer.fullName}</h2>
              <button
                onClick={() => setSelectedPlayer(null)}
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
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editingPlayerRating}
                    onChange={(e) => setEditingPlayerRating(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="-"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">LL Age</label>
                  <p className="text-lg font-semibold mt-1 px-3 py-2">{selectedPlayer.llAge || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Ranking #</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editingPlayerRanking}
                    onChange={(e) => setEditingPlayerRanking(e.target.value.replace(/\D/g, ''))}
                    className="w-full mt-1 px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="-"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Pre-Assigned</label>
                  <p className="text-lg font-semibold mt-1 px-3 py-2">
                    {selectedPlayer.coachKidTeamId ? (
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
                    <p className="text-sm">{selectedPlayer.previousTeam || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Previous Coach</label>
                    <p className="text-sm">{selectedPlayer.previousManager || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Pitch Count</label>
                    <p className="text-sm font-medium">{selectedPlayer.pitchCount || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Availability</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Swim Team</label>
                    <p className={`text-sm font-medium ${selectedPlayer.swimTeam ? 'text-blue-600' : 'text-gray-600'}`}>
                      {selectedPlayer.swimTeam ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Other Sports</label>
                    <p className={`text-sm font-medium ${selectedPlayer.otherSports ? 'text-amber-600' : 'text-gray-600'}`}>
                      {selectedPlayer.otherSports ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">80% Available</label>
                    <p className={`text-sm font-medium ${selectedPlayer.availability80 === false ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedPlayer.availability80 === false ? 'No' : 'Yes'}
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
                    <p className="text-sm">{selectedPlayer.teammateRequest || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Special Request</label>
                    <p className="text-sm">{selectedPlayer.specialRequest || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedPlayer.notes && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedPlayer.notes}</p>
                </div>
              )}

              {/* Pre-Assignment */}
              {selectedPlayer.coachKidTeamId && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Pre-Assignment</h3>
                  <p className="text-sm text-green-600 font-medium mb-3">
                    Assigned to: {teams.find((t) => t.id === selectedPlayer.coachKidTeamId)?.coachNames}
                    {teams.find((t) => t.id === selectedPlayer.coachKidTeamId)?.name
                      ? ` (${teams.find((t) => t.id === selectedPlayer.coachKidTeamId)?.name})`
                      : ''}
                  </p>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Draft Round</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editingPlayerRound}
                      onChange={(e) => setEditingPlayerRound(e.target.value.replace(/\D/g, ''))}
                      className="w-24 mt-1 px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="-"
                    />
                  </div>
                </div>
              )}

              {/* Draft Status */}
              {selectedPlayer.isDrafted && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Draft Status</h3>
                  <p className="text-sm text-green-600 font-medium">
                    Drafted in Round {selectedPlayer.roundDrafted}, Pick #{selectedPlayer.pickNumber}
                    {selectedPlayer.draftedByTeamId && (
                      <> by {teams.find((t) => t.id === selectedPlayer.draftedByTeamId)?.coachNames}</>
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="flex-1 py-2 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                onClick={savePlayerEdits}
                disabled={savingPlayer}
                className="flex-1 py-2 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {savingPlayer ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
