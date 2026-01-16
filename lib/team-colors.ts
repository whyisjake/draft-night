// MLB team colors (primary background, text color)
export const MLB_TEAM_COLORS: Record<string, { bg: string; text: string }> = {
  'Angels': { bg: '#BA0021', text: 'white' },
  'Astros': { bg: '#EB6E1F', text: 'white' },
  'Athletics': { bg: '#003831', text: '#EFB21E' },
  'Blue Jays': { bg: '#134A8E', text: 'white' },
  'Braves': { bg: '#CE1141', text: 'white' },
  'Brewers': { bg: '#12284B', text: '#B6922E' },
  'Cardinals': { bg: '#C41E3A', text: 'white' },
  'Cubs': { bg: '#0E3386', text: 'white' },
  'Diamondbacks': { bg: '#A71930', text: '#E3D4AD' },
  'Dodgers': { bg: '#005A9C', text: 'white' },
  'Giants': { bg: '#FD5A1E', text: 'black' },
  'Guardians': { bg: '#00385D', text: '#E50022' },
  'Mariners': { bg: '#0C2C56', text: '#C4CED4' },
  'Marlins': { bg: '#00A3E0', text: 'black' },
  'Mets': { bg: '#002D72', text: '#FF5910' },
  'Nationals': { bg: '#AB0003', text: 'white' },
  'Orioles': { bg: '#DF4601', text: 'black' },
  'Padres': { bg: '#2F241D', text: '#FFC425' },
  'Phillies': { bg: '#E81828', text: 'white' },
  'Pirates': { bg: '#27251F', text: '#FDB827' },
  'Rangers': { bg: '#003278', text: '#C0111F' },
  'Rays': { bg: '#092C5C', text: '#8FBCE6' },
  'Red Sox': { bg: '#BD3039', text: 'white' },
  'Reds': { bg: '#C6011F', text: 'white' },
  'Rockies': { bg: '#333366', text: '#C4CED4' },
  'Royals': { bg: '#004687', text: '#BD9B60' },
  'Tigers': { bg: '#0C2340', text: '#FA4616' },
  'Twins': { bg: '#002B5C', text: '#D31145' },
  'White Sox': { bg: '#27251F', text: 'white' },
  'Yankees': { bg: '#003087', text: 'white' },
};

export function getTeamColors(teamName: string | null | undefined): { bg: string; text: string } | null {
  if (!teamName) return null;
  return MLB_TEAM_COLORS[teamName] || null;
}
