# Draft Night

A real-time web application for managing Little League baseball drafts.

## The Story

After 10+ years of running Little League drafts with Google Sheets - copying cells, manually tracking snake draft order, and hoping the spreadsheet didn't break mid-draft - I decided to build something better.

Draft Night is the tool I wish I had all those years ago. It handles the snake draft logic automatically, pre-places coach kids in their assigned rounds, and lets all the coaches follow along in real-time without any risk of someone accidentally editing a cell.

Built by [Jake Spurlock](https://twitter.com/whyisjake).

## Features

- **Snake Draft Management** - Automatic turn order with snake draft logic (1-14, 14-1, repeat)
- **Coach Kid Auto-Placement** - Pre-assign coach kids to their rounds based on player rankings
- **Real-Time Updates** - Coaches can follow along live via a read-only view
- **60-Second Pick Timer** - Keep the draft moving with a countdown timer
- **Desktop Notifications** - Coaches can opt-in to alerts when picks are made
- **MLB Team Colors** - Assign team names with corresponding colors for visual distinction
- **CSV Import** - Import player lists from your existing spreadsheets
- **Inline Notes** - Edit player notes on the fly during the draft

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Real-time**: Server-Sent Events (SSE)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon database (free tier works great)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/whyisjake/draft-night.git
   cd draft-night
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Neon database URL and admin password.

4. Push the database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### For Draft Administrators

1. Log in at `/admin` with your admin password
2. Create a new draft (select division and year)
3. Add teams (coach names) and randomize the draft order
4. Import players via CSV
5. Assign coach kids to their teams
6. Start the draft and share the access key with coaches

### For Coaches

1. Get the access key from your draft administrator
2. Go to the draft URL (e.g., `yourdomain.com/draft/ACCESS_KEY`)
3. Click on a team column header to enable notifications for that team
4. Watch the draft unfold in real-time

## CSV Format

The player import expects these columns:
- `Number` - Player ranking (determines coach kid round placement)
- `Full Name` - Player's full name
- `Rating` - Player rating (optional)
- `LL Age` - Little League age (optional)
- `Previous Manager` - Last year's manager (optional)
- `Notes` - Any notes about the player (optional)
- `Coach Kid` - "Yes" if this is a coach's kid
- `Round` - Which round to auto-place the coach kid

## License

MIT

## Connect

- Twitter/X: [@whyisjake](https://twitter.com/whyisjake)
- Instagram: [@whyisjake](https://instagram.com/whyisjake)
