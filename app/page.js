import { google } from 'googleapis';

async function getLeaderboardData() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const range = `Leaderboard!A2:H100`; // Adjust tab name to match your sheet
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range,
  });

  return response.data.values || [];
}

export default async function Leaderboard() {
  const data = await getLeaderboardData();

  // Your Rule: Sort by Score, then Cuts Made, then 4th golfer score
  const sortedData = data.sort((a, b) => {
    if (Number(a[7]) !== Number(b[7])) return Number(a[7]) - Number(b[7]); // Total Score
    if (Number(a[8]) !== Number(b[8])) return Number(b[8]) - Number(a[8]); // Cuts Made
    return Number(a[4]) - Number(b[4]); // 4th Golfer Score
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans">
      <header className="text-center py-8">
        <h1 className="text-4xl font-black italic text-emerald-400">PICK 6 MAJORS</h1>
        <p className="text-slate-400 mt-2">Live Tournament Standings</p>
      </header>

      <div className="max-w-4xl mx-auto bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-slate-300 text-sm uppercase">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Player</th>
              <th className="p-4 text-center">Cuts</th>
              <th className="p-4 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/50 transition">
                <td className="p-4 font-bold text-slate-500">{i + 1}</td>
                <td className="p-4">
                  <div className="font-bold">{row[0]}</div>
                  <div className="text-xs text-slate-500 uppercase">{row[1]}, {row[2]}...</div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${Number(row[8]) >= 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {row[8]}/6
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-xl font-bold text-emerald-400">
                  {row[7] > 0 ? `+${row[7]}` : row[7]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
