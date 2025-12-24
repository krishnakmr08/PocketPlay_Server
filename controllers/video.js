const Video = require("../models/Video");

const selectors =
  "_id title description likes rating starred thumbnail_url stream_url genre";
const getVideo = async (req, res) => {
  try {

    const liveVideo = await Video.find({ is_live: true })
      .select(selectors)
      .lean();

    const topLikedVideo = await Video.find({})
      .sort({ likes: -1 })
      .limit(10)
      .select(selectors)
      .lean();

    const topStarredVideo = await Video.find({})
      .sort({ starred: -1 })
      .limit(10)
      .select(selectors)
      .lean();

    const topRatedVideo = await Video.find({})
      .sort({ rating: -1 })
      .limit(10)
      .select(selectors)
      .lean();

    res.json({
      live: liveVideo,
      top_liked: topLikedVideo,
      top_starred: topStarredVideo,
      top_rated: topRatedVideo,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

module.exports = { getVideo };
