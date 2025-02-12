const asyncHandler = require("express-async-handler");
const {
  Blog,
  BlogDetail,
  BlogDetailTag,
  Tag,
  Collection,
  Product,
  Vendor,
  Category,
} = require("../models/association");
const {
  getProductCollectionBySlug,
} = require("../services/collection.service");
const { Op, where } = require("sequelize");
const { sequelize } = require("../configs/postgreConn");
module.exports = {
  getContent: asyncHandler(async (req, res) => {
    const kitchenCollection = await getProductCollectionBySlug("yeu-bep");
    const schoolCollection = await getProductCollectionBySlug("back-to-school");
    const latestCollection = await getProductCollectionBySlug("san-pham-moi");
    const sofaCategory = await Category.findOne({
      where: {
        slug: "sofa",
      },
    });
    const sofaProducts = await sofaCategory.getProducts();
    const showerCategory = await Category.findOne({
      where: { slug: "phong-tam" },
      exclude: {
        attributes: ["id", "createdAt", "updatedAt"],
      },
    });
    if (!showerCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    const subcategories = await showerCategory.getSubCategories();
    let showerProducts = null;
    if (subcategories.length > 0) {
      const allProducts = await Promise.all(
        subcategories.map(async (subcategory) => {
          const products = await subcategory.getProducts({
            attributes: { exclude: ["vendor_id", "id", "description"] },
            include: [
              {
                model: Vendor,
                attributes: ["title", "url", "slug"],
              },
            ],
            through: {
              attributes: [], // This ensures the join table attributes are not included
            },
          });
          return products;
        })
      );
      showerProducts = allProducts.flat();
    } else {
      const products = await Category.getProducts({
        attributes: { exclude: ["vendor_id", "id", "description"] },
        include: [
          {
            model: Vendor,
            attributes: ["title", "url", "slug"],
          },
        ],
        through: {
          attributes: [], // This ensures the join table attributes are not included
        },
      });
      showerProducts = products;
    }
    const blogs = await BlogDetail.findAll({
      include: {
        model: Blog,
        attributes: {
          exclude: ["id"],
        },
      },
      order: [["createdAt", "DESC"]], // Order by createdAt in descending order
      limit: 6, // Limit the results to 6
    });
    res.status(201).json({
      message: "Get Home Content Successfully",
      data: {
        kitchenCollection,
        schoolCollection,
        latestCollection,
        sofaProducts: sofaProducts,
        showerProducts: showerProducts,
        blogs: blogs,
      },
    });
  }),
  getSearch: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 15;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || "createdAt_asc";
    // Split the sort query into column and direction
    const [sortColumn, sortDirection] = sort.split("_"); // Example: 'title_asc' => ['title', 'asc']
    // Validate sortDirection, default to 'asc' if not provided or invalid
    const validDirections = ["asc", "desc"];
    const direction = validDirections.includes(sortDirection)
      ? sortDirection
      : "asc";

    // Dynamically build the ORDER BY clause
    const orderByClause = `p."${sortColumn}" ${direction.toUpperCase()}`;
    const searchKey = req.query.q;
    const results = await sequelize.query(
      `
      SELECT 
        p.url, 
        p.slug, 
        p.title, 
        p.thumbnail, 
        p."thumbnailM", 
        p.price, 
        p.price_original, 
        COUNT(*) OVER() AS total_count,
        v.title AS vendor_name,
        v.url as vendor_url,
        v.slug as vendor_slug
      FROM 
        product p
      JOIN 
        vendor v ON p.vendor_id = v.id
      WHERE 
        p.product_tsv @@ plainto_tsquery('english', :searchKey)
      ORDER BY ${orderByClause}
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { searchKey: searchKey, limit: limit, offset: offset },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const count = results.length > 0 ? results[0].total_count : 0;
    res.status(201).json({
      rows: results,
      count: parseInt(count),
    });
  }),
};
