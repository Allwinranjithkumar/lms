import { useState } from "react";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    {
      text: "Hi Professor. I can summarize class progress, draft feedback, or help plan your next lesson.",
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
          text: "I can turn that into a class summary, student feedback note, or a quick teaching plan.",
          isUser: false,
        },
      ]);
    }, 800);
  };

  return (
    <div className="ai-widget">
      <div className={`ai-panel${open ? " open" : ""}`}>
        <div className="ai-panel-header">
          <div className="ai-panel-icon">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <div className="ai-panel-title">JAWA AI Teaching Assistant</div>
            <div className="ai-panel-sub">Ready to support your classroom</div>
          </div>
        </div>
        <div className="ai-chat-body">
          {msgs.map((msg, index) => (
            <div key={`${msg.text}-${index}`} className={`ai-msg${msg.isUser ? " user" : ""}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="ai-input-row">
          <input
            className="ai-input"
            placeholder="Ask me anything..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && send()}
          />
          <button className="ai-send" type="button" onClick={send} aria-label="Send message">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <button className="ai-bubble" type="button" onClick={() => setOpen(!open)} aria-label="Open AI assistant">
        <i className="fa-solid fa-robot"></i>
      </button>
    </div>
  );
}
