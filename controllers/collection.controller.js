const { Collection, ProductCollection } = require("../models/association");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
module.exports = {
  createCollections: asyncHandler(async (req, res, next) => {
    try {
      const collections = req.body.collections;

      if (!Array.isArray(collections) || collections.length === 0) {
        return res.status(400).json({ message: "Invalid collection data" });
      }
      const collectionTitles = collections.map((item) => item.title);

      // Check existing collections in DB
      const existingCollections = await Collection.findAll({
        where: { title: { [Op.in]: collectionTitles } },
        attributes: ["title"],
      });

      const existingTitles = existingCollections.map(
        (collection) => collection.title
      );

      // Filter out duplicates and include thumbnails
      const newCollections = collections.filter(
        (item) => !existingTitles.includes(item.title)
      );

      if (newCollections.length > 0) {
        await Collection.bulkCreate(newCollections); // Now includes title + thumbnail
      }

      res.status(201).json({
        message: "Collections added successfully",
      });
    } catch (error) {
      next(error); // Passes error to error-handling middleware
    }
  }),
};
