const {
  ProductVariant,
  AttributeValue,
  Attribute,
  Brand,
  Product,
  ProductVariantAttribute,
  Image,
} = require("../models/association");
const { redis_hgetall } = require("./redis.service");
const asyncHandler = require("express-async-handler");
module.exports = {
  getAll: asyncHandler(async (req, res) => {
    const products = await Product.findAll({
      attributes: ["id", "name", "slug"],
      include: [
        {
          model: Brand,
          attributes: ["name"],
        },
        {
          model: Image,
          attributes: ["img_url"],
        },
        // judgment star
      ],
    });
    return products;
  }),
  getProductById: asyncHandler(async (id) => {
    const product = await Product.findOne({
      where: {
        id: id,
      },
    });
    return product;
  }),
  getProductBySlug: asyncHandler(async (slug) => {
    const productDetail = await Product.findOne({
      where: { slug: slug },
      include: [
        {
          model: ProductVariant,
          attributes: ["id", "sku", "retail_price", "thumbnail"],
        },
        {
          model: Brand,
          attributes: ["name", "slug"],
        },
        {
          model: Image,
          attributes: ["img_url"],
        },
      ],
    });
    const rs = await ProductVariant.findAll({
      where: {
        product_id: productDetail.id,
      },
      include: {
        model: AttributeValue,
        through: { attributes: [] }, // Exclude ProductVariantAttribute
        include: {
          model: Attribute,
        },
      },
    });
    const attributes = Object.values(
      rs
        .flatMap((item) => item.AttributeValues)
        .reduce((acc, attribute) => {
          const attrName = attribute.Attribute.name;
          const attrSlug = attribute.Attribute.slug;

          if (!acc[attrSlug]) {
            acc[attrSlug] = {
              id: attribute.Attribute.id,
              attributeName: attrName,
              attributeSlug: attrSlug,
              values: [],
            };
          }

          // Check for duplicates before adding
          if (
            !acc[attrSlug].values.some(
              (v) => v.id === attribute.id && v.value === attribute.value
            )
          ) {
            acc[attrSlug].values.push({
              id: attribute.id,
              value: attribute.value,
            });
          }

          return acc;
        }, {})
    );
    const variants = rs.map((item) => ({
      id: item.id,
      thumbnail: item.thumbnail,
      attributes: item.AttributeValues.reduce((acc, attr) => {
        acc[attr.Attribute.name] = attr.value;
        return acc;
      }, {}),
    }));
    return {
      productDetail: productDetail,
      variants: variants,
      attributes: attributes,
    };
  }),
};
