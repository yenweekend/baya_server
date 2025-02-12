const {
  Product,
  Image,
  ProductVariant,
  Attribute,
  AttributeValue,
  Vendor,
  Category,
  Collection,
} = require("../models/association");
const { Op } = require("sequelize");
const { sequelize } = require("../configs/postgreConn");
const asyncHandler = require("express-async-handler");
module.exports = {
  createProducts: asyncHandler(async (req, res, next) => {
    try {
      const products = req.body.products;
      for (const product of products) {
        try {
          let vendor = null;
          // Chỉ tìm hoặc tạo Vendor nếu có brandTitle
          if (product.brandTitle) {
            [vendor] = await Vendor.findOrCreate({
              where: { title: product.brandTitle },
            });
          }
          let [category] = await Category.findOrCreate({
            where: { slug: product.slug },
          });
          // Extract thumbnails
          const thumbnail = product.thumbnails[0] || null;
          const thumbnailM = product.thumbnails[1] || null;

          // Use association method `createProduct()` to create a product
          let newProduct;
          if (vendor) {
            // Nếu có vendor, tạo sản phẩm với vendor
            newProduct = await vendor.createProduct({
              title: product.title,
              price_original: product.price_original,
              thumbnail,
              thumbnailM,
            });
          } else {
            // Nếu không có vendor, tạo sản phẩm trực tiếp
            newProduct = await Product.create({
              title: product.title,
              price_original: product.price_original,
              thumbnail,
              thumbnailM,
            });
          }
          await category.addProduct(newProduct);
        } catch (error) {
          console.error(`Error creating product: ${product.title}`, error);
        }
      }
      // Send response after processing all products
      res.status(201).json({ message: "Products processed successfully" });
    } catch (error) {
      next(error); // Passes error to error-handling middleware
    }
  }),
  getProductDetail: asyncHandler(async (req, res, next) => {
    try {
      const slug = req.params.slug;
      const productDetail = await Product.findOne({
        where: { slug: slug },
      });
      if (!productDetail) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }
      // Send response after processing all products
      res
        .status(201)
        .json({ message: "Get product detail successfully", productDetail });
    } catch (error) {
      next(error); // Passes error to error-handling middleware
    }
  }),
  updateDescription: asyncHandler(async (req, res, next) => {
    try {
      const details = req.body.details;
      for (const product of details) {
        await Product.update(
          { description: product.description },
          { where: { title: product.title } }
        );
      }
      res.status(201).json({ message: "Update product detail successfully" });
    } catch (error) {
      next(error);
    }
  }),
  updateProductCategory: asyncHandler(async (req, res, next) => {
    try {
      const productsToUpdate = req.body.products;

      if (!Array.isArray(productsToUpdate) || productsToUpdate.length === 0) {
        return res
          .status(400)
          .json({ message: "Không có dữ liệu sản phẩm để cập nhật" });
      }

      for (const item of productsToUpdate) {
        try {
          // Tìm sản phẩm theo tên (title)
          const product = await Product.findOne({
            where: { title: item.title },
          });
          if (!product) {
            console.warn(`Không tìm thấy sản phẩm có tên: ${item.title}`);
            continue; // Bỏ qua nếu không tìm thấy
          }
          // Tìm danh mục theo tên
          const category = await Category.findOne({
            where: { slug: item.slug },
          });
          if (!category) {
            console.warn(`Không tìm thấy danh mục có tên: ${item.slug}`);
            continue; // Bỏ qua nếu không tìm thấy danh mục
          }
          await product.setCategories([category]); // Thay thế danh mục cũ
        } catch (err) {
          console.error(`Error creating product: ${item.title}`, err);
        }
      }
      res
        .status(200)
        .json({ message: "Cập nhật quan hệ sản phẩm - danh mục thành công" });
    } catch (error) {
      next(error);
    }
  }),
  addProductCollectionRelation: asyncHandler(async (req, res, next) => {
    try {
      const products = req.body.products;

      for (const product of products) {
        try {
          let vendor = null;
          // Chỉ tìm hoặc tạo Vendor nếu có brandTitle
          if (product.brandTitle) {
            [vendor] = await Vendor.findOrCreate({
              where: { title: product.brandTitle },
            });
          }
          let [collection] = await Collection.findOrCreate({
            where: { slug: product.slug },
          });
          // Extract thumbnails
          const thumbnail = product.thumbnails[0] || null;
          const thumbnailM = product.thumbnails[1] || null;

          // Use association method `createProduct()` to create a product
          let newProduct;
          if (vendor) {
            const existingProduct = await Product.findOne({
              where: {
                title: product.title,
                vendor_id: vendor.id,
              },
            });
            if (!existingProduct) {
              newProduct = await vendor.createProduct({
                title: product.title,
                price_original: product.price_original,
                thumbnail,
                thumbnailM,
              });
            } else {
              newProduct = existingProduct;
            }
          } else {
            // Nếu không có vendor, tạo sản phẩm trực tiếp
            newProduct = await Product.create({
              title: product.title,
              price_original: product.price_original,
              thumbnail,
              thumbnailM,
            });
          }
          await collection.addProduct(newProduct);
        } catch (error) {
          console.error(`Error creating product: ${product.title}`, error);
        }
      }
      // Send response after processing all products
      res.status(201).json({ message: "Products processed successfully" });
    } catch (error) {
      next(error); // Passes error to error-handling middleware
    }
  }),
  updateProductsThumbnails: asyncHandler(async (req, res, next) => {
    try {
      const products = req.body.products;
      for (const product of products) {
        try {
          const thumbnail = product.thumbnails[0];
          const thumbnailM = product.thumbnails[1];

          // Find the product using a specific identifier (like title or id)
          const existingProduct = await Product.findOne({
            where: { title: product.title }, // assuming you want to find by title
          });

          if (existingProduct) {
            // Update the found product with the new thumbnail values
            await Product.update(
              { thumbnail, thumbnailM },
              {
                where: { title: product.title },
              }
            );
          } else {
            console.log(`Product with title ${product.title} not found`);
          }
        } catch (error) {
          console.error(`Error updating product: ${product.title}`, error);
        }
      }

      res.status(201).json({ message: "Products processed successfully" });
    } catch (error) {
      next(error); // Passes error to error-handling middleware
    }
  }),
};
