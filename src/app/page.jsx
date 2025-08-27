// import Link from "next/link";
// import { connectToDB } from "@/lib/utils/db/connectToDB";
// import { getPosts } from "@/lib/serverMethods/blog/postMethods";
// import BlogCard from "@/components/BlogCard";

// export const revalidate = 60;

// export default async function Home() {
//   const posts = await getPosts();

//   return (
//     <div className="u-main-container u-padding-content-container">
//       <h1 className="t-main-title">Stay up to date with AXORIA</h1>
//       <p className="t-main-subtitle">Tech news ans useful knowledge</p>

//       <p className="text-md text-zinc-900">Latest articles</p>

//       <ul className="u-articles-grid">
//         {posts.map((post, id) => (
//           <BlogCard post={post} key={id} />
//         ))}
//       </ul>
//     </div>
//   );
// }

import Link from "next/link";
import { getPosts } from "@/lib/serverMethods/blog/postMethods";
import BlogCard from "@/components/BlogCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  let posts = [];
  try {
    posts = await getPosts();
  } catch (err) {
    console.error("Erreur DB :", err);
  }

  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="t-main-title">Stay up to date with AXORIA</h1>
      <p className="t-main-subtitle">Tech news and useful knowledge</p>

      <p className="text-md text-zinc-900">Latest articles</p>

      {posts.length > 0 ? (
        <ul className="u-articles-grid">
          {posts.map((post, id) => (
            <BlogCard post={post} key={id} />
          ))}
        </ul>
      ) : (
        <p>No articles found</p>
      )}
    </div>
  );
}
