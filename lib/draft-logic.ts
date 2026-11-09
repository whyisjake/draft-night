export interface DraftPosition {
  round: number;
  pick: number; // Position within round (1-based, matches team draft position)
  overallPick: number; // Overall pick number across all rounds
}

/**
 * Calculate the next pick position in a snake draft
 * Odd rounds: 1 → totalTeams (forward)
 * Even rounds: totalTeams → 1 (reverse)
 */
export function getNextPick(
  currentRound: number,
  currentPick: number,
  totalTeams: number,
  totalRounds: number
): DraftPosition | null {
  const isForward = currentRound % 2 === 1;
  const currentOverall = calculateOverallPick(currentRound, currentPick, totalTeams);

  // Check if draft is complete
  if (currentRound > totalRounds) {
    return null;
  }

  let nextRound = currentRound;
  let nextPick = currentPick;

  if (isForward) {
    if (currentPick < totalTeams) {
      nextPick = currentPick + 1;
    } else {
      nextRound = currentRound + 1;
      // Stay at last position for snake
      nextPick = totalTeams;
    }
  } else {
    if (currentPick > 1) {
      nextPick = currentPick - 1;
    } else {
      nextRound = currentRound + 1;
      // Stay at first position for snake
      nextPick = 1;
    }
  }

  if (nextRound > totalRounds) {
    return null;
  }

  return {
    round: nextRound,
    pick: nextPick,
    overallPick: calculateOverallPick(nextRound, nextPick, totalTeams),
  };
}

/**
 * Calculate the overall pick number from round and pick position
 */
export function calculateOverallPick(
  round: number,
  pick: number,
  totalTeams: number
): number {
  const completedRounds = round - 1;
  const picksInCompletedRounds = completedRounds * totalTeams;
  const isForward = round % 2 === 1;

  if (isForward) {
    return picksInCompletedRounds + pick;
  } else {
    // In reverse rounds, pick 14 is first, pick 1 is last
    return picksInCompletedRounds + (totalTeams - pick + 1);
  }
}

/**
 * Get the team draft position that picks at a given overall pick number
 */
export function getTeamAtPick(overallPick: number, totalTeams: number): { round: number; teamPosition: number } {
  const round = Math.ceil(overallPick / totalTeams);
  const positionInRound = ((overallPick - 1) % totalTeams) + 1;
  const isForward = round % 2 === 1;

  const teamPosition = isForward ? positionInRound : totalTeams - positionInRound + 1;

  return { round, teamPosition };
}

/**
 * Generate the complete draft order for all rounds
 * Returns array of { round, pick, teamPosition, overallPick }
 */
export function generateDraftOrder(
  totalTeams: number,
  totalRounds: number
): Array<{ round: number; pick: number; teamPosition: number; overallPick: number }> {
  const order: Array<{ round: number; pick: number; teamPosition: number; overallPick: number }> = [];

  for (let round = 1; round <= totalRounds; round++) {
    const isForward = round % 2 === 1;

    for (let i = 0; i < totalTeams; i++) {
      const teamPosition = isForward ? i + 1 : totalTeams - i;
      const pickInRound = i + 1;
      const overallPick = (round - 1) * totalTeams + pickInRound;

      order.push({
        round,
        pick: pickInRound,
        teamPosition,
        overallPick,
      });
    }
  }

  return order;
}

/**
 * Calculate which round a player should be placed based on their ranking
 */
export function calculateRoundFromRanking(ranking: number, totalTeams: number): number {
  return Math.ceil(ranking / totalTeams);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Find the first open slot in a snake draft, starting at (round, pick).
 * A slot is "filled" when its team already has a drafted player in that round
 * (e.g. a pre-assigned coach kid). `pick` is the position within the round
 * (1..totalTeams), not the team's draft position.
 *
 * With `inclusive`, the starting slot itself is checked first; otherwise the
 * search begins at the slot after it. Returns round > totalRounds when no open
 * slot remains (draft complete).
 */
export function findNextOpenSlot(
  round: number,
  pick: number,
  options: {
    teams: Array<{ id: string; draftPosition: number }>;
    draftedPlayers: Array<{ isDrafted: boolean; draftedByTeamId: string | null; roundDrafted: number | null }>;
    totalRounds: number;
    inclusive?: boolean;
  }
): { round: number; pick: number } {
  const { teams, draftedPlayers, totalRounds, inclusive = false } = options;
  const totalTeams = teams.length;

  let nextRound = round;
  let nextPick = pick;
  let first = inclusive;

  while (true) {
    if (!first) {
      if (nextPick < totalTeams) {
        nextPick++;
      } else {
        nextRound++;
        nextPick = 1;
      }
    }
    first = false;

    if (nextRound > totalRounds) {
      return { round: nextRound, pick: nextPick };
    }

    const isForward = nextRound % 2 === 1;
    const teamPosition = isForward ? nextPick : totalTeams - nextPick + 1;
    const team = teams.find((t) => t.draftPosition === teamPosition);

    const filled = draftedPlayers.some(
      (p) => p.isDrafted && p.draftedByTeamId === team?.id && p.roundDrafted === nextRound
    );

    if (!filled) {
      return { round: nextRound, pick: nextPick };
    }
  }
}
