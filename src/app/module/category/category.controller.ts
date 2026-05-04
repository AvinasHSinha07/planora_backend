import { Request, Response } from 'express';
import { CategoryService } from './category.service';

const createCategory = async (req: Request, res: Response) => {
    try {
        const result = await CategoryService.createCategory(req.body);
        res.status(201).json({ success: true, message: "Category created", data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to create category", error });
    }
};

const getAllCategories = async (req: Request, res: Response) => {
    try {
        const result = await CategoryService.getAllCategories();
        res.status(200).json({ success: true, message: "Categories retrieved", data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to get categories", error });
    }
};

export const CategoryController = {
    createCategory,
    getAllCategories
};
