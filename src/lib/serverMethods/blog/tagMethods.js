import { Tag } from "@/lib/models/tag";
import { connectToDB } from "@/lib/utils/db/connectToDB";

export async function getTags() {
  await connectToDB();

  const tags = await Tag.aggregate([
    {
      $lookup: {
        from: "posts",
        foreignField: "tags",
        localField: "_id",
        as: "postsWithTag",
      },
    },
    {
      $addFields: {
        postCount: { $size: "$postsWithTag" },
      },
    },
    {
      $match: { postCount: { $gt: 0 } },
    },
    {
      $sort: { postCount: -1 },
    },
    {
      $project: { postsWithTag: 0 },
    },
  ]);

  return tags;
}
