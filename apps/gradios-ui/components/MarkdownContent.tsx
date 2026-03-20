"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ComponentPropsWithoutRef } from "react";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }: ComponentPropsWithoutRef<"code">) {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");

          if (match) {
            return (
              <div className="my-2 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between bg-zinc-800 px-4 py-1.5">
                  <span className="text-xs text-zinc-400">{match[1]}</span>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: "#1e1e2e",
                    fontSize: "0.8125rem",
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          }

          return (
            <code
              className="bg-zinc-700/50 text-zinc-200 px-1.5 py-0.5 rounded text-[0.8125rem]"
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
        },
        h1({ children }) {
          return <h1 className="text-lg font-bold mb-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-base font-bold mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-sm font-bold mb-1">{children}</h3>;
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full text-sm border-collapse border border-zinc-700">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-left font-medium">
              {children}
            </th>
          );
        },
        td({ children }) {
          return <td className="border border-zinc-700 px-3 py-1.5">{children}</td>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-indigo-500 pl-3 my-2 text-zinc-400 italic">
              {children}
            </blockquote>
          );
        },
        a({ href, children }) {
          return (
            <a href={href} className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
        strong({ children }) {
          return <strong className="font-semibold text-zinc-100">{children}</strong>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
