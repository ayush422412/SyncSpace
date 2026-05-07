import { Link } from "react-router-dom";

function DocumentCard({ document }) {
  return (
    <Link
      to={`/document/${document._id}`}
      className="bg-zinc-900 p-5 rounded-xl block hover:bg-zinc-800 transition"
    >
      <h2 className="text-xl font-semibold">
        {document.title}
      </h2>

      <p className="text-zinc-400 mt-2 text-sm">
        Updated{" "}
        {new Date(
          document.updatedAt
        ).toLocaleDateString()}
      </p>
    </Link>
  );
}

export default DocumentCard;