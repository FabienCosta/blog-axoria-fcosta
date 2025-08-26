"use client";
import React from "react";
import { deletePost } from "@/lib/serverAction/blog/postServerAction";

export default function DeletePostButton({ id }) {
  return (
    <button
      onClick={() => deletePost(id)}
      className="bg-red-600 hover:bg-red-700 min-w-20 text-white font-bold py-2 px-4 rounded mr-2"
    >
      Delete
    </button>
  );
}
