import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const TextBlockViewer = ({
  content,
  padding = "16px",
  background = "transparent",
}) => {
  const html = generateHTML(content, [StarterKit]);

  return (
    <div
      style={{ padding, background }}
      className="tiptap-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default TextBlockViewer;
