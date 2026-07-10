import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const MOCK_ITEMS: Record<string, any[]> = {
  'Stadia Burgers': [
    {
      id: 'item-burger-1',
      name: 'Championship Cheeseburger',
      price: 12.99,
      description:
        'Flame-grilled Angus beef, cheddar, signature stadium sauce, toasted brioche.',
      isVegan: false,
      isGlutenFree: false,
    },
    {
      id: 'item-burger-2',
      name: 'World Cup Veggie Burger',
      price: 11.49,
      description: 'Plant-based patty, lettuce, tomato, vegan herb aioli.',
      isVegan: true,
      isGlutenFree: false,
    },
    {
      id: 'item-burger-3',
      name: 'Gold Medal Fries',
      price: 5.49,
      description: 'Crispy skin-on sea salt fries served with ketchup.',
      isVegan: true,
      isGlutenFree: true,
    },
  ],
  'Taco World Cup': [
    {
      id: 'item-taco-1',
      name: 'Street Taco Trio',
      price: 10.99,
      description:
        'Three double-corn tortilla tacos with cilantro, onion, salsa verde.',
      isVegan: false,
      isGlutenFree: true,
    },
    {
      id: 'item-taco-2',
      name: 'Spicy Jackfruit Taco',
      price: 9.99,
      description: 'Adobo-marinated jackfruit, cabbage slaw, chipotle crema.',
      isVegan: true,
      isGlutenFree: true,
    },
    {
      id: 'item-taco-3',
      name: 'Loaded Stadium Nachos',
      price: 8.99,
      description:
        'Warm tortilla chips, cheese sauce, black beans, jalapeños, pico de gallo.',
      isVegan: false,
      isGlutenFree: true,
    },
  ],
  'Green Corner': [
    {
      id: 'item-salad-1',
      name: 'Striker Caesar Salad',
      price: 11.99,
      description:
        'Crisp romaine, shaved parmesan, garlic croutons, Caesar dressing.',
      isVegan: false,
      isGlutenFree: false,
    },
    {
      id: 'item-salad-2',
      name: 'Superfood Quinoa Bowl',
      price: 13.49,
      description:
        'Quinoa, kale, avocado, sweet potato, edamame, lemon tahini dressing.',
      isVegan: true,
      isGlutenFree: true,
    },
    {
      id: 'item-salad-3',
      name: 'Fresh Fruit Cup',
      price: 4.99,
      description: 'Seasonal sliced melon, pineapple, berries, grapes.',
      isVegan: true,
      isGlutenFree: true,
    },
  ],
};

const DEFAULT_MOCK_ITEMS = [
  {
    id: 'item-default-1',
    name: 'Stadium Hot Dog',
    price: 6.99,
    description: 'Classic all-beef hot dog in a warm bun.',
    isVegan: false,
    isGlutenFree: false,
  },
  {
    id: 'item-default-2',
    name: 'Pretzel & Cheese',
    price: 5.99,
    description: 'Jumbo warm salted pretzel with melted cheese dip.',
    isVegan: false,
    isGlutenFree: false,
  },
  {
    id: 'item-default-3',
    name: 'Bottled Soda',
    price: 4.5,
    description: 'Chilled Pepsi, Diet Pepsi or Sierra Mist.',
    isVegan: true,
    isGlutenFree: true,
  },
];

function mapVendor(v: any) {
  const name = v.name;
  const items = MOCK_ITEMS[name] || DEFAULT_MOCK_ITEMS;

  let waitTimeMinutes = 8;
  if (name.includes('Taco')) waitTimeMinutes = 12;
  else if (name.includes('Green')) waitTimeMinutes = 5;

  let location = 'Concourse Section 112';
  if (name.includes('Taco')) location = 'Gate B Concourse';
  else if (name.includes('Green')) location = 'Concourse Section 104';

  return {
    id: v.id,
    venueId: v.venueId,
    name: v.name,
    category: v.category,
    priceRange: v.priceRange,
    halal: v.halal,
    vegetarian: v.vegetarian,
    vegan: v.vegan,
    location,
    cuisine: v.category,
    status: 'OPEN',
    waitTimeMinutes,
    items,
  };
}

@Injectable()
export class ConcessionsService {
  constructor(private prisma: PrismaService) {}

  async findVendors() {
    const dbVendors = await this.prisma.foodVendor.findMany();
    return dbVendors.map(mapVendor);
  }

  async findMenu(vendorId: string) {
    const vendor = await this.prisma.foodVendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return mapVendor(vendor).items;
  }

  async createOrder(data: {
    vendorId: string;
    items: { itemId: string; quantity: number }[];
  }) {
    const vendor = await this.prisma.foodVendor.findUnique({
      where: { id: data.vendorId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const mapped = mapVendor(vendor);
    const totalQuantity = data.items.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );
    const simulatedWaitTime = mapped.waitTimeMinutes + totalQuantity * 2;

    return {
      orderId: Math.floor(Math.random() * 900000) + 100000,
      vendorName: mapped.name,
      location: mapped.location,
      status: 'PREPARING',
      estimatedWaitMinutes: simulatedWaitTime,
      queueNumber: Math.floor(Math.random() * 30) + 1,
      createdAt: new Date().toISOString(),
    };
  }
}
