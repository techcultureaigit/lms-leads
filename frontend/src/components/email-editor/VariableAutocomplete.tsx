import React, { useState, useRef, useEffect } from "react";

interface VariableAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  type?: "textarea" | "input";
}

const AVAILABLE_VARIABLES = [
  { key: "name", label: "Name", value: "{{name}}" },
  { key: "email", label: "Email", value: "{{email}}" },
  { key: "company", label: "Company", value: "{{company}}" },
  { key: "date", label: "Date", value: "{{date}}" },
  { key: "year", label: "Year", value: "{{year}}" },
];

export const VariableAutocomplete: React.FC<VariableAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
  type = "textarea",
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof AVAILABLE_VARIABLES>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const currentElement = type === "textarea" ? textareaRef.current : inputRef.current;
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        currentElement &&
        !currentElement.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [type]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check if user typed {{ or is typing after {{
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastOpenBrace = textBeforeCursor.lastIndexOf("{{");
    const lastCloseBrace = textBeforeCursor.lastIndexOf("}}");

    if (
      lastOpenBrace !== -1 &&
      (lastCloseBrace === -1 || lastCloseBrace < lastOpenBrace) &&
      cursorPos >= lastOpenBrace
    ) {
      // User is typing after {{, show suggestions
      const searchText = textBeforeCursor.substring(lastOpenBrace + 2).toLowerCase();
      const filtered = AVAILABLE_VARIABLES.filter((v) =>
        v.key.toLowerCase().startsWith(searchText)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertVariable = (variable: string) => {
    const currentElement = type === "textarea" ? textareaRef.current : inputRef.current;
    if (!currentElement) return;

    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const lastOpenBrace = textBeforeCursor.lastIndexOf("{{");

    if (lastOpenBrace !== -1) {
      // Replace from {{ to cursor position with the variable
      const newText =
        value.substring(0, lastOpenBrace) + variable + textAfterCursor;
      onChange(newText);

      // Set cursor position after inserted variable
      setTimeout(() => {
        if (currentElement) {
          const newCursorPos = lastOpenBrace + variable.length;
          currentElement.setSelectionRange(newCursorPos, newCursorPos);
          currentElement.focus();
        }
      }, 0);
    }

    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertVariable(suggestions[selectedIndex].value);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastOpenBrace = textBeforeCursor.lastIndexOf("{{");
    const lastCloseBrace = textBeforeCursor.lastIndexOf("}}");

    if (
      lastOpenBrace !== -1 &&
      (lastCloseBrace === -1 || lastCloseBrace < lastOpenBrace) &&
      cursorPos >= lastOpenBrace
    ) {
      const searchText = textBeforeCursor.substring(lastOpenBrace + 2).toLowerCase();
      const filtered = AVAILABLE_VARIABLES.filter((v) =>
        v.key.toLowerCase().startsWith(searchText)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  return (
    <div className="relative w-full">
      {type === "textarea" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={className}
          rows={rows}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={className}
        />
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 z-[9999] bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
          style={{ 
            minWidth: "200px",
            width: "100%",
            backgroundColor: "white",
            opacity: 1,
            marginTop: "4px",
            top: "100%",
            left: 0,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.key}
              type="button"
              onClick={() => insertVariable(suggestion.value)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                index === selectedIndex ? "bg-[#fbc40c] text-white" : "bg-white"
              }`}
            >
              <div className={`font-medium ${index === selectedIndex ? "text-white" : "text-gray-900"}`}>{suggestion.value}</div>
              <div className={`text-xs ${index === selectedIndex ? "text-yellow-100" : "text-gray-500"}`}>{suggestion.label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
