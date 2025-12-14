import {
  ImageBlock,
  VideoBlock,
  ColumnsBlock,
  TextBlock,
  ButtonBlock,
  HeroBlock,
} from "../Components/PageEditor/BlockComponenets";
import TextBlockEditor from "../Components/PageEditor/TextBlockEditor";
import TextBlockViewer from "../Components/PageEditor/TextBlockViewer";
import {
  Type,
  Image,
  Video,
  MousePointerClick,
  Columns,
  Sparkles,
} from "lucide-react";

// ========== BLOCK REGISTRY ==========

const blockRegistry = {
  text: {
    type: "text",
    label: "Text",
    icon: Type,
    category: "basic",
    component: TextBlockViewer, // Used when NOT selected
    editorComponent: TextBlockEditor, // Used when selected
    defaultProps: {
      content: {
        // TipTap JSON format
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Start typing here..." }],
          },
        ],
      },
      padding: "16px",
      background: "transparent",
    },
    description: "Simple text block with formatting",
  },

  image: {
    type: "image",
    label: "Image",
    icon: Image,
    category: "media",
    component: ImageBlock,
    defaultProps: {
      src: "",
      alt: "Image",
      width: "100%",
      height: "300px",
      objectFit: "cover",
      borderRadius: "8px",
    },
    description: "Add images to your page",
  },

  video: {
    type: "video",
    label: "Video",
    icon: Video,
    category: "media",
    component: VideoBlock,
    defaultProps: {
      src: "",
      width: "100%",
      height: "400px",
    },
    description: "Embed video content",
  },

  button: {
    type: "button",
    label: "Button",
    icon: MousePointerClick,
    category: "basic",
    component: ButtonBlock,
    defaultProps: {
      text: "Click me",
      variant: "primary",
      padding: "14px 32px",
      url: "",
      background: "#3b82f6",
      color: "#ffffff",
      borderRadius: "8px",
      fontSize: "16px",
    },
    description: "Call-to-action button",
  },

  columns: {
    type: "columns",
    label: "Columns",
    icon: Columns,
    category: "layout",
    component: ColumnsBlock,
    defaultProps: {
      columns: 2,
      gap: "24px",
      padding: "20px",
    },
    description: "Multi-column layout container",
  },

  hero: {
    type: "hero",
    label: "Hero Section",
    icon: Sparkles,
    category: "layout",
    component: HeroBlock,
    defaultProps: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      backgroundImage: "",
      height: "500px",
      title: "Welcome to Our Event",
      subtitle: "Join us for an amazing experience",
      titleSize: "48px",
      subtitleSize: "20px",
      textAlign: "center",
      overlay: "rgba(0,0,0,0.4)",
    },
    description: "Large header section with title and background",
  },
};

// ========== HELPER FUNCTIONS ==========

// Get all blocks in a category
export const getBlocksByCategory = (category) => {
  return Object.values(blockRegistry).filter(
    (block) => block.category === category
  );
};

// Get all categories
export const getCategories = () => {
  const categories = [
    ...new Set(Object.values(blockRegistry).map((b) => b.category)),
  ];
  return categories;
};

// Get block definition by type
export const getBlockDefinition = (type) => {
  return blockRegistry[type];
};

// Get component for a block type
export const getBlockComponent = (type) => {
  return blockRegistry[type]?.component || null;
};

// Create a new block instance with default props
export const createBlockInstance = (type) => {
  const definition = blockRegistry[type];
  if (!definition) {
    console.error(`Block type "${type}" not found in registry`);
    return null;
  }

  return {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
    type: definition.type,
    props: { ...definition.defaultProps }, // Copy default props
    children: [],
  };
};

// Get all block types
export const getAllBlockTypes = () => {
  return Object.keys(blockRegistry);
};

// Get all blocks (for Toolbox)
export const getAllBlocks = () => {
  return Object.values(blockRegistry);
};

export default blockRegistry;
