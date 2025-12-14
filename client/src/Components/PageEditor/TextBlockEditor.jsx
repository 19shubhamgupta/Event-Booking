import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import useEditorStore from "../../store/useEditorstore";

const TextBlockEditor = ({
  content = "Enter your text here...",
  padding = "16px",
  background = "transparent",
  blockId,
}) => {
  const { updateBlock } = useEditorStore();

  const editor = useEditor({
    extensions: [
      StarterKit, // Adds: bold, italic, headings, lists, etc.
      Placeholder.configure({
        placeholder: content,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // called whenever user types
      const json = editor.getJSON();
      updateBlock(blockId, { content: json || "" });
    },
  });
  const ToolbarButton = ({ onClick, isActive, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded ${
        isActive ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div
      style={{ padding, background }}
      className="border border-blue-300 rounded"
    >
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border-b border-gray-300 bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <em>I</em>
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
        >
          H3
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          • List
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="tiptap-editor p-4 min-h-[100px] focus:outline-none"
      />
    </div>
  );
};

export default TextBlockEditor;
