import { useCallback, useRef, useLayoutEffect } from "react";
import "./ChatComposer.css";
import { FaPlus } from "react-icons/fa6";

// NOTE: Public API (props) kept identical for drop-in upgrade
const ChatComposer = ({ input, setInput, onSend, isSending }) => {
  const textareaRef = useRef(null);

  // Auto-grow textarea height up to max-height
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 320) + "px";
  }, [input]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.trim()) onSend();
      }
    },
    [onSend, input],
  );

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (input.trim()) onSend();
      }}
    >
     


      <div className="composer-surface">
  <div className="composer-field flex items-center justify-center gap-2">
    <FaPlus className="composer-plus" />

    <textarea
      ref={textareaRef}
      className="composer-input"
      placeholder="Ask Anything"
      aria-label="Message"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      rows={1}
    />
  </div>

  <button
    type="submit"
    className="send-btn "
    
    disabled={!input.trim() || isSending}
  >
  </button>
</div>
    </form>
  );
};

export default ChatComposer;
