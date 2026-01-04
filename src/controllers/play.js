const Play = require("../models/Play");

const selectors =
  "_id title description likes rating starred thumbnail_url stream_url genre";

const getPlays = async (req, res) => {
  try {
    const livePlays = await Play.find({ is_live: true })
      .select(selectors)
      .lean();

    const topLikedPlays = await Play.find({})
      .sort({ likes: -1 })
      .limit(10)
      .select(selectors)
      .lean();

    const topStarredPlays = await Play.find({})
      .sort({ starred: -1 })
      .limit(10)
      .select(selectors)
      .lean();

    const topRatedPlays = await Play.find({})
      .sort({ rating: -1 })
      .limit(10)
      .select(selectors)
      .lean();

    res.json({
      live: livePlays,
      top_liked: topLikedPlays,
      top_starred: topStarredPlays,
      top_rated: topRatedPlays,
    });
  } catch (error) {
    console.error("Error fetching plays:", error);
    res.status(500).json({ message: "Failed to fetch plays" });
  }
};
