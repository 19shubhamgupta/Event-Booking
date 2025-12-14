import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockRender from './BlockRender';

const SortableBlock = ({ block }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,  // Added: is another block being dragged over this?
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`mb-4 ${isOver ? 'border-t-4 border-blue-500' : ''}`}  // Drop indicator
    >
      {/* Drag Handle */}
      <div className="flex items-center gap-2 group">
        <div 
          {...attributes} 
          {...listeners}
          className="text-gray-400 hover:text-gray-600 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="4" cy="4" r="1.5"/>
            <circle cx="12" cy="4" r="1.5"/>
            <circle cx="4" cy="8" r="1.5"/>
            <circle cx="12" cy="8" r="1.5"/>
            <circle cx="4" cy="12" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
          </svg>
        </div>
        
        {/* The actual block */}
        <div className="flex-1">
          <BlockRender block={block} />
        </div>
      </div>
    </div>
  );
};

export default SortableBlock;