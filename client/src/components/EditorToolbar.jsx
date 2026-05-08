function EditorToolbar({ editor }) {
  if (!editor) return null;

  return (
    <div className="flex gap-2 flex-wrap border-b border-zinc-800 p-4 bg-zinc-900 rounded-t-xl">


      
      
      {/* HEADING */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: 1 })
            .run()
        }
        className="px-3 py-1 bg-zinc-800 rounded"
      >
        H1
      </button>

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: 2 })
            .run()
        }
        className="px-3 py-1 bg-zinc-800 rounded"
      >
        H2
      </button>


      {/* BOLD */}
      <button
        onClick={() =>
          editor.chain().focus().toggleBold().run()
        }
        className="px-3 py-1 bg-zinc-800 rounded font-bold"
      >
        B
      </button>


      {/* ITALIC */}
      <button
        onClick={() =>
          editor.chain().focus().toggleItalic().run()
        }
        className="px-3 py-1 bg-zinc-800 rounded italic"
      >
        I
      </button>


      {/* UNDERLINE */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleUnderline()
            .run()
        }
        className="px-3 py-1 bg-zinc-800 rounded underline"
      >
        U
      </button>


      {/* STRIKE */}
      <button
        onClick={() =>
          editor.chain().focus().toggleStrike().run()
        }
        className="px-3 py-1 bg-zinc-800 rounded line-through"
      >
        S
      </button>


      {/* BULLET LIST */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBulletList()
            .run()
        }
        className="px-3 py-1 bg-zinc-800 rounded"
      >
        • List
      </button>


      {/* NUMBER LIST */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleOrderedList()
            .run()
        }
        className="px-3 py-1 bg-zinc-800 rounded"
      >
        1. List
      </button>


      {/* ALIGN LEFT */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign("left")
            .run()
        }
        className="px-3 py-1 bg-zinc-800 rounded"
      >
        Left
      </button>


      {/* ALIGN CENTER */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign("center")
            .run()
        }
        className="px-3 py-1 bg-zinc-800 rounded"
      >
        Center
      </button>


      {/* ALIGN RIGHT */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign("right")
            .run()
        }
        className="px-3 py-1 bg-zinc-800 rounded"
      >
        Right
      </button>

    </div>
  );
}

export default EditorToolbar;