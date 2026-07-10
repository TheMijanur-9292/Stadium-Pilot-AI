import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AIService {
  private ai: GoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    this.ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async getResponse(
    message: string,
    user: any,
    history: any[] = [],
    clientMemory: any = null,
    page: string = 'General Chat',
    venueId?: string,
  ) {
    const model = this.ai.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    // 1. Fetch User details
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    const role = dbUser?.role || user.role;
    const fullName = dbUser?.fullName || user.fullName;
    const preferredLanguage =
      clientMemory?.language || dbUser?.preferredLanguage || 'English';
    const accessibilityPreference =
      clientMemory?.accessibility || dbUser?.accessibilityPreference || 'None';

    // 2. Fetch Stadium / Venue Context
    let targetVenue;
    if (venueId) {
      targetVenue = await this.prisma.venue.findUnique({
        where: { id: venueId },
        include: {
          facilities: true,
          foodVendors: true,
          emergencyPoints: true,
          transportationHubs: true,
          crowdZones: true,
        },
      });
    } else {
      const venues = await this.prisma.venue.findMany({
        include: {
          facilities: true,
          foodVendors: true,
          emergencyPoints: true,
          transportationHubs: true,
          crowdZones: true,
        },
      });
      targetVenue = venues[0];
    }

    const announcements = await this.prisma.announcement.findMany();

    // 3. Format Context Strings for Prompt Builder
    const venueContext = targetVenue
      ? `Venue Name: ${targetVenue.stadiumName} located in ${targetVenue.city}, ${targetVenue.country}. Capacity: ${targetVenue.capacity}.`
      : 'No venue context available.';

    const facilitiesContext = targetVenue?.facilities?.length
      ? targetVenue.facilities
          .map(
            (f) =>
              `- Facility: ${f.name} (${f.type}) on ${f.floor}, Location: ${f.location}`,
          )
          .join('\n')
      : 'No facilities registered.';

    const concessionsContext = targetVenue?.foodVendors?.length
      ? targetVenue.foodVendors
          .map(
            (v) =>
              `- Vendor: ${v.name} (Category: ${v.category}, Price Range: ${v.priceRange}, Halal: ${v.halal ? 'Yes' : 'No'}, Veg: ${v.vegetarian ? 'Yes' : 'No'}, Vegan: ${v.vegan ? 'Yes' : 'No'})`,
          )
          .join('\n')
      : 'No food vendors registered.';

    const emergencyContext = targetVenue?.emergencyPoints?.length
      ? targetVenue.emergencyPoints
          .map(
            (ep) =>
              `- Emergency Help Point: ${ep.type} at Location: ${ep.location}`,
          )
          .join('\n')
      : 'No emergency points registered.';

    const transportContext = targetVenue?.transportationHubs?.length
      ? targetVenue.transportationHubs
          .map(
            (t) => `- Transportation Hub: ${t.type} located at ${t.location}`,
          )
          .join('\n')
      : 'No transport hubs registered.';

    const crowdContext = targetVenue?.crowdZones?.length
      ? targetVenue.crowdZones
          .map(
            (cz) =>
              `- Crowd Zone Section: ${cz.section}. Congestion Level: ${cz.crowdLevel}`,
          )
          .join('\n')
      : 'No crowd zone density monitors registered.';

    const announcementsContext = announcements.length
      ? announcements
          .map(
            (a) =>
              `- Announcement: "${a.title}" (${a.description}) [Priority: ${a.priority}]`,
          )
          .join('\n')
      : 'No announcements active.';

    const historyContext = history.length
      ? history
          .slice(-6)
          .map((h) => `${h.sender === 'user' ? 'User' : 'Copilot'}: ${h.text}`)
          .join('\n')
      : 'No previous conversation history.';

    // 4. Construct Prompt using Prompt Builder Pattern
    const prompt = this.buildPrompt({
      role,
      fullName,
      page,
      preferredLanguage,
      accessibilityPreference,
      venueContext,
      facilitiesContext,
      concessionsContext,
      emergencyContext,
      transportContext,
      crowdContext,
      announcementsContext,
      historyContext,
      question: message,
    });

    try {
      const result = await model.generateContent(prompt);
      let textResponse = result.response.text().trim();

      // Sanitize potential markdown fences
      if (textResponse.startsWith('```json')) {
        textResponse = textResponse.substring(7);
      }
      if (textResponse.endsWith('```')) {
        textResponse = textResponse.substring(0, textResponse.length - 3);
      }
      textResponse = textResponse.trim();

      const parsedJSON = JSON.parse(textResponse);

      return {
        response: parsedJSON,
        text: parsedJSON.summary, // Fallback text compatibility
        priority: parsedJSON.warnings?.length > 0 ? 'Important' : 'Normal',
        role,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Gemini Execution Error:', error);
      return {
        response: {
          title: 'System Diagnostics Warning',
          summary:
            'The operations assistant failed to process the request structure. Please restate your query.',
          recommendations: ['Retry your inquiry shortly'],
          warnings: ['Service connection interruption'],
          estimatedTime: 'N/A',
          nextSteps: ['Reload assistant session'],
        },
        text: 'Connection interruption',
        priority: 'Important',
        role,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private buildPrompt(inputs: {
    role: string;
    fullName: string;
    page: string;
    preferredLanguage: string;
    accessibilityPreference: string;
    venueContext: string;
    facilitiesContext: string;
    concessionsContext: string;
    emergencyContext: string;
    transportContext: string;
    crowdContext: string;
    announcementsContext: string;
    historyContext: string;
    question: string;
  }): string {
    return `You are StadiumPilot AI, a highly specialized, intelligent Stadium Operations Copilot built specifically for the FIFA World Cup 2026.
You are not a generic chatbot. You must never act like ChatGPT. You are a dedicated, context-aware digital assistant deployed inside stadium venues.

--- OUTPUT FORMAT SPECIFICATION ---
You MUST respond with a raw JSON object matching this schema:
{
  "title": "A short, descriptive action title (e.g. Navigation Dispatch, Diet Recommendation, Emergency Action)",
  "summary": "A concise, scannable summary paragraph of the response (DO NOT use long paragraphs, write in the selected language)",
  "recommendations": [
    "A concise recommendations bullet item in the selected language",
    "Another recommendations bullet item"
  ],
  "warnings": [
    "Any security/safety warnings or congestion alerts if applicable (e.g. Critical congestion in Section 112)"
  ],
  "estimatedTime": "Estimated duration (e.g. 5 minutes, 15 minutes wait time, N/A)",
  "nextSteps": [
    "Immediate action step 1",
    "Immediate action step 2"
  ]
}

--- SYSTEM RULES & GROUNDING ---
1. You must respond differently depending on the logged-in user's role and request.
   - FAN: Friendly, helpful, simple, short. gate finding, restroom/prayer room, medical center, concessions recommendations (halal, vegan, veg), match FAQ, post-match transit, parking, weather.
   - VOLUNTEER: Professional, clear, action-oriented. task guidance, shift coordinates, lost-and-found protocol, crowd assistance, emergency SOPs.
   - ORGANIZER: Executive, analytical, data-driven. crowd insights, gate congestion, staff allocation, transit bottlenecks.
   - VENUE_STAFF: Professional, concise. maintenance checklist, cleaning SOPs, equipment coordinates.
2. Translate all text values inside the JSON response (title, summary, recommendations, warnings, nextSteps) into the preferred language: ${inputs.preferredLanguage}. The JSON keys must remain strictly in English.
3. If information is unavailable, clearly state your assumptions instead of hallucinating details. Never invent emergency phone numbers.
4. If the question implies a safety hazard, collapse, fire, lost child, or security issue, immediately prioritize user safety, provide a first-step rescue action, list nearest help point, and elevate warnings.

--- CONTEXTUAL META INFORMATION ---
- User: ${inputs.fullName}
- Active Role: ${inputs.role}
- Current Page: ${inputs.page}
- Preferred Language: ${inputs.preferredLanguage}
- Accessibility Preference: ${inputs.accessibilityPreference}

--- REAL-TIME STADIUM OPERATIONS CONTEXT ---
[VENUE INFO]
${inputs.venueContext}

[VENUE FACILITIES]
${inputs.facilitiesContext}

[CONCESSIONS VENDORS]
${inputs.concessionsContext}

[EMERGENCY & FIRST AID POINTS]
${inputs.emergencyContext}

[TRANSIT OPTIONS]
${inputs.transportContext}

[CROWD CONGESTION MONITORS]
${inputs.crowdContext}

[BROADCAST ANNOUNCEMENTS]
${inputs.announcementsContext}

[RECENT CONVERSATION HISTORY]
${inputs.historyContext}

--- USER REQUEST ---
User Question: ${inputs.question}
Output in JSON:`;
  }
}
