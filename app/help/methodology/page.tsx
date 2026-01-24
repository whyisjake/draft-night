import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Draft Methodology - Draft Night Help',
  description: 'Learn the methodology behind Draft Night, why key decisions were made, and best practices for running a successful Little League draft.',
};

export default function MethodologyPage() {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Draft Methodology</h1>

      <p className="text-lg text-gray-600 mb-8">
        Draft Night was built from over a decade of experience running Little League drafts. This guide
        explains the philosophy behind the system, why certain decisions were made, and how to run the
        most successful draft for your league.
      </p>

      <div className="space-y-12">
        {/* Philosophy */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Philosophy</h2>
          <p className="text-gray-600 mb-4">
            A good draft system should:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>Be fair</strong> - Every coach should have equal opportunity to build a competitive team</li>
            <li><strong>Be transparent</strong> - Everyone can see what's happening in real-time</li>
            <li><strong>Be efficient</strong> - Minimize dead time and keep the draft moving</li>
            <li><strong>Be flexible</strong> - Handle the inevitable mistakes and special situations</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Draft Night is designed around these principles, automating the tedious parts while keeping
            humans in control of the important decisions.
          </p>
        </section>

        {/* Why Snake Draft */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Snake Draft Order?</h2>
          <p className="text-gray-600 mb-4">
            Draft Night uses <strong>snake draft order</strong> (also called "serpentine"), where the pick
            direction reverses each round:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm mb-4">
            <div>Round 1: Team 1 → Team 2 → Team 3 → ... → Team 8</div>
            <div>Round 2: Team 8 → Team 7 → Team 6 → ... → Team 1</div>
            <div>Round 3: Team 1 → Team 2 → Team 3 → ... → Team 8</div>
            <div className="text-gray-500">...and so on</div>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Why this matters:</strong> In a straight draft (same order every round), the team picking
            last is always at a disadvantage. Snake order balances this - if you pick last in Round 1, you
            pick first in Round 2.
          </p>
          <p className="text-gray-600">
            Over a 12-round draft, snake order ensures that no team is consistently picking from a depleted
            player pool. The math works out to be remarkably fair.
          </p>
        </section>

        {/* Draft Position */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Determining Draft Position</h2>
          <p className="text-gray-600 mb-4">
            How you assign draft positions matters. Common approaches:
          </p>
          <div className="space-y-4 ml-4">
            <div>
              <h3 className="font-medium text-gray-900">Random Draw (Recommended)</h3>
              <p className="text-gray-600 text-sm">
                Use Draft Night's "Randomize Order" button to assign positions fairly. Do this with coaches
                present so everyone sees it's random.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Inverse of Last Season</h3>
              <p className="text-gray-600 text-sm">
                Teams that finished lower last year pick earlier. Helps balance competition over time.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Based on Coach Kids</h3>
              <p className="text-gray-600 text-sm">
                Some leagues give later picks to coaches with stronger pre-assigned players. This requires
                careful judgment but can improve parity.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Whatever method you choose, document it and apply it consistently.
              Transparency builds trust.
            </p>
          </div>
        </section>

        {/* Player Ratings */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Player Ratings & Rankings</h2>
          <p className="text-gray-600 mb-4">
            Draft Night supports both <strong>ratings</strong> (numeric scores, often from tryouts) and
            <strong> rankings</strong> (ordered list position). Here's how to use them effectively:
          </p>
          <div className="space-y-4 ml-4">
            <div>
              <h3 className="font-medium text-gray-900">Ratings (e.g., 7.5 out of 10)</h3>
              <p className="text-gray-600 text-sm">
                Best when you have objective tryout scores. Multiple players can have the same rating.
                Good for comparing players at similar skill levels.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Rankings (e.g., #1, #2, #3)</h3>
              <p className="text-gray-600 text-sm">
                Forces a strict order. Useful when the league or player agent has created a consensus ranking.
                Every player has a unique position.
              </p>
            </div>
          </div>
          <p className="text-gray-600 mt-4">
            <strong>Our recommendation:</strong> Use ratings from tryouts as the primary data, but don't
            obsess over small differences. A 7.3 and a 7.5 are essentially the same player - other factors
            like age, coachability, and team needs matter too.
          </p>
        </section>

        {/* Coach Kids */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Handling Coach Kids</h2>
          <p className="text-gray-600 mb-4">
            Pre-assigned players (typically coaches' children) are one of the trickiest parts of youth
            sports drafts. Draft Night handles this with the <strong>pre-assignment system</strong>:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Mark players as pre-assigned to specific teams before the draft</li>
            <li>Optionally specify which round they "count as" being drafted</li>
            <li>When the draft starts, they're automatically placed on their teams</li>
            <li>The draft skips those slots, keeping everything fair</li>
          </ul>
          <h3 className="font-medium text-gray-900 mt-6 mb-2">Best Practices for Coach Kids</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>
              <strong>Assign rounds based on ability</strong> - A highly-rated coach kid should count as
              an early-round pick. A lower-rated one should count as a later round.
            </li>
            <li>
              <strong>Be consistent</strong> - Apply the same criteria to all coach kids, not just some.
            </li>
            <li>
              <strong>Consider siblings</strong> - Many leagues allow sibling requests. Handle these like
              coach kids when appropriate.
            </li>
            <li>
              <strong>Document everything</strong> - Before the draft, publish which players are pre-assigned
              and to which rounds. No surprises.
            </li>
          </ul>
        </section>

        {/* The Draft Day */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Running Draft Day</h2>
          <p className="text-gray-600 mb-4">
            A well-run draft day makes all the difference. Here's our recommended approach:
          </p>

          <h3 className="font-medium text-gray-900 mt-6 mb-2">Before the Draft</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Import and verify all player data at least a day before</li>
            <li>Set up all teams and confirm coach names</li>
            <li>Pre-assign all coach kids with their designated rounds</li>
            <li>Share the coach access link with all coaches</li>
            <li>Test that the link works and coaches can see the draft</li>
          </ul>

          <h3 className="font-medium text-gray-900 mt-6 mb-2">During the Draft</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>
              <strong>Use the timer</strong> - 60 seconds per pick keeps things moving. Reset it when
              there's a legitimate discussion, but don't let picks drag on.
            </li>
            <li>
              <strong>Project the board</strong> - If drafting in person, put the draft board on a big
              screen. Use the "Expand" player list view.
            </li>
            <li>
              <strong>Announce picks clearly</strong> - Even with real-time updates, verbally announce
              each pick: "Dodgers select John Smith."
            </li>
            <li>
              <strong>Handle mistakes immediately</strong> - If someone picks the wrong player, use Undo
              right away. Don't wait.
            </li>
            <li>
              <strong>Take breaks</strong> - For long drafts (12+ rounds), take a 5-minute break every
              4-5 rounds. Coaches need to regroup and reassess.
            </li>
          </ul>

          <h3 className="font-medium text-gray-900 mt-6 mb-2">After the Draft</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Review the final board with all coaches present</li>
            <li>Handle any last-minute trades if your league allows them</li>
            <li>Move undrafted players to the next division's draft if applicable</li>
            <li>Save/screenshot the final results for your records</li>
          </ul>
        </section>

        {/* Multi-Division Strategy */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Multi-Division Strategy</h2>
          <p className="text-gray-600 mb-4">
            Most leagues have multiple divisions (Majors, AAA, AA, etc.). Here's the recommended approach:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-3 ml-4">
            <li>
              <strong>Draft oldest division first</strong> - Start with Majors, then AAA, then AA.
              This is the natural player flow.
            </li>
            <li>
              <strong>Import division-specific players</strong> - Each draft starts with players
              eligible for that division.
            </li>
            <li>
              <strong>Move undrafted players down</strong> - After Majors, import undrafted players
              into AAA using "Import from Another Draft."
            </li>
            <li>
              <strong>Adjust ratings if needed</strong> - A player who wasn't drafted in Majors might
              be a top prospect in AAA. Consider adjusting ratings to reflect this.
            </li>
            <li>
              <strong>Track the source</strong> - Draft Night automatically notes where imported
              players came from, so coaches know their history.
            </li>
          </ol>
        </section>

        {/* Common Pitfalls */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Common Pitfalls to Avoid</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-medium text-gray-900">Not testing before draft day</h3>
              <p className="text-gray-600 text-sm">
                Always do a dry run. Make sure your data imported correctly, coaches can access the
                link, and you know how all the features work.
              </p>
            </div>
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-medium text-gray-900">Inconsistent coach kid handling</h3>
              <p className="text-gray-600 text-sm">
                If one coach kid counts as Round 2 and another equivalent player counts as Round 5,
                coaches will notice and trust erodes.
              </p>
            </div>
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-medium text-gray-900">No time limits</h3>
              <p className="text-gray-600 text-sm">
                Without a timer, drafts drag on for hours. Coaches lose focus, kids get antsy, and
                mistakes increase. Use the 60-second timer.
              </p>
            </div>
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-medium text-gray-900">Last-minute player additions</h3>
              <p className="text-gray-600 text-sm">
                Adding players during the draft causes confusion. Set a firm deadline for roster
                finalization before draft day.
              </p>
            </div>
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-medium text-gray-900">Not having a backup plan</h3>
              <p className="text-gray-600 text-sm">
                Internet goes down? Have the player list printed. Key person can't make it? Have a
                designated backup who knows the system.
              </p>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Signs of a Successful Draft</h2>
          <p className="text-gray-600 mb-4">
            You'll know you ran a good draft when:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>No coach feels they were treated unfairly</li>
            <li>The draft finishes in a reasonable time (aim for 2-3 hours max)</li>
            <li>Few or no corrections were needed after the fact</li>
            <li>Coaches comment on how smooth the process was</li>
            <li>Teams end up reasonably balanced (no obvious super-teams)</li>
          </ul>
          <p className="text-gray-600 mt-4">
            The goal isn't perfection - it's a fair process that everyone trusts. Draft Night gives you
            the tools; your preparation and execution make it successful.
          </p>
        </section>
      </div>

      {/* Next Steps */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ready to Get Started?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/help/getting-started" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Getting Started Guide →</h3>
            <p className="text-sm text-gray-600">Step-by-step setup instructions</p>
          </Link>
          <Link href="/help/player-management" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Player Management →</h3>
            <p className="text-sm text-gray-600">Import players and set up coach kids</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
