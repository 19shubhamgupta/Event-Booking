const event = require("../models/event");

exports.getUpcoming = async (req , res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit =10;
    if (page <= 0) page = 1;
    if (limit > 10 || limit <= 0) limit = 10;

    let skip = (page - 1) * limit;  // Fixed: multiply by limit
    const upEvents = await event
      .find({
        published: true,
        startDate: { $gte: new Date() },
      })
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination metadata
    const totalCount = await event.countDocuments({
      published: true,
      startDate: { $gte: new Date() },
    });
    
    return res.status(200).json({
      success: true,
      events: upEvents,
      pagination: {
        currentPage: page,
        limit: limit,
        totalEvents: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.log("error in discovering service while geting upEvents : ", error.message);
    return res.status(500).json({message : "Internal server error"})
  }
};


exports.getEventBycategory = async (req, res) => {
  try {
    const category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    console.log(`req came for ${category} and page no : ${page}`);

    if (category === "all") {
      // Find top 3 categories by event count, get 10 events from each
      const topCategories = await event.aggregate([
        {
          $match: {
            published: true,
            startDate: { $gte: new Date() },
          },
        },
        {
          // Group by category and count events
          $group: {
            _id: "$eventCategory",
            count: { $sum: 1 },
          },
        },
        {
          // Sort by count descending
          $sort: { count: -1 },
        },
        {
          // Get top 3 categories
          $limit: 3,
        },
      ]);

      if (topCategories.length === 0) {
        return res.status(200).json({
          success: true,
          categories: [],
          message: "No events found",
        });
      }

      // Get 10 events from each top category
      const categoryNames = topCategories.map((cat) => cat._id);
      const eventsPerCategory = await Promise.all(
        categoryNames.map(async (categoryName) => {
          const events = await event
            .find({
              eventCategory: categoryName,
              published: true,
              startDate: { $gte: new Date() },
            })
            .sort({ startDate: 1 })
            .limit(10);

          return {
            category: categoryName,
            count: topCategories.find((c) => c._id === categoryName).count,
            events: events,
          };
        })
      );

      return res.status(200).json({
        success: true,
        categories: eventsPerCategory,
        message: `Top 3 categories with most upcoming events`,
      });
    } else {
      // Get events for specific category with pagination
      const skip = (page - 1) * limit;
      
      const categoryEvents = await event
        .find({
          eventCategory: category,
          published: true,
          startDate: { $gte: new Date() },
        })
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const totalCount = await event.countDocuments({
        eventCategory: category,
        published: true,
        startDate: { $gte: new Date() },
      });

      return res.status(200).json({
        success: true,
        category: category,
        events: categoryEvents,
        pagination: {
          currentPage: page,
          limit: limit,
          totalEvents: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
        },
      });
    }
  } catch (error) {
    console.log(
      "error in discovery service while getting events by category: ",
      error.message
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
