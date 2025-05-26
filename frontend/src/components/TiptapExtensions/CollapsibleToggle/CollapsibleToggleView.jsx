import React, { useCallback } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import './CollapsibleToggle.css'; // We will create this CSS file

const CollapsibleToggleView = ({ node, editor, getPos, HTMLAttributes }) => {
  const { isOpen } = node.attrs;

  const toggleOpen = useCallback(() => {
    if (typeof getPos === 'function') {
      editor.view.dispatch(
        editor.view.state.tr.setNodeMarkup(getPos(), undefined, {
          ...node.attrs,
          isOpen: !isOpen,
        })
      );
    }
  }, [editor, getPos, node.attrs, isOpen]);

  // The first child of the content is treated as the summary.
  // This is a simplified approach. A more robust way might involve dedicated attributes or slots.
  // For this implementation, we assume the first paragraph (or block) inside the toggle is the summary.
  // However, Tiptap's direct rendering of content means we can't easily separate the first child
  // to be *outside* the NodeViewContent without complex content manipulation.
  // So, we'll use the <details> and <summary> structure directly,
  // and the content of the summary will be part of the Tiptap editable content.

  // The content of the <summary> tag itself won't be directly editable through this NodeView's props.
  // Instead, the content *inside* the collapsibleToggle node (which includes what acts as a summary)
  // is handled by Tiptap's normal content rendering mechanism into NodeViewContent.
  // The `renderHTML` in `CollapsibleToggleNode.js` already sets up a placeholder summary.
  // To make the summary truly editable as part of the node's direct content:
  // The first child of the 'collapsibleToggle' node could be designated as the summary.
  // For now, the 'Toggle Summary' text from renderHTML is static.
  // A more advanced setup would involve rendering the first child of the node's content
  // specifically within the <summary> tag.

  // Let's adjust to a structure where the <summary> is part of the NodeViewWrapper
  // and the actual togglable content is inside NodeViewContent.
  // The summary text itself will be handled by the content within the node.
  // The `renderHTML` in Node.js has a placeholder for the summary.
  // This means the first `block` element inside the `collapsibleToggle` node will effectively be the summary.

  return (
    <NodeViewWrapper {...HTMLAttributes} className={`collapsible-toggle-wrapper ${isOpen ? 'is-open' : ''}`}>
      <details open={isOpen}>
        <summary onClick={(e) => {
          // We prevent default to stop the browser's native toggle,
          // as we are controlling the 'open' state via Tiptap attributes.
          // However, for a pure <details> element, this might not be strictly necessary
          // if we ensure the 'open' attribute is synced.
          // For better control and to ensure Tiptap's state is the source of truth:
          e.preventDefault(); 
          toggleOpen();
        }}>
          {/* 
            This is tricky. If the summary is the first child, how do we render it here
            and the rest of the content in NodeViewContent?
            A common pattern is to have a dedicated attribute for summary or make the first child's content
            the summary.
            For simplicity, the `renderHTML` in `CollapsibleToggleNode.js` already puts a "Toggle Summary" text.
            If we want the summary itself to be part of the editable content that NodeViewContent handles,
            we might need a different approach.
            
            The simplest way with the current `renderHTML` is that the `summary` tag is static,
            and `NodeViewContent` renders the content *after* this static summary.
            If `CollapsibleToggleNode.js` `renderHTML` is `['details', ..., ['summary', 'Fixed Summary'], ['div', 0]]`
            Then `NodeViewContent` goes into the `div`.

            If the `renderHTML` is `['details', ..., 0]`, and the first child of content is to be the summary,
            that's more complex for a React node view to split.

            Given our `CollapsibleToggleNode.js` `renderHTML`:
            `['details', mergeAttributes(attrs), 
              ['summary', {}, 'Toggle Summary'], // This is a static summary
              ['div', { 'data-collapsible-content': 'true' }, 0] // NodeViewContent renders here
            ]`
            The summary is currently static "Toggle Summary". To make it editable,
            the content of the summary itself needs to be a contenteditable region, or
            the first child of the `collapsibleToggle` node needs to be treated as the summary.

            Let's assume the `renderHTML` in `CollapsibleToggleNode.js` is simplified or the first child
            is the summary. For the React view, we'll render the summary part manually for interaction,
            and then `NodeViewContent` for the rest.
            This means the NodeViewContent will contain *both* the summary and the content if we are not careful.

            The `CollapsibleToggleNode.js` `renderHTML` already defines a structure with a summary
            and a div for content. The `ReactNodeViewRenderer` will place the `NodeViewContent`
            into the element marked with `0`.
          */}
          {/* Placeholder for summary text, actual summary is rendered by Tiptap into NodeViewContent if it's the first child */}
          {/* This is a visual cue, the actual summary content is part of the node's children */}
          <span className="toggle-summary-placeholder">Toggle Summary</span>
        </summary>
        {/* NodeViewContent renders the children of the 'collapsibleToggle' node */}
        {/* This content should ideally start with a paragraph that acts as the summary,
            followed by the collapsible content. */}
        <div className="collapsible-content" style={{ display: isOpen ? 'block' : 'none' }}>
          <NodeViewContent className="content-area"/>
        </div>
      </details>
    </NodeViewWrapper>
  );
};


// Let's simplify the view based on the `renderHTML` in `CollapsibleToggleNode.js`.
// The `renderHTML` creates a `<summary>` and a `<div>` for content.
// `NodeViewContent` will render into the `div`.
// The clickable part is the `summary`.

