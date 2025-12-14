import useEditorStore from '../../store/useEditorstore';
import { Settings2, Layout, Palette, Type, Image as ImageIcon, MousePointerClick } from 'lucide-react';

const Inspector = () => {
  const {currentPage, selectedBlockId, updateBlock} = useEditorStore();

  const selectedBlock = currentPage?.blocks.find(b => b.id === selectedBlockId);

  if (!selectedBlockId || !selectedBlock) {
    return (
      <div className="w-80 bg-gradient-to-br from-gray-50 to-gray-100 border-l border-gray-200 p-6 ">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800">Inspector</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Settings2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm text-center">Select a block to edit its properties</p>
        </div>
      </div>
    );
  }

  const getBlockIcon = (type) => {
    switch(type) {
      case 'text': return Type;
      case 'image': return ImageIcon;
      case 'button': return MousePointerClick;
      default: return Settings2;
    }
  };

  const BlockIcon = getBlockIcon(selectedBlock.type);

  return (
    <div className="w-80  border-l border-gray-200 p-6 overflow-y-auto ">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-bold text-gray-800">Inspector</h2>
      </div>
      
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e7dbf8] rounded-lg flex items-center justify-center">
            <BlockIcon className="w-5 h-5 text-[#6d27da]" />
          </div>
          <div>
            <p className="font-semibold capitalize text-gray-800">{selectedBlock.type}</p>
          </div>
        </div>
      </div>

      <CommonProperties block={selectedBlock} updateBlock={updateBlock} />

      {selectedBlock.type === 'text' && (
        <TextBlockProperties block={selectedBlock} updateBlock={updateBlock} />
      )}
      
      {selectedBlock.type === 'image' && (
        <ImageBlockProperties block={selectedBlock} updateBlock={updateBlock} />
      )}

      {selectedBlock.type === 'button' && (
        <ButtonBlockProperties block={selectedBlock} updateBlock={updateBlock} />
      )}
    </div>
  );
};

// Common Properties
const CommonProperties = ({ block, updateBlock }) => {
  return (
    <div className="space-y-4 mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Layout className="w-4 h-4 text-gray-600" />
        <h3 className="font-semibold text-sm text-gray-700">Layout</h3>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Padding</label>
        <input
          type="text"
          value={block.props.padding || '16px'}
          onChange={(e) => updateBlock(block.id, { padding: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
          placeholder="16px"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
          <Palette className="w-3 h-3" />
          Background
        </label>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="color"
              value={block.props.background === 'transparent' ? '#ffffff' : block.props.background || '#ffffff'}
              onChange={(e) => updateBlock(block.id, { background: e.target.value })}
              className="w-12 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
            />
          </div>
          <input
            type="text"
            value={block.props.background || 'transparent'}
            onChange={(e) => updateBlock(block.id, { background: e.target.value })}
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
            placeholder="transparent"
          />
        </div>
        <button
          onClick={() => updateBlock(block.id, { background: 'transparent' })}
          className="text-xs text-[#6d27da] hover:text-[#2d076b] font-medium mt-2 hover:underline"
        >
          Reset to transparent
        </button>
      </div>
    </div>
  );
};

// Text Block Properties
const TextBlockProperties = () => {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Type className="w-4 h-4 text-gray-600" />
        <h3 className="font-semibold text-sm text-gray-700">Text Settings</h3>
      </div>
      <div className="bg-[#e7e0f1] border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-[#6d27da]">
        💡Use the toolbar in the editor to format your text
        </p>
      </div>
    </div>
  );
};

// Image Block Properties
const ImageBlockProperties = ({ block, updateBlock }) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-4 h-4 text-gray-600" />
        <h3 className="font-semibold text-sm text-gray-700">Image Settings</h3>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Image URL</label>
        <input
          type="text"
          value={block.props.src || ''}
          onChange={(e) => updateBlock(block.id, { src: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Alt Text</label>
        <input
          type="text"
          value={block.props.alt || ''}
          onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
          placeholder="Description for accessibility"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Width</label>
        <input
          type="text"
          value={block.props.width || '100%'}
          onChange={(e) => updateBlock(block.id, { width: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
          placeholder="100%"
        />
      </div>
    </div>
  );
};

// Button Block Properties
const ButtonBlockProperties = ({ block, updateBlock }) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <MousePointerClick className="w-4 h-4 text-gray-600" />
        <h3 className="font-semibold text-sm text-gray-700">Button Settings</h3>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Button Text</label>
        <input
          type="text"
          value={block.props.text || 'Click me'}
          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
          placeholder="Click me"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Link URL</label>
        <input
          type="text"
          value={block.props.url || ''}
          onChange={(e) => updateBlock(block.id, { url: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Style</label>
        <select
          value={block.props.variant || 'primary'}
          onChange={(e) => updateBlock(block.id, { variant: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition-all cursor-pointer"
        >
          <option value="primary">Primary (Blue)</option>
          <option value="secondary">Secondary (Gray)</option>
        </select>
      </div>
    </div>
  );
};

export default Inspector;
