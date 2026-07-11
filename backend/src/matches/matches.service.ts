import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const MOCK_MATCHES = [
  {
    id: 'match-1',
    homeTeam: 'Argentina',
    awayTeam: 'France',
    date: new Date(Date.now() + 86400000).toISOString(),
    status: 'SCHEDULED',
    venue: 'MetLife Stadium',
    homeScore: 0,
    awayScore: 0,
  },
  {
    id: 'match-2',
    homeTeam: 'USA',
    awayTeam: 'Mexico',
    date: new Date().toISOString(),
    status: 'LIVE',
    venue: 'SoFi Stadium',
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: 'match-3',
    homeTeam: 'England',
    awayTeam: 'Germany',
    date: new Date(Date.now() + 172800000).toISOString(),
    status: 'SCHEDULED',
    venue: 'BC Place',
    homeScore: 0,
    awayScore: 0,
  },
];

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  private getStadium(matchId: number): string {
    const stadiums = [
      'MetLife Stadium (New York/New Jersey)',
      'SoFi Stadium (Los Angeles)',
      'Mercedes-Benz Stadium (Atlanta)',
      'AT&T Stadium (Dallas)',
      'Hard Rock Stadium (Miami)',
      'Arrowhead Stadium (Kansas City)',
      'NRG Stadium (Houston)',
      'BC Place (Vancouver)',
      'Lumen Field (Seattle)',
      'BMO Field (Toronto)',
      'Estadio Azteca (Mexico City)',
      'Estadio BBVA (Monterrey)',
      'Estadio Akron (Guadalajara)',
    ];
    return stadiums[matchId % stadiums.length];
  }

  async fetchLiveMatchesFromApi(): Promise<any[]> {
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;

    if (!apiKey || !apiHost) {
      return [];
    }

    // Try today's date first, then specific World Cup game dates to ensure data availability
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const datesToTry = [todayStr, '20260710', '20260709'];

    for (const dateVal of datesToTry) {
      try {
        const url = `https://${apiHost}/football-get-matches-by-date?date=${dateVal}`;
        const res = await fetch(url, {
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
          },
        });
        if (res.ok) {
          const json = await res.json();
          const matches = json.response?.matches || [];

          // World Cup Season/League ID in this API is 894789
          const wcMatches = matches.filter((m: any) => m.leagueId === 894789);
          if (wcMatches.length > 0) {
            return wcMatches.map((m: any) => {
              let status = 'SCHEDULED';
              if (m.status?.finished) {
                status = 'FINISHED';
              } else if (m.status?.started) {
                status = 'LIVE';
              }
              return {
                id: `api-${m.id}`,
                homeTeam: m.home.name,
                awayTeam: m.away.name,
                date: new Date(m.timeTS || Date.now()).toISOString(),
                status,
                venue: this.getStadium(m.id),
                stadiumName: this.getStadium(m.id),
                homeScore: m.home.score ?? 0,
                awayScore: m.away.score ?? 0,
              };
            });
          }
        }
      } catch (e) {
        console.error('Error fetching matches from RapidAPI:', e.message);
      }
    }
    return [];
  }

  async findAll() {
    const mappedMock = MOCK_MATCHES.map((m) => ({
      ...m,
      stadiumName: m.venue,
    }));
    try {
      const apiMatches = await this.fetchLiveMatchesFromApi();
      if (apiMatches.length > 0) {
        return [...apiMatches, ...mappedMock];
      }
    } catch (e) {
      console.error('Error in MatchesService.findAll:', e.message);
    }
    return mappedMock;
  }

  async findLive() {
    try {
      const apiMatches = await this.fetchLiveMatchesFromApi();
      const liveMatch = apiMatches.find((m) => m.status === 'LIVE');
      if (liveMatch) return liveMatch;
      if (apiMatches.length > 0) return apiMatches[0];
    } catch (e) {
      console.error('Error in MatchesService.findLive:', e.message);
    }
    const mockLive = MOCK_MATCHES[1];
    return { ...mockLive, stadiumName: mockLive.venue };
  }

  async findTicketsForUser(userId: string) {
    return [
      {
        id: 'ticket-demo-1',
        userId,
        matchId: 'match-2',
        seatSection: 'Sec 104',
        seatRow: 'Row H',
        seatNumber: 'Seat 14',
        scanned: false,
        match: MOCK_MATCHES[1],
      },
      {
        id: 'ticket-demo-2',
        userId,
        matchId: 'match-1',
        seatSection: 'Sec 224',
        seatRow: 'Row A',
        seatNumber: 'Seat 2',
        scanned: false,
        match: MOCK_MATCHES[0],
      },
    ];
  }

  async scanTicket(ticketId: string) {
    return {
      id: ticketId,
      seatSection: 'Sec 112',
      seatRow: 'Row F',
      seatNumber: 'Seat 10',
      scanned: true,
      match: MOCK_MATCHES[1],
      user: {
        fullName: 'Arthur Admin',
        email: 'admin@stadiumpilot.com',
      },
    };
  }
}
