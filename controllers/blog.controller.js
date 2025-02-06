const asyncHandler = require("express-async-handler");
const {
  Blog,
  BlogDetail,
  BlogDetailTag,
  Tag,
} = require("../models/association");
const { Op } = require("sequelize");
module.exports = {
  createBLog: asyncHandler(async (req, res, next) => {
    try {
      const title = req.body.title;
      await Blog.create({ title: title });
      res.status(201).json({
        message: "BLog added successfully",
      });
    } catch (error) {
      throw error;
    }
  }),
  createBlogDetail: asyncHandler(async (req, res, next) => {
    try {
      const blog = await Blog.findOne({
        where: { slug: "tin-tuc" },
      });

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      const { content, thumbnail, title } = req.body.data;

      const rs = await blog.createBlogDetail({ content, thumbnail, title });

      res.status(201).json({
        message: "BlogDetail added successfully",
        rs,
      });
    } catch (error) {
      throw error;
    }
  }),
  getBlog: asyncHandler(async (req, res, next) => {
    try {
      const slug = req.params.slug;
      const blog = await Blog.findOne({
        where: { slug },
        attributes: { exclude: ["id", "updatedAt"] },
        include: [
          {
            model: BlogDetail, // Assuming your related model is BlogPost
            attributes: { exclude: ["id", "blog_id", "updatedAt"] },
          },
        ],
      });

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.status(201).json({
        message: "Get Blog Detail successfully",
        data: blog,
      });
    } catch (error) {
      throw error;
    }
  }),
  getBlogDetail: asyncHandler(async (req, res, next) => {
    try {
      const slug = req.params.slug;
      const blogDetail = await BlogDetail.findOne({
        where: { slug: slug },
      });

      if (!blogDetail) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.status(201).json({
        message: "Get Blog Detail successfully",
        data: blogDetail,
      });
    } catch (error) {
      throw error;
    }
  }),
};
