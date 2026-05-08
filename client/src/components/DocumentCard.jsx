import { Link } from "react-router-dom";

function DocumentCard({
  document,
}) {

  const collaborators =
    document.collaborators
      ?.length || 0;

  return (
    <Link
      to={`/document/${document._id}`}
      className="
        group
        bg-zinc-900/80
        border
        border-zinc-800
        hover:border-zinc-700
        p-6
        rounded-2xl
        block
        transition
        hover:-translate-y-1
        hover:bg-zinc-900
        duration-300
        backdrop-blur-sm
      "
    >

      {/* TOP */}
      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-semibold text-white group-hover:text-blue-400 transition">

            {document.title}

          </h2>

          <p className="text-zinc-500 text-sm mt-2">

            Workspace

          </p>

        </div>

        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-xl">

          📄

        </div>

      </div>

      {/* MIDDLE */}
      <div className="mt-8 space-y-3">

        <div className="flex items-center justify-between text-sm">

          <span className="text-zinc-500">
            Last Edited
          </span>

          <span className="text-zinc-300">
            {new Date(
              document.updatedAt
            ).toLocaleString()}
          </span>

        </div>

        <div className="flex items-center justify-between text-sm">

          <span className="text-zinc-500">
            Collaborators
          </span>

          <span className="text-zinc-300">
            {collaborators}
          </span>

        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-8 pt-5 border-t border-zinc-800 flex items-center justify-between">

        <span className="text-sm text-zinc-500">

          Open Workspace

        </span>

        <span className="text-lg group-hover:translate-x-1 transition">

          →

        </span>

      </div>

    </Link>
  );
}

export default DocumentCard;