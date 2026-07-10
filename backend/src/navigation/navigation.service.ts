import { Injectable } from '@nestjs/common';

@Injectable()
export class NavigationService {
  async calculateRoute(start: string, end: string) {
    // Standard mock routing algorithm for World Cup venues
    const walkingTime = Math.floor(Math.random() * 8) + 3; // 3-10 minutes
    const steps = [
      `Start at ${start}`,
      'Proceed through Level 1 Concourse',
      'Turn left at nearest facility junction',
      `Arrive at ${end}`,
    ];
    return {
      destination: end,
      walkingTime: `${walkingTime} minutes`,
      route: steps.join(' → '),
      accessibility: 'Wheelchair Friendly',
    };
  }
}
