// import React from "react";
// import Link from "next/link";
// import { getTags } from "@/lib/serverMethods/blog/tagMethods";

// export const revalidate = 60;

// export default async function page() {
//   const tags = await getTags();

//   return (
//     <main className="u-main-container u-padding-content-container">
//       <h1 className="t-main-title">All categories</h1>
//       <p className="t-main-subtitle">Find articles sorted by category</p>

//       <ul className="u-articles-grid">
//         {tags.length > 0 ? (
//           tags.map((tag) => (
//             <li key={tag._id} className="bg-gray-100 border rounded shadow-md">
//               <Link
//                 href={`/categories/tag/${tag.slug}`}
//                 className="flex p-4 pb-6 items-baseline "
//               >
//                 <span className="text-lg font-semibold underline">
//                   #{tag.name}
//                 </span>
//                 <span className="ml-auto">
//                   Articles count :{" "}
//                   <span className="font-semibold">{tag.postCount}</span>
//                 </span>
//               </Link>
//             </li>
//           ))
//         ) : (
//           <li>No categories found</li>
//         )}
//       </ul>
//     </main>
//   );
// }

import React from "react";
import Link from "next/link";
import { getTags } from "@/lib/serverMethods/blog/tagMethods";

export const revalidate = 60; // cache léger si tu veux
export const dynamic = "force-dynamic"; // page rendue côté serveur
export const runtime = "nodejs"; // permet d’utiliser Mongoose

export default async function CategoriesPage() {
  let tags = [];

  try {
    tags = await getTags(); // DB uniquement à runtime
  } catch (error) {
    console.error("Failed to fetch tags:", error);
  }

  return (
    <main className="u-main-container u-padding-content-container">
      <h1 className="t-main-title">All categories</h1>
      <p className="t-main-subtitle">Find articles sorted by category</p>

      <ul className="u-articles-grid">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <li key={tag._id} className="bg-gray-100 border rounded shadow-md">
              <Link
                href={`/categories/tag/${tag.slug}`}
                className="flex p-4 pb-6 items-baseline"
              >
                <span className="text-lg font-semibold underline">
                  #{tag.name}
                </span>
                <span className="ml-auto">
                  Articles count:{" "}
                  <span className="font-semibold">{tag.postCount}</span>
                </span>
              </Link>
            </li>
          ))
        ) : (
          <li>No categories found</li>
        )}
      </ul>
    </main>
  );
}
