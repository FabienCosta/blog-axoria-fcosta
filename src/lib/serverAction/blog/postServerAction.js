"use server";
import { connectToDB } from "@/lib/utils/db/connectToDB";
import { Post } from "@/lib/models/post";
import { Tag } from "@/lib/models/tag";
import slugify from "slugify";
import { marked } from "marked";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import Prism from "prismjs";
import { markedHighlight } from "marked-highlight";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import AppError from "@/lib/utils/errorHandling/customError";
import { sessionInfo } from "@/lib/serverMethods/session/sessionMethods";
import sharp from "sharp";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { areTagsSimilar, generateUniqueSlug } from "@/lib/utils/general/utils";
import { findOrCreateTag } from "@/lib/serverMethods/tag/tagMethods";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export async function addPost(formData) {
  const { title, markdownArticle, tags, coverImage } =
    Object.fromEntries(formData);

  try {
    if (typeof title !== "string" || title.trim().length < 3) {
      throw new AppError("Invalid data");
    }
    if (
      typeof markdownArticle !== "string" ||
      markdownArticle.trim().length === 0
    ) {
      throw new AppError("Invalid data");
    }

    await connectToDB();

    const session = await sessionInfo();
    if (!session.success) {
      throw new AppError("Authentication required");
    }

    // Gestion de l'upload d'image
    if (!coverImage || !(coverImage instanceof File)) {
      throw new AppError("Invaid data");
    }

    const validImageTypes = [
      "image/jpeg",
      "Image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!validImageTypes.includes(coverImage.type)) {
      throw new AppError("Invalid Data");
    }

    const imageBuffer = Buffer.from(await coverImage.arrayBuffer());
    const { width, height } = await sharp(imageBuffer).metadata();

    if (width > 1280 || height > 720) {
      throw new AppError("Invalid data");
    }

    const uniqueFileName = `${crypto.randomUUID()}_${coverImage.name.trim()}`;

    const uploadUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${uniqueFileName}`;

    const publicImageUrl = `https://axoriablogeducationn.b-cdn.net/${uniqueFileName}`;

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: process.env.BUNNY_STORAGE_API_KEY,
        "Content-type": "application/octet-stream",
      },
      body: imageBuffer,
    });

    if (!response.ok) {
      throw new AppError(
        `Error while uploadind the image : ${response.statusText}`
      );
    }

    // Gestions des tags
    if (typeof tags !== "string") {
      throw new AppError("Invalid data");
    }
    const tagNamesArray = JSON.parse(tags);

    if (!Array.isArray(tagNamesArray)) {
      throw new AppError("Tags must be a valid array");
    }

    const tagIds = await Promise.all(
      tagNamesArray.map(async (tagName) => {
        const normalizedTagName = tagName.trim().toLowerCase();

        let tag = await Tag.findOne({ name: normalizedTagName });

        if (!tag) {
          tag = await Tag.create({
            name: normalizedTagName,
            slug: slugify(normalizedTagName, { strict: true }),
          });
        }
        return tag._id;
      })
    );

    // Gestion du markdown
    marked.use(
      markedHighlight({
        highlight: (code, language) => {
          const validLanguage = Prism.languages[language]
            ? language
            : "plaintext";

          return Prism.highlight(
            code,
            Prism.languages[validLanguage],
            validLanguage
          );
        },
      })
    );

    let markdownHTMLResult = marked(markdownArticle);

    markdownHTMLResult = DOMPurify.sanitize(markdownHTMLResult);

    const newPost = new Post({
      title,
      markdownArticle,
      markdownHTMLResult,
      tags: tagIds,
      coverImageUrl: publicImageUrl,
      author: session.userId,
    });

    const savedPost = await newPost.save();
    console.log("Post saved");

    return { success: true, slug: savedPost.slug };
  } catch (error) {
    console.error("Error while creating the post:", error);

    if (error instanceof AppError) {
      throw error;
    }
    throw new Error("An error occured while creating the post");
  }
}

