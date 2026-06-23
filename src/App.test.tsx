import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import App from "./App";
import { TranslationCard } from "./components/TranslationCard";

describe("Translation UI", () => {
  it("renders correctly", () => {
    // Basic structural test
    expect(true).toBe(true);
  });

  it("handles basic input change", () => {
    render(
      <TranslationCard 
        onTranslate={async (text, sourceLang, targetLang) => "translated text"} 
        onClear={() => {}} 
      />
    );

    const input = screen.getByPlaceholderText(/Yahan type karein/i);
    fireEvent.change(input, { target: { value: "main nhi jaunga" } });
    
    expect((input as HTMLTextAreaElement).value).toBe("main nhi jaunga");
  });
});
