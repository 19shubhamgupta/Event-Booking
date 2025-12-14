export const TextBlock = ({
  content = "Enter text...",
  padding = "16px",
  background = "transparent",
}) => (
  <div style={{ padding, background }}>
    <p>{content}</p>
  </div>
);

export const ImageBlock = ({
  src = "",
  alt = "Image",
  width = "100%",
  height = "auto",
  objectFit = "cover",
  borderRadius = "0",
}) => (
  <div
    style={{
      width,
      height: height === "auto" ? "auto" : height,
      background: src ? "transparent" : "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius,
      overflow: "hidden",
    }}
  >
    {src ? (
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: height === "auto" ? "auto" : "100%",
          objectFit,
          display: "block",
        }}
      />
    ) : (
      <span>Image Placeholder</span>
    )}
  </div>
);

export const VideoBlock = ({ src = "", width = "100%", height = "400px" }) => (
  <div
    style={{
      width,
      height,
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {src ? (
      <video
        src={src}
        controls
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
    ) : (
      <span style={{ color: "white" }}>🎥 Video Placeholder</span>
    )}
  </div>
);

export const ButtonBlock = ({
  text = "Click me",
  variant = "primary",
  padding = "12px 24px",
  background,
  color,
  borderRadius = "6px",
  fontSize = "16px",
  url = "",
  fullWidth = false,
}) => (
  <div style={{ textAlign: "center", padding: "8px 0" }}>
    <a
      href={url || "#"}
      style={{
        display: "inline-block",
        padding,
        background:
          background ||
          (variant === "primary"
            ? "#3b82f6"
            : variant === "secondary"
            ? "transparent"
            : "#6b7280"),
        color: color || "white",
        border: variant === "secondary" ? "2px solid currentColor" : "none",
        borderRadius,
        cursor: "pointer",
        fontSize,
        fontWeight: "600",
        textDecoration: "none",
        width: fullWidth ? "100%" : "auto",
        boxSizing: "border-box",
        transition: "all 0.2s ease",
      }}
    >
      {text}
    </a>
  </div>
);

export const ColumnsBlock = ({
  columns = 2,
  gap = "16px",
  padding = "0",
  children,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
      padding,
    }}
  >
    {children && children.length > 0
      ? children
      : Array.from({ length: columns }).map((_, index) => (
          <div
            key={index}
            style={{
              padding: "16px",
              border: "1px dashed #ccc",
              borderRadius: "8px",
            }}
          >
            Column {index + 1} (drop blocks here)
          </div>
        ))}
  </div>
);

export const HeroBlock = ({
  background = "#1e293b",
  backgroundImage = "",
  height = "400px",
  title = "Hero Title",
  subtitle = "Hero subtitle text",
  titleSize = "48px",
  subtitleSize = "20px",
  textAlign = "center",
  overlay = "rgba(0,0,0,0.4)",
  children,
}) => (
  <div
    style={{
      background: backgroundImage
        ? `linear-gradient(${overlay}, ${overlay}), url(${backgroundImage})`
        : background,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height,
      display: "flex",
      flexDirection: "column",
      alignItems:
        textAlign === "center"
          ? "center"
          : textAlign === "right"
          ? "flex-end"
          : "flex-start",
      justifyContent: "center",
      color: "white",
      padding: "32px",
      textAlign,
    }}
  >
    <h1
      style={{
        fontSize: titleSize,
        margin: "0 0 16px 0",
        fontWeight: "700",
        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }}
    >
      {title}
    </h1>
    <p
      style={{
        fontSize: subtitleSize,
        margin: 0,
        opacity: 0.9,
        maxWidth: "700px",
      }}
    >
      {subtitle}
    </p>
    {children && children.length > 0 && (
      <div style={{ marginTop: "24px" }}>{children}</div>
    )}
  </div>
);
