import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CollapsibleToggleView from './CollapsibleToggleView';

const CollapsibleToggleNode = Node.create({
  name: 'collapsibleToggle',
  group: 'block',
  content: 'block+', // Allows other block elements (like paragraphs, lists, etc.) inside
  defining: true, // Ensures that this node is treated as a single unit

  addAttributes() {
    return {
      isOpen: {
        default: false,
      },
      // You might add a 'summary' attribute if you want to store the summary text separately
      // summary: {
      //   default: 'Toggle Summary',
      // },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'details',
        getAttrs: dom => ({ isOpen: dom.hasAttribute('open') }),
        contentElement: 'div[data-collapsible-content]', // Points to the div inside details for content
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    // The <details> tag inherently handles open/close state via its 'open' attribute
    // The actual toggle mechanism will be handled by the React Node View
    // We ensure the 'open' attribute is present if node.attrs.isOpen is true
    const attrs = { ...HTMLAttributes };
    if (node.attrs.isOpen) {
      attrs.open = ''; // The mere presence of 'open' attribute makes it open
    }
    
    // The structure for Tiptap's content rendering:
    // <details {...attrs}>
    //   <summary>Toggle Summary</summary> // Summary might be editable or fixed
    //   <div data-collapsible-content="true"></div> // NodeViewContent will render content here
    // </details>
    return ['details', mergeAttributes(attrs), 
            ['summary', {}, 'Toggle Summary'], // Placeholder summary, can be made editable later
            ['div', { 'data-collapsible-content': 'true' }, 0] // 0 indicates where content should be rendered
           ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CollapsibleToggleView);
  },

  addCommands() {
    return {
      toggleCollapsibleToggle: () => ({ commands, editor }) => {
        // Try to find if the current selection is inside a collapsibleToggle
        const { selection } = editor.state;
        let pos = null;
        if (selection.$from.depth > 0) {
            for (let i = selection.$from.depth; i > 0; i--) {
                if (selection.$from.node(i).type.name === this.name) {
                    pos = selection.$from.before(i);
                    break;
                }
            }
        }

        // If inside a toggle, toggle its state
        if (pos !== null) {
            const node = editor.state.doc.nodeAt(pos);
            if (node) {
                return commands.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    isOpen: !node.attrs.isOpen,
                });
            }
        }
        
        // If not inside or couldn't find, insert a new one
        // Default new toggles to be open for better UX during creation
        return commands.insertContent({
          type: this.name,
          attrs: { isOpen: true }, 
          content: [
            { type: 'paragraph', content: [{type: 'text', text: 'Summary (click to edit)'}] }, // Default summary, will be part of content
            { type: 'paragraph' } // Default empty paragraph for content
          ],
        });
      },
      // Command to set the summary text directly if we decide to make summary an attribute
      // setToggleSummary: (summaryText) => ({ commands }) => {
      //   return commands.updateAttributes(this.name, { summary: summaryText });
      // },
    };
  },
});

export default CollapsibleToggleNode;
