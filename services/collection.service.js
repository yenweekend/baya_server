const { Collection, Product, Vendor } = require("../models/association");
module.exports = {
  getProductCollectionBySlug: async (slug) => {
    const collection = await Collection.findOne({
      where: { slug: slug },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!collection) return null;

    // Fetch the limited products separately
    const products = await collection.getProducts({
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      include: [
        {
          model: Vendor,
          attributes: { exclude: ["id", "createdAt", "updatedAt"] },
        },
      ],
      through: { attributes: [] }, // Exclude join table attributes
      limit: 8, // Limit products to 8
    });
    return {
      ...collection.toJSON(),
      products, // Add the fetched products
    };
  },
};
