import { useState, useRef, useEffect, useCallback } from "react"
import {
  Bold,
  Italic,
  Underline,
  MoreHorizontal,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Image,
  AtSign,
  Smile,
  Table,
  Code,
  Plus,
  Maximize,
  ChevronDown,
} from "lucide-react"
import styles from "./RichTextEditor.module.css"

const RichTextEditor = ({ value, style, onChange, className }) => {
  const [editorState, setEditorState] = useState({
    text: "",
    selection: { start: 0, end: 0 },
    formats: {
      bold: false,
      italic: false,
      underline: false,
      fontSize: "16px",
      fontColor: "#000000",
      listType: "none",
    },
  })

  const [isFocused, setIsFocused] = useState(false)
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false)
  const [showColorMenu, setShowColorMenu] = useState(false)

  const editorRef = useRef(null)

  const handleFormat = (format, value) => {
    setEditorState((prev) => ({
      ...prev,
      formats: {
        ...prev.formats,
        [format]: value !== undefined ? value : !prev.formats[format],
      },
    }))

    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const applyFormatting = (command, value) => {
    document.execCommand(command, false, value)

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const isBold = document.queryCommandState("bold")
      const isItalic = document.queryCommandState("italic")
      const isUnderline = document.queryCommandState("underline")

      setEditorState((prev) => ({
        ...prev,
        formats: {
          ...prev.formats,
          bold: isBold,
          italic: isItalic,
          underline: isUnderline,
        },
      }))
    }

    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const handleInput = (e) => {
    const text = e.currentTarget.innerHTML;
    console.log("New Text:", text); // Debugging line

    if (onChange) {
      onChange(text); // Update parent state
    }
  };

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    if (selection && editorRef.current?.contains(selection.anchorNode)) {
      setEditorState((prev) => ({
        ...prev,
        selection: {
          start: selection.anchorOffset,
          end: selection.focusOffset,
        },
        formats: {
          ...prev.formats,
          bold: document.queryCommandState("bold"),
          italic: document.queryCommandState("italic"),
          underline: document.queryCommandState("underline"),
        },
      }))
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showFontSizeMenu || showColorMenu) {
        setShowFontSizeMenu(false)
        setShowColorMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("selectionchange", handleSelectionChange)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [showFontSizeMenu, showColorMenu, handleSelectionChange])

  const ToolbarButton = ({ icon: Icon, active, onClick }) => (
    <button type="button" className={`${styles.toolbarButton} ${active ? styles.active : ""}`} onClick={onClick}>
      <Icon className={styles.icon} />
    </button>
  )

  const ToolbarDropdown = ({ label, icon: Icon, onClick }) => (
    <button type="button" className={styles.toolbarDropdown} onClick={onClick}>
      {label}
      <Icon className={styles.icon} />
    </button>
  )

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorWrapper}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <div className={styles.dropdownWrapper}>
              <ToolbarDropdown label="Aa" icon={ChevronDown} onClick={() => setShowFontSizeMenu(!showFontSizeMenu)} />
              {showFontSizeMenu && (
                <div className={styles.dropdownMenu}>
                  {["12px", "14px", "16px", "18px", "20px", "24px", "30px"].map((size) => (
                    <button
                      key={size}
                      className={styles.dropdownItem}
                      onClick={() => {
                        handleFormat("fontSize", size)
                        applyFormatting("fontSize", size)
                        setShowFontSizeMenu(false)
                      }}
                    >
                      <span style={{ fontSize: size }}>{size}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.toolbarGroup}>
            <ToolbarButton icon={Bold} active={editorState.formats.bold} onClick={() => applyFormatting("bold")} />
            <ToolbarButton
              icon={Italic}
              active={editorState.formats.italic}
              onClick={() => applyFormatting("italic")}
            />
            <ToolbarButton
              icon={Underline}
              active={editorState.formats.underline}
              onClick={() => applyFormatting("underline")}
            />
            <ToolbarButton icon={MoreHorizontal} />
          </div>

          <div className={styles.toolbarGroup}>
            <div className={styles.dropdownWrapper}>
              <ToolbarDropdown label="A" icon={ChevronDown} onClick={() => setShowColorMenu(!showColorMenu)} />
              {showColorMenu && (
                <div className={`${styles.dropdownMenu} ${styles.colorMenu}`}>
                  {[
                    "#000000",
                    "#FF0000",
                    "#00FF00",
                    "#0000FF",
                    "#FFFF00",
                    "#FF00FF",
                    "#00FFFF",
                    "#808080",
                    "#800000",
                    "#008000",
                  ].map((color) => (
                    <button
                      key={color}
                      className={styles.colorItem}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handleFormat("fontColor", color)
                        applyFormatting("foreColor", color)
                        setShowColorMenu(false)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.toolbarGroup}>
            <ToolbarButton
              icon={List}
              active={editorState.formats.listType === "bullet"}
              onClick={() => {
                const newListType = editorState.formats.listType === "bullet" ? "none" : "bullet"
                handleFormat("listType", newListType)
                applyFormatting(newListType === "bullet" ? "insertUnorderedList" : "outdent")
              }}
            />
            <ToolbarButton
              icon={ListOrdered}
              active={editorState.formats.listType === "number"}
              onClick={() => {
                const newListType = editorState.formats.listType === "number" ? "none" : "number"
                handleFormat("listType", newListType)
                applyFormatting(newListType === "number" ? "insertOrderedList" : "outdent")
              }}
            />
          </div>

          <div className={styles.toolbarGroup}>
            <ToolbarButton icon={CheckSquare} />
            <ToolbarButton icon={Link} />
            <ToolbarButton icon={Image} />
            <ToolbarButton icon={AtSign} />
            <ToolbarButton icon={Smile} />
            <ToolbarButton icon={Table} />
            <ToolbarButton icon={Code} />
            <ToolbarDropdown label="" icon={Plus} />
          </div>

          <div className={styles.toolbarGroup}>
            <ToolbarButton icon={Maximize} />
          </div>
        </div>

        {/* Editor content */}
        <div
          ref={editorRef}
          contentEditable
          className={`${styles.editorContent} ${editorState.formats.listType !== "none" ? styles.indented : ""}`}
          style={{
            fontSize: editorState.formats.fontSize,
            color: editorState.formats.fontColor,
          }}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          suppressContentEditableWarning
          data-placeholder="Type @ to mention a teammate and notify them about this issue."
        >
          {!editorState.text && !isFocused && (
            <span className={styles.placeholder}>Type @ to mention a teammate and notify them about this issue.</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default RichTextEditor