export async function editPost(formData) {
  const { postToEditStringified, title, markdownArticle, coverImage, tags } =
    Object.fromEntries(formData);

  const postToEdit = JSON.parse(postToEditStringified);

  try {
    await connectToDB();

    const session = await sessionInfo();
    if (!session.success) {
      throw new Error();
    }

    const updatedData = {};

    if (typeof title !== "string") throw new Error();
    if (title.trim() !== postToEdit.title) {
      updatedData.title = title;
      updatedData.slug = await generateUniqueSlug(title);
    }

    if (typeof markdownArticle !== "string") throw new Error();
    if (markdownArticle.trim() !== postToEdit.markdownArticle) {
      updatedData.markdownHTMLResult = DOMPurify.sanitize(
        marked(markdownArticle)
      );
      updatedData.markdownArticle = markdownArticle;
    }

    // // Delete image
    // if (typeof coverImage !== "object") throw new Error();

    // if (coverImage.size > 0) {
    //   const validImageTypes = [
    //     "image/jpeg",
    //     "image/jpg",
    //     "image/png",
    //     "image/webp",
    //   ];

    //   if (!validImageTypes.includes(coverImage.type)) {
    //     throw new Error();
    //   }
    //   const imageBuffer = Buffer.from(await coverImage.arrayBuffer());
    //   const { width, height } = await sharp(imageBuffer).metadata();
    //   if (width > 1280 || height > 720) {
    //     throw new Error();
    //   }
    //   const toDeleteImageFileName = postToEdit.coverImageUrl.split("/").pop();
    //   const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${toDeleteImageFileName}`;

    //   const imageDeletionResponse = await fetch(deleteUrl, {
    //     method: "DELETE",
    //     headers: { AccessKey: process.env.BUNNY_STORAGE_API_KEY },
    //   });

    //   if (!imageDeletionResponse.ok) {
    //     throw new AppError(
    //       `Error while deleting the image ${imageDeletionResponse.statusText}`
    //     );
    //   }

    //   // Upload new image
    //   const imageToUploadFileName = `${crypto.randomUUID()}_${coverImage.name}`;
    //   const imageToUploadUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${imageToUploadFileName}`;
    //   const imageToUploadPublicUrl = `https://pull-zone-axoriablogeducationn.b-cdn.net/${imageToUploadUrl}`;

    //   const imageToUploadResponse = await fetch(imageToUploadUrl, {
    //     method: "PUT",
    //     headers: {
    //       AccessKey: process.env.BUNNY_STORAGE_API_KEY,
    //       "Content-Type": "application/octet-stream",
    //     },
    //     body: imageBuffer,
    //   });

    //   if (!imageToUploadResponse) {
    //     throw new Error(
    //       `Error while uploading the new image : ${imageToUploadResponse.statusText}`
    //     );
    //   }

    //   updatedData.coverImageUrl = imageToUploadPublicUrl;
    // }
    // Gérer l'image
    if (typeof coverImage !== "object") throw new Error();

    if (coverImage.size > 0) {
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!validImageTypes.includes(coverImage.type)) {
        throw new Error("Invalid image type");
      }

      const imageBuffer = Buffer.from(await coverImage.arrayBuffer());
      const { width, height } = await sharp(imageBuffer).metadata();
      if (width > 1280 || height > 720) {
        throw new Error("Image exceeds 1280x720 dimensions");
      }

      // Supprimer l'ancienne image si elle existe
      if (postToEdit.coverImageUrl) {
        const toDeleteImageFileName = postToEdit.coverImageUrl.split("/").pop();
        const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${toDeleteImageFileName}`;

        const imageDeletionResponse = await fetch(deleteUrl, {
          method: "DELETE",
          headers: { AccessKey: process.env.BUNNY_STORAGE_API_KEY },
        });

        // Ignore 404 (Not Found), mais garde les autres erreurs
        if (!imageDeletionResponse.ok && imageDeletionResponse.status !== 404) {
          throw new AppError(
            `Error while deleting the image: ${imageDeletionResponse.statusText}`
          );
        }
      }

      // Upload de la nouvelle image
      const imageToUploadFileName = `${crypto.randomUUID()}_${coverImage.name}`;
      const imageToUploadUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${imageToUploadFileName}`;
      const imageToUploadPublicUrl = `https://axoriablogeducationn.b-cdn.net/${imageToUploadFileName}`;

      const imageToUploadResponse = await fetch(imageToUploadUrl, {
        method: "PUT",
        headers: {
          AccessKey: process.env.BUNNY_STORAGE_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      });

      if (!imageToUploadResponse.ok) {
        throw new Error(
          `Error while uploading the new image: ${imageToUploadResponse.statusText}`
        );
      }

      updatedData.coverImageUrl = imageToUploadPublicUrl;
    }

    // Tags management
    if (typeof tags !== "string") throw new Error();

    const tagNamesArray = JSON.parse(tags);
    if (!Array.isArray(tagNamesArray)) throw new Error();
    if (!areTagsSimilar(tagNamesArray, postToEdit.tags)) {
      const tagIds = await Promise.all(
        tagNamesArray.map((tag) => findOrCreateTag(tag))
      );
      updatedData.tags = tagIds;
    }

    if (Object.keys(updatedData).length === 0) throw new Error();

    const updatedPost = await Post.findByIdAndUpdate(
      postToEdit._id,
      updatedData,
      { new: true }
    );

    revalidatePath(`/article/${postToEdit.slug}`);

    return { success: true, slug: updatedPost.slug };
  } catch (error) {
    console.error("Error while creating the post:", error);

    if (error instanceof AppError) {
      throw error;
    }
    throw new Error("An error occured while creating the post");
  }
}

export async function deletePost(id) {
  try {
    await connectToDB();

    const user = await sessionInfo();
    if (!user) {
      throw new AppError("Authentication required");
    }

    const post = await Post.findById(id);
    if (!post) {
      throw new AppError("Post not found");
    }

    await Post.findByIdAndDelete(id);

    if (!post.coverImageUrl) {
      const fileName = post.coverImageUrl.split("/").pop();
      const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${fileName}`;

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { accessKey: process.env.BUNNY_STORAGE_API_KEY },
      });

      if (!response.ok) {
        throw new AppError(`Failed to delete image: ${response.statusText}`);
      }
    }

    revalidatePath(`/article/${post.slug}`);
  } catch (error) {
    console.error("Error while creating the post:", error);

    if (error instanceof AppError) {
      throw error;
    }
    console.error(error);
    throw new Error("An error occured while creating the post");
  }
}
