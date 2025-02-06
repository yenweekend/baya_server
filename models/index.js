const User = require("./user");
const Product = require("./Product/product");
const Category = require("./Product/category");
const CategorySubCategory = require("./Product/category_subcategory");
const ProductCategory = require("./Product/product_category");
const Image = require("./Product/image");
const Gift = require("./Product/gift");
const ProductGift = require("./Product/product_gift");
const Attribute = require("./Product/attribute");
const AttributeValue = require("./Product/attribute_value");
const ProductVariant = require("./Product/product_variant");
const Collection = require("./Product/collection");
const Review = require("./Product/review");
const ReviewImage = require("./Product/review_image");

const Inventory = require("./Product/inventory");
const ProductVariantAttribute = require("./Product/product_variant_attribute");
const Vendor = require("./Product/vendor");
const Blog = require("./Blog/blog");
const BlogDetail = require("./Blog/blog_detail");
const BlogDetailTag = require("./Blog/blog_detail_tag");
const Tag = require("./Blog/tag");
const ProductCollection = require("./Product/product_collection");
module.exports = {
  ProductCollection,
  Vendor,
  User,
  Product,
  ProductCategory,
  Category,
  CategorySubCategory,
  Image,
  Gift,
  Attribute,
  AttributeValue,
  ProductVariant,
  ProductGift,
  Inventory,
  ProductVariantAttribute,
  Blog,
  BlogDetail,
  BlogDetailTag,
  Tag,
  Review,
  ReviewImage,
  Collection,
};