const CollapsibleToggleViewFinal = ({ node, editor, getPos, HTMLAttributes }) => {
  const { isOpen } = node.attrs;

  const toggleNode = useCallback(() => {
    if (typeof getPos === 'function' && editor.isEditable) {
      editor.chain().focus().setNodeMarkup(getPos(), undefined, { ...node.attrs, isOpen: !isOpen }).run();
    }
  }, [editor, getPos, node.attrs, isOpen]);

  // The actual summary content will be the first child of the NodeViewContent.
  // This React component primarily handles the open/close state and overall wrapper.
  // The structure defined in `CollapsibleToggleNode.js`'s `renderHTML` is what Tiptap uses
  // to structure the content. The ReactNodeViewRenderer then takes over this structure.
  // The `summary` tag rendered by `renderHTML` is the one users will click.
  // We need to make sure *that* summary click toggles our state.

  return (
    // HTMLAttributes already contains 'open' if isOpen is true from renderHTML
    // The NodeViewWrapper wraps the <details> element produced by renderHTML.
    <NodeViewWrapper 
      {...HTMLAttributes} 
      className={`collapsible-toggle-node-view ${isOpen ? 'is-open' : ''}`}
      as="details" // Important: render this wrapper as a details element
      open={isOpen} // Control the open state
      onClick={(e) => { // We can also listen on the wrapper (details tag)
        // Check if the click was on the summary part
        if (e.target.tagName === 'SUMMARY') {
          e.preventDefault(); // Prevent default only if we are manually handling state
          toggleNode();
        }
      }}
    >
      {/* 
        The `renderHTML` in `CollapsibleToggleNode.js` is:
        ['details', mergeAttributes(attrs), 
          ['summary', {}, 'Toggle Summary'], // THIS IS THE SUMMARY USERS CLICK
          ['div', { 'data-collapsible-content': 'true' }, 0] // NodeViewContent goes here
        ]
        So, NodeViewContent will render the actual content (what's inside the toggle).
        The "Toggle Summary" is static from renderHTML.
        To make the summary editable, it must be part of the content rendered by NodeViewContent.
        This means the first child of CollapsibleToggleNode's content should be the summary.
      */}
      <NodeViewContent className="collapsible-toggle-content-view" />
    </NodeViewWrapper>
  );
};
// The above approach still has issues with summary. The summary tag needs to be part of THIS view
// if we want to attach React event handlers to IT specifically and make IT editable.

// Corrected approach for React Node View:
// The NodeView should render the <details> and <summary> itself,
// and then use NodeViewContent for the content *inside* the details (excluding summary).
// This means `renderHTML` in the Node.js file is more of a fallback or SSR representation.
// The React Node View takes precedence on the client-side.

// Let's refine `CollapsibleToggleNode.js` `renderHTML` to be simpler if React view handles structure:
// `renderHTML`: `['div', HTMLAttributes, 0]` and the React view builds `details/summary/content`.
// Or, keep renderHTML as is, and the React View has to work with it.

// Sticking to the Tiptap docs pattern: NodeViewWrapper becomes the outer tag from renderHTML.
// If renderHTML is `['details', ..., ['summary', 'Static'], ['div', 0]]`,
// then NodeViewWrapper is the `details`. The `summary` is static. NodeViewContent is the `div`.
// The click on the static summary needs to be caught by the `details` wrapper.

// Final simplified version for the view, assuming the structure from CollapsibleToggleNode.js's renderHTML:
// The actual summary is rendered by Tiptap. We just handle the open state.
// The click handler on NodeViewWrapper (as 'details') should work.
const FinalCollapsibleToggleView = ({ node, editor, getPos, HTMLAttributes }) => {
  const { isOpen } = node.attrs;

  // This function is called when the <summary> (part of Tiptap's rendered HTML for the node) is clicked.
  // The NodeViewWrapper itself is the <details> tag.
  const handleClick = (event) => {
    // We only want to handle clicks on the summary part if it's part of this NodeView's direct DOM
    // However, the summary is rendered by Tiptap's core based on `renderHTML`.
    // The event target will be the actual <summary> element.
    if (event.target.tagName === 'SUMMARY' && editor.isEditable) {
      event.preventDefault(); // Stop the default <details> toggle behavior
      // Update the node's 'isOpen' attribute
      if (typeof getPos === 'function') {
         editor.chain().focus(getPos()).setNodeMarkup(getPos(), undefined, { ...node.attrs, isOpen: !isOpen }).run();
      }
    }
  };

  return (
    <NodeViewWrapper 
      as="details" // The NodeViewWrapper itself is the <details> tag
      {...HTMLAttributes} // HTMLAttributes from renderHTML, includes 'open' if isOpen
      className={`collapsible-toggle-node-view ${isOpen ? 'is-open' : ''}`}
      onClick={handleClick} // Capture clicks to manually toggle state via Tiptap
      // `open` attribute is managed by Tiptap through HTMLAttributes based on node.attrs.isOpen
    >
      {/* 
        The `renderHTML` in CollapsibleToggleNode.js defines:
        ['details', openAttributeIfSet,
          ['summary', {}, 'Toggle Summary'], // This is a static summary from renderHTML
          ['div', { 'data-collapsible-content': 'true' }, 0] // NodeViewContent goes here
        ]
        So, NodeViewContent renders the content that should be collapsible.
        The "Toggle Summary" text is static based on this.
        If we want an editable summary, the first child of the 'collapsibleToggle' node
        should be rendered *as* the summary. This requires a more complex NodeView or
        modifying the content schema.
      */}
      <NodeViewContent className="content-area" />
    </NodeViewWrapper>
  );
};


export default FinalCollapsibleToggleView;
