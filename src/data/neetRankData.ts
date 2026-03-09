// NEET PG Marks vs Rank mapping (midpoint of ranges)
export interface RankRange {
  marksMin: number;
  marksMax: number;
  rankMin: number;
  rankMax: number;
}

export const NEET_PG_RANK_TABLE: RankRange[] = [
  { marksMin: 701, marksMax: 800, rankMin: 1, rankMax: 20 },
  { marksMin: 691, marksMax: 700, rankMin: 20, rankMax: 40 },
  { marksMin: 681, marksMax: 690, rankMin: 40, rankMax: 90 },
  { marksMin: 671, marksMax: 680, rankMin: 90, rankMax: 160 },
  { marksMin: 661, marksMax: 670, rankMin: 160, rankMax: 280 },
  { marksMin: 651, marksMax: 660, rankMin: 280, rankMax: 450 },
  { marksMin: 641, marksMax: 650, rankMin: 450, rankMax: 700 },
  { marksMin: 631, marksMax: 640, rankMin: 700, rankMax: 1000 },
  { marksMin: 621, marksMax: 630, rankMin: 1000, rankMax: 1500 },
  { marksMin: 611, marksMax: 620, rankMin: 1500, rankMax: 2200 },
  { marksMin: 601, marksMax: 610, rankMin: 2200, rankMax: 3000 },
  { marksMin: 591, marksMax: 600, rankMin: 3000, rankMax: 4000 },
  { marksMin: 581, marksMax: 590, rankMin: 4000, rankMax: 4501 },
  { marksMin: 571, marksMax: 580, rankMin: 4500, rankMax: 6401 },
  { marksMin: 561, marksMax: 570, rankMin: 6400, rankMax: 8000 },
  { marksMin: 551, marksMax: 560, rankMin: 8000, rankMax: 9800 },
  { marksMin: 541, marksMax: 550, rankMin: 9800, rankMax: 12000 },
  { marksMin: 531, marksMax: 540, rankMin: 12000, rankMax: 14000 },
  { marksMin: 521, marksMax: 530, rankMin: 14000, rankMax: 16500 },
  { marksMin: 511, marksMax: 520, rankMin: 16500, rankMax: 19000 },
  { marksMin: 501, marksMax: 510, rankMin: 19000, rankMax: 21500 },
  { marksMin: 491, marksMax: 500, rankMin: 21500, rankMax: 24500 },
  { marksMin: 481, marksMax: 490, rankMin: 24500, rankMax: 28000 },
  { marksMin: 471, marksMax: 480, rankMin: 28000, rankMax: 31000 },
  { marksMin: 461, marksMax: 470, rankMin: 31000, rankMax: 34500 },
  { marksMin: 451, marksMax: 460, rankMin: 34500, rankMax: 38500 },
  { marksMin: 441, marksMax: 450, rankMin: 38500, rankMax: 42000 },
  { marksMin: 431, marksMax: 440, rankMin: 42000, rankMax: 46000 },
  { marksMin: 421, marksMax: 430, rankMin: 46000, rankMax: 50000 },
  { marksMin: 411, marksMax: 420, rankMin: 50000, rankMax: 54500 },
  { marksMin: 401, marksMax: 410, rankMin: 54500, rankMax: 59000 },
  { marksMin: 391, marksMax: 400, rankMin: 59000, rankMax: 63500 },
  { marksMin: 381, marksMax: 390, rankMin: 63500, rankMax: 68500 },
  { marksMin: 371, marksMax: 380, rankMin: 68500, rankMax: 73000 },
  { marksMin: 361, marksMax: 370, rankMin: 73000, rankMax: 78500 },
  { marksMin: 351, marksMax: 360, rankMin: 78500, rankMax: 83500 },
  { marksMin: 341, marksMax: 350, rankMin: 83500, rankMax: 89000 },
  { marksMin: 331, marksMax: 340, rankMin: 89000, rankMax: 94500 },
  { marksMin: 321, marksMax: 330, rankMin: 94500, rankMax: 100000 },
  { marksMin: 311, marksMax: 320, rankMin: 100000, rankMax: 106000 },
  { marksMin: 301, marksMax: 310, rankMin: 106000, rankMax: 113000 },
  { marksMin: 291, marksMax: 300, rankMin: 113000, rankMax: 119000 },
  { marksMin: 281, marksMax: 290, rankMin: 119000, rankMax: 126000 },
  { marksMin: 271, marksMax: 280, rankMin: 126000, rankMax: 131000 },
  { marksMin: 261, marksMax: 270, rankMin: 132000, rankMax: 138000 },
  { marksMin: 251, marksMax: 260, rankMin: 139000, rankMax: 145000 },
  { marksMin: 0, marksMax: 250, rankMin: 146000, rankMax: 150000 },
];

export interface RankBracketInfo {
  bracket: string;
  opportunities: string;
  impact: string;
}

export const RANK_BRACKET_INFO: RankBracketInfo[] = [
  {
    bracket: 'Top 1,000',
    opportunities: 'Radiology, Dermatology, General Medicine at AIIMS, PGI, MAMC',
    impact: 'Early specialization, strong academic exposure, top residency programs',
  },
  {
    bracket: '1,000–5,000',
    opportunities: 'General Medicine, Pediatrics, Psychiatry, MS Ophthalmology at good govt colleges',
    impact: 'Quality + location flexibility; strong academics',
  },
  {
    bracket: '5,000–10,000',
    opportunities: 'Clinical branches in peripheral govt or reputable private colleges, DNB options',
    impact: 'Strategic compromise between college vs branch',
  },
  {
    bracket: '10,000–20,000',
    opportunities: 'Para-clinical, non-clinical subjects, DNB in hospitals',
    impact: 'Better infrastructure via DNB; limited clinical options',
  },
  {
    bracket: '20,000–50,000',
    opportunities: 'Management/state quota, non-clinical paths, DNB-FNB',
    impact: 'Clinical options highly limited; academic & non-clinical paths',
  },
  {
    bracket: 'Above 50,000',
    opportunities: 'Non-clinical branches, DNB-FNB, state-management seats',
    impact: 'Consider alternative exams (INI-CET) or a drop year',
  },
];

export function predictRank(marks: number): { rankMin: number; rankMax: number; bracket: RankBracketInfo } {
  const entry = NEET_PG_RANK_TABLE.find(r => marks >= r.marksMin && marks <= r.marksMax)
    || NEET_PG_RANK_TABLE[NEET_PG_RANK_TABLE.length - 1];

  // Interpolate within the range
  const marksRange = entry.marksMax - entry.marksMin || 1;
  const fraction = (marks - entry.marksMin) / marksRange;
  const rankRange = entry.rankMax - entry.rankMin;
  const interpolatedRankMax = Math.round(entry.rankMax - fraction * rankRange);
  const interpolatedRankMin = Math.max(1, interpolatedRankMax - Math.round(rankRange * 0.1));

  // Determine bracket
  let bracket: RankBracketInfo;
  const midRank = (interpolatedRankMin + interpolatedRankMax) / 2;
  if (midRank <= 1000) bracket = RANK_BRACKET_INFO[0];
  else if (midRank <= 5000) bracket = RANK_BRACKET_INFO[1];
  else if (midRank <= 10000) bracket = RANK_BRACKET_INFO[2];
  else if (midRank <= 20000) bracket = RANK_BRACKET_INFO[3];
  else if (midRank <= 50000) bracket = RANK_BRACKET_INFO[4];
  else bracket = RANK_BRACKET_INFO[5];

  return { rankMin: interpolatedRankMin, rankMax: interpolatedRankMax, bracket };
}
