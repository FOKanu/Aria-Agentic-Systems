import React, { useEffect, useRef } from 'react';
import { useChatContext } from '@/hooks/useChatContext';

interface PageContextWrapperProps {
  pageId: string;
  pageName: string;
  pageCategory?: string;
  children: React.ReactNode;
  data?: Record<string, unknown>; // Updated to unknown for better type safety
}

/**
 * Wraps page content to automatically extract text and provide context to the AI Chat.
 * This prevents hallucinations by giving the AI the actual text visible on the page.
 */
export function PageContextWrapper({
  pageId,
  pageName,
  pageCategory,
  children,
  data
}: PageContextWrapperProps) {
  const { setPageContext } = useChatContext();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to extract text content from the DOM
    const extractContent = () => {
      if (!contentRef.current) return '';

      // Simple text extraction (can be improved to respect structure)
      // We limit it to ~3000 chars to avoid blowing up the context window
      const text = contentRef.current.innerText
        .replace(/\s+/g, ' ') // Collapse whitespace
        .slice(0, 3000);

      return text;
    };

    const contentText = extractContent();

    setPageContext({
      pageId,
      pageName,
      pageCategory,
      contextData: {
        ...data,
        visibleText: contentText,
      },
    });

    // Cleanup
    return () => setPageContext(null);
  }, [pageId, pageName, pageCategory, data, setPageContext]);

  return (
    <div ref={contentRef} className="contents">
      {children}
    </div>
  );
}
