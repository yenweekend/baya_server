const {
  Category,
  CategorySubCategory,
  Vendor,
  Product,
} = require("../models/association");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
module.exports = {
  getPaginatedCategoryProducts: asyncHandler(async (req, res, next) => {
    try {
      console.log(req.query);
      const { slug } = req.params;
      const currentPage = req.query.page || 1;
      const pageSize = req.query.pageSize || 30;
      const { sort, ...filters } = req.query;
      const offset = (currentPage - 1) * pageSize;

      // Tìm kiếm Category hoặc Subcategory theo slug
      const category = await Category.findOne({
        where: { slug },
        exclude: {
          attributes: ["createdAt", "updatedAt"],
        },
      });
      if (!category) {
        return res.status(404).json({ message: "Không tìm thấy danh mục" });
      }
      let order = [];
      if (sort) {
        const [field, direct] = sort.split("_");
        if (
          ["price", "title", "createdAt"].includes(field) &&
          ["asc", "desc"].includes(direct)
        ) {
          order.push([field, direct.toUpperCase()]); // Sequelize uses "ASC" or "DESC"
        }
      }
      let conditions = {};
      let vendorConditions = {};
      if (filters.price_range && Array.isArray(filters.price_range)) {
        const priceConditions = filters.price_range
          .map((range) => {
            //['gte_1000','betweeb_1000_2000']
            const parts = range.split("_");
            if (parts[0] === "gte") {
              return { price: { [Op.gte]: parseFloat(parts[1]) } };
            } else if (parts[0] === "lte") {
              return { price: { [Op.lte]: parseFloat(parts[1]) } };
            } else if (parts[0] === "between") {
              return {
                price: {
                  [Op.between]: [parseFloat(parts[1]), parseFloat(parts[2])],
                },
              };
            }
            return null;
          })
          .filter(Boolean); // Loại bỏ các phần tử `null`

        if (priceConditions.length > 0) {
          conditions[Op.or] = priceConditions;
        }
      }
      if (filters.vendor && Array.isArray(filters.vendor)) {
        vendorConditions = {
          title: {
            [Op.in]: filters.vendor,
          },
        };
      }
      let vendorIds = new Set();
      const subcategories = await category.getSubCategories({
        attributes: ["id"],
      });
      if (subcategories.length > 0) {
        const subCategoryIds = subcategories.map((sub) => sub.id);
        const allRows = await Product.findAll({
          attributes: { exclude: ["vendor_id", "id", "description"] },
          include: [
            {
              model: Vendor,
              attributes: ["id", "title", "url", "slug"],
            },
            {
              as: "categories",
              model: Category,
              where: { id: { [Op.in]: subCategoryIds } }, // Filter by category and subcategories
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
        });
        const { count, rows } = await Product.findAndCountAll({
          attributes: { exclude: ["vendor_id", "id", "description"] },
          where: conditions,
          include: [
            {
              model: Vendor,
              attributes: ["id", "title", "url", "slug"],
              where: vendorConditions,
            },
            {
              as: "categories",
              model: Category,
              where: { id: { [Op.in]: subCategoryIds } }, // Filter by category and subcategories
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
          limit: pageSize,
          offset: offset,
          order: order,
        });
        allRows.forEach((product) => {
          if (product.Vendor) vendorIds.add(product.Vendor.id);
        });
        const vendors = await Vendor.findAll({
          where: {
            id: {
              [Op.in]: [...vendorIds],
            },
          },
        });
        return res.status(201).json({
          vendors,
          products: rows,
          category,
          currentPage: currentPage,
          pageSize: pageSize,
          count: count,
          totalPage: Math.ceil(count / pageSize),
        });
      } else {
        const allRows = await Product.findAll({
          attributes: { exclude: ["vendor_id", "id", "description"] },
          include: [
            {
              model: Vendor,
              attributes: ["id", "title", "url", "slug"],
            },
            {
              as: "categories",
              model: Category,
              where: { id: { [Op.in]: category.id } }, // Filter by category and subcategories
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
        });
        const { count, rows } = await Product.findAndCountAll({
          attributes: { exclude: ["vendor_id", "id", "description"] },
          where: conditions,
          include: [
            {
              model: Vendor,
              attributes: ["title", "url", "slug"],
              where: vendorConditions,
            },
            {
              as: "categories",
              model: Category,
              where: { id: category.id }, // Filter by category and subcategories
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
          limit: pageSize,
          offset: offset,
          order: order,
        });
        allRows.forEach((product) => {
          if (product.Vendor) vendorIds.add(product.Vendor.id);
        });
        const vendors = await Vendor.findAll({
          where: {
            id: {
              [Op.in]: [...vendorIds],
            },
          },
        });
        return res.status(201).json({
          vendors,
          products: rows,
          category,
          currentPage: currentPage,
          pageSize: pageSize,
          count: count,
          totalPage: Math.ceil(count / pageSize),
        });
      }
    } catch (error) {
      next(error); // Passes error to error-handling middleware
    }
  }),
};
