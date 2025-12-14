import React from "react";
import { getBlockDefinition } from "../../lib/blockRegistry";
import useEditorStore from "../../store/useEditorstore";

const BlockRender = ({ block }) => {
  const defn = getBlockDefinition(block.type);
  const { selectBlock , selectedBlockId, deleteBlock} = useEditorStore();
  const isSelected = selectedBlockId === block.id;

  let Component;
  if(isSelected && defn.editorComponent){
    Component = defn.editorComponent;
  }else{
    Component = defn.component;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      className="relative"
    >
      <Component {...block.props}
      blockId={block.id}
      >
        {block.children &&
          block.children.map((childBlock) =>
            BlockRender({ block: childBlock })
          )}
      </Component>

      {/* Block Controls (shown on hover/selection) */}
      {isSelected && (
        <div className="absolute top-0 right-0 flex gap-1 p-1 bg-white border border-gray-200 rounded shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteBlock(block.id);
            }}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      )}

    </div>
  );
};

export default BlockRender;
