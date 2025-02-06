const { Category, CategorySubCategory } = require("../models/association");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
module.exports = {
  getCategoryDetail: asyncHandler(async (req, res, next) => {
    try {
      const { slug } = req.params;
      // Tìm kiếm Category hoặc Subcategory theo slug
      const category = await Category.findOne({
        where: { slug },
      });
      if (!category) {
        return res.status(404).json({ message: "Không tìm thấy danh mục" });
      }
      const subcategories = await category.getSubCategories();
      if (subcategories.length > 0) {
        const allProducts = await Promise.all(
          subcategories.map(async (subcategory) => {
            const products = await subcategory.getProducts({
              attributes: { exclude: ["vendor_id", "id"] },
              joinTableAttributes: [],
            });
            return products;
          })
        );
        return res.status(201).json({ products: allProducts.flat() });
      } else {
        const products = await category.getProducts({
          attributes: { exclude: ["vendor_id", "id"] },
          joinTableAttributes: [],
        });
        return res.status(201).json({ products: products });
      }
    } catch (error) {
      next(error); // Passes error to error-handling middleware
    }
  }),
};
