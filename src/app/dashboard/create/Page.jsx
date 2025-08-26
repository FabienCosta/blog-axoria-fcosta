"use client";
import React from "react";
import { addPost } from "@/lib/serverAction/blog/postServerAction";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [tags, setTags] = useState([]);
  const router = useRouter();
  const tagInputRef = useRef(null);
  const submitButtonRef = useRef(null);
  const serverValidationText = useRef(null);
  const imgUploadValidationText = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.set("tags", JSON.stringify(tags));

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    serverValidationText.current.textContent = "";
    submitButtonRef.current.textContent = "Saving post ...";
    submitButtonRef.current.disabled = true;

    try {
      const result = await addPost(formData);

      if (result.success) {
        submitButtonRef.current.textContent = "Post Saved ✅";

        let countdown = 3;
        serverValidationText.current.textContent = `Redirecting in ${countdown}...`;
        const interval = setInterval(() => {
          countdown -= 1;
          serverValidationText.current.textContent = `Redirecting in ${countdown}...`;

          if (countdown === 0) {
            clearInterval(interval);
            router.push(`/article/${result.slug}`);
          }
        }, 1000);
      }
    } catch (error) {
      submitButtonRef.current.textContent = "Submit";
      serverValidationText.current.textContent = `${error.message}`;
      submitButtonRef.current.disabled = false;
    }
  }

  function handleAddTag() {
    const newTag = tagInputRef.current.value.trim().toLowerCase();

    if (newTag !== "" && !tags.includes(newTag) && tags.length <= 4) {
      setTags([...tags, newTag]);
      tagInputRef.current.value = "";
    }
  }

  function handleRemoveTag(tagToRemove) {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleEnterOnTagInput(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }

  function handleFileChange(e) {
    const file = e.targer.files[0];
    const validImageTypes = [
      "image/jpeg",
      "Image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!validImageTypes.includes(file.type)) {
      imgUploadValidationText.current.textContent =
        " Please upload a valid image (JPEG, PNG, WebP)";
      e.target.value = "";
      return;
    } else {
      imgUploadValidationText.current.textContent = "";
    }

    const img = new Image();
    img.addEventListener("load", checkImageSizeOnLoad);

    function checkImageSizeOnLoad() {
      if (img.width > 1280 || img.height > 720) {
        imgUploadValidationText.current.textContent =
          "Image exceeds 1280x720 dimensions";
        e.target.value = "";
        URL.revokeObjectURL(img.src);
        return;
      } else {
        imgUploadValidationText.current.textContent = "";
        URL.revokeObjectURL(img.src);
      }
    }

    img.src = URL.createObjectURL(file);
  }

  return (
    <main className="u-main-container bg-white mt-32 mb-40">
      <h1 className="text-4xl mb-4">Write and article 📝</h1>
      <form onSubmit={handleSubmit} className="pb-6">
        <label htmlFor="title" className="f-label">
          Title
        </label>
        <input
          type="text"
          name="title"
          className="shadow border rounded w-full p-3 mb-7 text-gray-700 focus:outline-slate-400"
          id="title"
          placeholder="Title"
          required
        />

        <label htmlFor="coverImage" className="f-label">
          Cover image (1280x720 for best quality, or less)
        </label>
        <input
          name="coverImage"
          className="shadow cursor-pointer border rounded w-full p-3 text-gray-700 mb-2 focus:outline-none focus:shadow-outline"
          type="file"
          id="coverImage"
          required
          placeholder="Article's cover image"
          onChange={handleFileChange}
        />
        <p ref={imgUploadValidationText} className="text-red-700 mb-7"></p>

        <div className="mb-10">
          <label className="-label" htmlFor="tag">
            Add tag(s) (optional, max 5 )
          </label>
          <div className="flex">
            <input
              type="text"
              className="shadow border rounded p-3 text-gray-700 focus:outline-slate-400"
              id="tag"
              placeholder="Add a tag"
              ref={tagInputRef}
              onKeyDown={handleEnterOnTagInput}
            />
            <button
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold p-4 rounded mx-4"
              onClick={handleAddTag}
              type="button"
            >
              Add
            </button>
            <div className="flex items-center grow whitespace-nowrap overflow-y-auto shadow border rounded px-3">
              {tags.map((tag) => (
                <span
                  className="inline-block whitespace-nowrap bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2"
                  key={tag}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-red-500 ml-2"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <label htmlFor="markdownArticle" className="f-label">
          Write your article using markdown - Do not repeat the already given
          title
        </label>
        <a
          target="_blank"
          href="https://www.markdownguide.org/cheat-sheet/"
          className="block mb-4 text-blue-600"
        >
          How to use the markdown syntax ?
        </a>

        <textarea
          name="markdownArticle"
          id="markdownArticle"
          className="min-h-44 text-xl shadow appearance-none border rounded w-full p-8 text-gray-700 focus:outline-slate-400"
        ></textarea>

        <button
          ref={submitButtonRef}
          className="min-w-44 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded border-none mb-4"
        >
          Submit
        </button>
        <p ref={serverValidationText}></p>
      </form>
    </main>
  );
}
