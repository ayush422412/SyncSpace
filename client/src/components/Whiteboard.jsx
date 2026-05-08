import {
  useEffect,
  useRef,
  useState,
} from "react";

import * as fabric from "fabric";

import * as Y from "yjs";

import { WebsocketProvider } from "y-websocket";

function Whiteboard({
  workspaceId,
  role,
}) {

  const canvasRef = useRef(null);

  const fabricRef = useRef(null);

  const historyRef = useRef([]);

  const redoRef = useRef([]);

  const [tool, setTool] =
    useState("draw");

  const [brushColor, setBrushColor] =
    useState("#ffffff");

  const [brushSize, setBrushSize] =
    useState(3);

  const ydocRef = useRef(
    new Y.Doc()
  );

  const providerRef = useRef(
    new WebsocketProvider(
      "ws://localhost:1234",
      `whiteboard-${workspaceId}`,
      ydocRef.current
    )
  );

  const yArrayRef = useRef(
    ydocRef.current.getArray(
      "canvas"
    )
  );

  const clearBoard = () => {
    yArrayRef.current.delete(
      0,
      yArrayRef.current.length
    );
  };

  const undo = () => {
    const canvas =
      fabricRef.current;

    if (
      !canvas ||
      historyRef.current.length === 0
    )
      return;

    const current =
      yArrayRef.current.toArray();

    redoRef.current.push(current);

    const previous =
      historyRef.current.pop();

    yArrayRef.current.delete(
      0,
      yArrayRef.current.length
    );

    yArrayRef.current.push(
      previous
    );
  };

  const redo = () => {
    const canvas =
      fabricRef.current;

    if (
      !canvas ||
      redoRef.current.length === 0
    )
      return;

    const current =
      yArrayRef.current.toArray();

    historyRef.current.push(
      current
    );

    const next =
      redoRef.current.pop();

    yArrayRef.current.delete(
      0,
      yArrayRef.current.length
    );

    yArrayRef.current.push(next);
  };

  useEffect(() => {

    const canvas =
      new fabric.Canvas(
        canvasRef.current,
        {
          backgroundColor:
            "#18181b",
        }
      );

    fabricRef.current = canvas;

    canvas.isDrawingMode =
      role === "editor" ||
      role === "owner";

    canvas.freeDrawingBrush =
      new fabric.PencilBrush(
        canvas
      );

    let isPanning = false;

    canvas.on(
      "mouse:down",
      (opt) => {
        const evt = opt.e;

        if (evt.altKey) {
          isPanning = true;

          canvas.isDrawingMode =
            false;

          canvas.lastPosX =
            evt.clientX;

          canvas.lastPosY =
            evt.clientY;
        }
      }
    );

    canvas.on(
      "mouse:move",
      (opt) => {
        if (isPanning) {

          const e = opt.e;

          const vpt =
            canvas.viewportTransform;

          vpt[4] +=
            e.clientX -
            canvas.lastPosX;

          vpt[5] +=
            e.clientY -
            canvas.lastPosY;

          canvas.requestRenderAll();

          canvas.lastPosX =
            e.clientX;

          canvas.lastPosY =
            e.clientY;
        }
      }
    );

    canvas.on(
      "mouse:up",
      () => {
        isPanning = false;

        canvas.isDrawingMode =
          role === "editor" ||
          role === "owner";
      }
    );

    canvas.on(
      "mouse:wheel",
      (opt) => {

        const delta =
          opt.e.deltaY;

        let zoom =
          canvas.getZoom();

        zoom *=
          0.999 ** delta;

        if (zoom > 5)
          zoom = 5;

        if (zoom < 0.2)
          zoom = 0.2;

        canvas.zoomToPoint(
          {
            x: opt.e.offsetX,
            y: opt.e.offsetY,
          },
          zoom
        );

        opt.e.preventDefault();

        opt.e.stopPropagation();
      }
    );

    canvas.on(
      "path:created",
      (e) => {

        const path =
          e.path.toJSON();

        historyRef.current.push(
          yArrayRef.current.toArray()
        );

        redoRef.current = [];

        yArrayRef.current.push([
          path,
        ]);
      }
    );

    yArrayRef.current.observe(
      () => {

        canvas.clear();

        canvas.backgroundColor =
          "#18181b";

        const paths =
          yArrayRef.current.toArray();

        paths.forEach(
          (pathData) => {

            fabric.Path.fromObject(
              pathData
            ).then((path) => {

              canvas.add(path);

              canvas.renderAll();
            });
          }
        );
      }
    );

    return () => {

      providerRef.current.destroy();

      ydocRef.current.destroy();

      canvas.dispose();
    };

  }, []);

  useEffect(() => {

    const canvas =
      fabricRef.current;

    if (
      canvas &&
      canvas.freeDrawingBrush
    ) {

      canvas.freeDrawingBrush.color =
        tool === "erase"
          ? "#18181b"
          : brushColor;

      canvas.freeDrawingBrush.width =
        tool === "erase"
          ? brushSize * 4
          : brushSize;
    }

  }, [
    brushColor,
    brushSize,
    tool,
  ]);

  return (
    <div className="min-h-screen bg-black p-6">

      <div className="border border-zinc-800 rounded-xl bg-zinc-900 overflow-auto">

        <div className="flex items-center gap-4 p-4 border-b border-zinc-800 flex-wrap">

          <input
            type="color"
            value={brushColor}
            onChange={(e) =>
              setBrushColor(
                e.target.value
              )
            }
          />

          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) =>
              setBrushSize(
                Number(
                  e.target.value
                )
              )
            }
          />

          <button
            onClick={() =>
              setTool("draw")
            }
            className={`px-4 py-2 rounded-lg ${
              tool === "draw"
                ? "bg-white text-black"
                : "bg-zinc-800 text-white"
            }`}
          >
            Draw
          </button>

          <button
            onClick={() =>
              setTool("erase")
            }
            className={`px-4 py-2 rounded-lg ${
              tool === "erase"
                ? "bg-white text-black"
                : "bg-zinc-800 text-white"
            }`}
          >
            Eraser
          </button>

          <button
            onClick={undo}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg"
          >
            Undo
          </button>

          <button
            onClick={redo}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg"
          >
            Redo
          </button>

          <button
            onClick={clearBoard}
            className="bg-red-500 px-4 py-2 rounded-lg text-white"
          >
            Clear
          </button>

        </div>

        <canvas
          ref={canvasRef}
          width={4000}
          height={2500}
        />

      </div>

    </div>
  );
}

export default Whiteboard;