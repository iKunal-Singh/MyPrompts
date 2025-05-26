import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold, faItalic, faListUl, faListOl, faCode, faQuoteRight, faParagraph, faHeading, faUndo, faRedo,
  faChevronDown // Step 2.1: Import an icon (e.g., faChevronDown or faAngleDown)
} from '@fortawesome/free-solid-svg-icons';
import './MenuBar.css'; 

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Define menu items with their actions, icons, and active states
  const menuItems = [
    { action: () => editor.chain().focus().toggleBold().run(), icon: faBold, label: 'Bold', isActive: editor.isActive('bold'), can: editor.can().toggleBold() },
    { action: () => editor.chain().focus().toggleItalic().run(), icon: faItalic, label: 'Italic', isActive: editor.isActive('italic'), can: editor.can().toggleItalic() },
    { 
      action: () => editor.chain().focus().toggleCode().run(), 
      textIcon: '``', // Using text for inline code
      label: 'Inline Code', 
      isActive: editor.isActive('code'),
      can: editor.can().toggleCode()
    },
    { 
      action: () => editor.chain().focus().toggleCodeBlock().run(), 
      icon: faCode, 
      label: 'Code Block', 
      isActive: editor.isActive('codeBlock'),
      can: editor.can().toggleCodeBlock()
    },
    // Step 2.2 & 2.3: Add new menu item for Collapsible Toggle
    { 
      action: () => editor.chain().focus().toggleCollapsibleToggle().run(), 
      icon: faChevronDown, 
      label: 'Collapsible Toggle', 
      isActive: editor.isActive('collapsibleToggle'), // This relies on Tiptap's isActive check for the node
      can: editor.can().toggleCollapsibleToggle ? editor.can().toggleCollapsibleToggle() : true // Check if command exists and can be run
    },
    { action: () => editor.chain().focus().setParagraph().run(), icon: faParagraph, label: 'Paragraph', isActive: editor.isActive('paragraph'), can: editor.can().setParagraph() },
    { action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), icon: faHeading, label: 'H1', isActive: editor.isActive('heading', { level: 1 }), can: editor.can().toggleHeading({level: 1}) },
    { action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), icon: faHeading, label: 'H2', isActive: editor.isActive('heading', { level: 2 }), can: editor.can().toggleHeading({level: 2}) },
    { action: () => editor.chain().focus().toggleBulletList().run(), icon: faListUl, label: 'Bullet List', isActive: editor.isActive('bulletList'), can: editor.can().toggleBulletList() },
    { action: () => editor.chain().focus().toggleOrderedList().run(), icon: faListOl, label: 'Ordered List', isActive: editor.isActive('orderedList'), can: editor.can().toggleOrderedList() },
    { action: () => editor.chain().focus().toggleBlockquote().run(), icon: faQuoteRight, label: 'Blockquote', isActive: editor.isActive('blockquote'), can: editor.can().toggleBlockquote() },
    { action: () => editor.chain().focus().undo().run(), icon: faUndo, label: 'Undo', isDisabled: !editor.can().undo(), can: editor.can().undo() },
    { action: () => editor.chain().focus().redo().run(), icon: faRedo, label: 'Redo', isDisabled: !editor.can().redo(), can: editor.can().redo()  },
  ];

  return (
    <div className="prompt-editor-menubar"> {/* Ensure this class matches your CSS */}
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className={`menubar-button ${item.isActive ? 'is-active' : ''} ${item.textIcon ? 'menubar-button-text-icon' : ''}`}
          title={item.label}
          disabled={item.isDisabled || !item.can} // Disable if action cannot be performed or explicitly disabled
        >
          {item.icon && <FontAwesomeIcon icon={item.icon} />}
          {item.textIcon && <span className="text-icon">{item.textIcon}</span>}
          {/* {!item.icon && !item.textIcon && item.label} Optional: Show label if no icon */}
        </button>
      ))}
    </div>
  );
};

export default MenuBar;
