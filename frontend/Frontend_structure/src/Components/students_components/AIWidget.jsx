import { useState } from "react";

export default function AIWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    {
      text: "Hi Alex. I can summarize lessons, quiz you, or help plan your next assignment sprint.",
      isUser: false,
    },
  ]);

  const send = () => {
    if (!input.trim()) return;
    const newMsgs = [...msgs, { text: input, isUser: true }];
    setMsgs(newMsgs);
    setInput("");
    setTimeout(() => {
      setMsgs([
        ...newMsgs,
        {
          text: "Try asking for a 10-minute revision plan or a simple explanation of the topic you are studying.",
          isUser: false,
        },
      ]);
    }, 800);
  };

  return (
    <div className="sd-ai-widget">
      <div className={`sd-ai-panel${open ? " open" : ""}`}>
        <div className="sd-ai-panel-header">
          <div className="sd-ai-panel-icon">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <div className="sd-ai-panel-title">JAWA AI Study Assistant</div>
            <div className="sd-ai-panel-sub">Ready to help you study smarter</div>
          </div>
        </div>
        <div className="sd-ai-chat-body">
          {msgs.map((msg, index) => (
            <div key={`${msg.text}-${index}`} className={`sd-ai-msg${msg.isUser ? " user" : ""}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="sd-ai-input-row">
          <input
            className="sd-ai-input"
            placeholder="Ask me anything..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && send()}
          />
          <button className="sd-ai-send" type="button" onClick={send} aria-label="Send message">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <button className="sd-ai-bubble" type="button" onClick={() => setOpen(!open)} aria-label="Open AI assistant">
        <i className="fa-solid fa-robot"></i>
      </button>
    </div>
  );
}
