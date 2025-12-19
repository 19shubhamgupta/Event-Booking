const page = require("../models/page.js");
const user = require("../models/user.js");

const getpage = async (req, res) => {
  try {
    const { id } = req.params;
    const currUser = await user.findById(req.user._id);
    const currPage = await page.findById(id);
    console.log(currPage.authorId, currUser.organizationId);

    if (currPage.authorId.toString() !== currUser.organizationId.toString())
      return res.status(403).json({ message: "Unauthorized Access" });

    return res.status(200).json(currPage);
  } catch (error) {
    console.log("Error fetching page:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

const Page = require("../models/page.js");

const createPage = async (req, res) => {
  try {
    const { title } = req.body;
    console.log("Create page for title:", title);

    let blocks;
    if (req.body.blocks === undefined) blocks = [];
    else blocks = req.body.blocks;
    console.log("Create page request body:", blocks);

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Generate unique slug
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let uniqueSlug = slug;
    let counter = 1;
    while (await Page.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const page = await Page.create({
      title,
      slug: uniqueSlug,
      authorId: req.user._id,
      blocks: blocks || [],
    });

    res.status(201).json({
      success: true,
      page,
    });
  } catch (error) {
    console.error("Create page error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPages = async (req, res) => {
  try {
    const pages = await Page.find({ authorId: req.user._id })
      .sort({ createdAt: -1 })
      .select("title slug published createdAt updatedAt");

    res.status(200).json({
      success: true,
      count: pages.length,
      pages,
    });
  } catch (error) {
    console.error("Get pages error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, blocks } = req.body;
    console.log("came in uodatePage : ", req.body);
    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    if (page.authorId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this page",
      });
    }

    if (title) page.title = title;
    if (blocks) page.blocks = blocks;

    await page.save();

    res.status(200).json({
      success: true,
      page,
    });
  } catch (error) {
    console.error("Update page error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    if (page.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this page",
      });
    }

    await page.deleteOne();

    res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error("Delete page error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const publishPage = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    if (page.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to publish this page",
      });
    }

    page.published = !page.published;
    await page.save();

    res.status(200).json({
      success: true,
      page,
      message: page.published ? "Page published" : "Page unpublished",
    });
  } catch (error) {
    console.error("Publish page error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPage,
  getPages,
  getpage,
  updatePage,
  deletePage,
  publishPage,
};
