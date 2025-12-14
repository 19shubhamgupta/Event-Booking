import { getAllBlocks, createBlockInstance } from "../../lib/blockRegistry";
import useEditorStore from "../../store/useEditorstore";

const Toolbox = () => {
  const addBlock = useEditorStore((state) => state.addBlock);

  const handleAddBlock = (blockType) => {
    const newBlock = createBlockInstance(blockType);
    if (newBlock) {
      addBlock(newBlock);
    }
  };

  const blocks = getAllBlocks();

  // Group blocks by category
  const categories = {
    basic: blocks.filter((b) => b.category === "basic"),
    media: blocks.filter((b) => b.category === "media"),
    layout: blocks.filter((b) => b.category === "layout"),
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto mt-10">

      {/* Basic Blocks */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">
          Basic
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.basic.map((block) => {
            const IconComponent = block.icon;
            return (
              <button
                key={block.type}
                onClick={() => handleAddBlock(block.type)}
                className="flex flex-col items-center justify-center p-4 bg-[#e7dbf8] hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors aspect-square"
              >
                <IconComponent className="w-8 h-8 text-[#6d27da] mb-2" />
                <div className="font-medium text-xs text-center">
                  {block.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Blocks */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">
          Media
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.media.map((block) => {
            const IconComponent = block.icon;
            return (
              <button
                key={block.type}
                onClick={() => handleAddBlock(block.type)}
                className="flex flex-col items-center justify-center p-4 bg-[#e7dbf8] hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors aspect-square"
              >
                <IconComponent className="w-8 h-8 text-[#6d27da] mb-2" />
                <div className="font-medium text-xs text-center">
                  {block.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Blocks */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">
          Layout
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.layout.map((block) => {
            const IconComponent = block.icon;
            return (
              <button
                key={block.type}
                onClick={() => handleAddBlock(block.type)}
                className="flex flex-col items-center justify-center p-4 bg-[#e7dbf8] hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors aspect-square"
              >
                <IconComponent className="w-8 h-8 text-[#6d27da] mb-2" />
                <div className="font-medium text-xs text-center">
                  {block.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Toolbox;
