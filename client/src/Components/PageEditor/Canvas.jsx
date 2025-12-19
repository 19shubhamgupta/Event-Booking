import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import useEditorStore from "../../store/useEditorstore";
import SortableBlock from "./SortableBlock";

const Canvas = ({ ControlBtns }) => {
  const { currentPage, deselectBlock, setCurrentPage } = useEditorStore();

  if (!currentPage) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-2">
            No Page Loaded
          </h2>
          <p className="text-gray-500">
            Create or load a page to start editing
          </p>
        </div>
      </div>
    );
  }

  const blocks = currentPage.blocks || [];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return; // dropped on itself

    const oldIndx = blocks.findIndex((b) => b.id === active.id);
    const newIndx = blocks.findIndex((b) => b.id === over.id);

    const reorderedBlocks = arrayMove(blocks, oldIndx, newIndx);

    setCurrentPage(reorderedBlocks);
  };

  return (
    <div
      className="flex-1 bg-gray-50 overflow-y-auto p-8 "
      onClick={() => deselectBlock()}
      style={{
    overflow: "auto",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE/Edge
  }}
    >
      <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-screen">
        {/* Page Title */}
        <div className="border-b border-zinc-400 p-2 bg-gray-50 flex justify-between">
          <h1 className="text-3xl font-bold text-zinc-800">
            {currentPage.title}
          </h1>

          <ControlBtns />
        </div>

        {/* Blocks */}
        <div className="p-6 space-y-4">
          {currentPage.blocks.length === 0 ? (
            <div className="text-center py-16 ">
              <p className="text-2xl text-zinc-800">No blocks yet</p>
              <p className="text-xl text-zinc-700">
                Add blocks from the left sidebar to get started
              </p>
            </div>
          ) : (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block) => (
                  <SortableBlock key={block.id} block={block} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
