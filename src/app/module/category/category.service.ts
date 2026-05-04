import { prisma } from "../../lib/prisma";

const createCategory = async (payload: { name: string; description?: string }) => {
    return await prisma.eventCategory.create({ data: payload });
};

const getAllCategories = async () => {
    return await prisma.eventCategory.findMany();
};

export const CategoryService = {
    createCategory,
    getAllCategories
};
