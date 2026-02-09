import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MenuService {
  async getMenuByRestaurant(restaurantId: string) {
    return prisma.menuCategory.findMany({
      where: { restaurantId },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getMenuItem(id: string) {
    return prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    image?: string;
    preparationTime?: number;
    calories?: number;
    allergens?: string[];
    isAvailable?: boolean;
  }) {
    return prisma.menuItem.create({
      data,
    });
  }

  async updateMenuItem(id: string, data: any) {
    return prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  async deleteMenuItem(id: string) {
    return prisma.menuItem.delete({
      where: { id },
    });
  }

  async createCategory(data: {
    name: string;
    description?: string;
    restaurantId: string;
    sortOrder?: number;
  }) {
    return prisma.menuCategory.create({
      data,
    });
  }

  async updateCategory(id: string, data: any) {
    return prisma.menuCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return prisma.menuCategory.delete({
      where: { id },
    });
  }
}