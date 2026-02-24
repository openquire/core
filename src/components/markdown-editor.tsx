'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Type, List, ListOrdered, Quote, Code, Bold, Italic, FileText, Sparkles } from 'lucide-react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface MarkdownEditorProps {
  note: Note | null;
  onSave: (id: string, updates: { title: string; content: string }) => Promise<void>;
}

interface SlashCommand {
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => { prefix: string; suffix: string };
}

const slashCommands: SlashCommand[] = [
  {
    label: 'Heading 1',
    icon: <Type className="h-4 w-4" />,
    description: 'Large heading',
    action: () => ({ prefix: '<h1>', suffix: '</h1>' }),
  },
  {
    label: 'Heading 2',
    icon: <Type className="h-4 w-4" />,
    description: 'Medium heading',
    action: () => ({ prefix: '<h2>', suffix: '</h2>' }),
  },
  {
    label: 'Heading 3',
    icon: <Type className="h-4 w-4" />,
    description: 'Small heading',
    action: () => ({ prefix: '<h3>', suffix: '</h3>' }),
  },
  {
    label: 'Bullet List',
    icon: <List className="h-4 w-4" />,
    description: 'Create a bullet list',
    action: () => ({ prefix: '<ul><li>', suffix: '</li></ul>' }),
  },
  {
    label: 'Numbered List',
    icon: <ListOrdered className="h-4 w-4" />,
    description: 'Create a numbered list',
    action: () => ({ prefix: '<ol><li>', suffix: '</li></ol>' }),
  },
  {
    label: 'Quote',
    icon: <Quote className="h-4 w-4" />,
    description: 'Insert a quote',
    action: () => ({ prefix: '<blockquote>', suffix: '</blockquote>' }),
  },
  {
    label: 'Code Block',
    icon: <Code className="h-4 w-4" />,
    description: 'Insert a code block',
    action: () => ({ prefix: '<pre><code>', suffix: '</code></pre>' }),
  },
  {
    label: 'Bold',
    icon: <Bold className="h-4 w-4" />,
    description: 'Bold text',
    action: () => ({ prefix: '<strong>', suffix: '</strong>' }),
  },
  {
    label: 'Italic',
    icon: <Italic className="h-4 w-4" />,
    description: 'Italic text',
    action: () => ({ prefix: '<em>', suffix: '</em>' }),
  },
];

export default function MarkdownEditor({ note, onSave }: MarkdownEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [slashFilter, setSlashFilter] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  // Store the selection range when slash menu is shown so clicks don't lose it
  const savedRangeRef = useRef<Range | null>(null);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });

  const filteredCommands = slashCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(slashFilter.toLowerCase())
  );

  // Update local state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      const htmlContent = note.content || '';
      setContent(htmlContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
      setHasChanges(false);
    }
  }, [note]);

  // Track changes
  useEffect(() => {
    if (note) {
      const titleChanged = title !== (note.title || '');
      const contentChanged = content !== (note.content || '');
      setHasChanges(titleChanged || contentChanged);
    }
  }, [title, content, note]);

  const handleSave = useCallback(async () => {
    if (!note || !hasChanges) return;
    setIsSaving(true);
    try {
      await onSave(note.id, { title, content });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [note, hasChanges, title, content, onSave]);

  // Auto-save after 2 seconds
  useEffect(() => {
    if (!hasChanges) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [hasChanges, handleSave]);

  const getCaretCoordinates = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();
    if (!editorRect) return null;
    return {
      top: rect.bottom - editorRect.top + 5,
      left: rect.left - editorRect.left,
    };
  };

  const insertSlashCommand = useCallback((command: SlashCommand) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection) return;

    // Restore saved range (clicks on menu buttons move focus away from editor)
    if (savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
      savedRangeRef.current = null;
    }

    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) {
      setShowSlashMenu(false);
      setSlashFilter('');
      return;
    }

    const text = textNode.textContent || '';
    const cursorPos = range.startOffset;

    const beforeCursor = text.substring(0, cursorPos);
    const slashIndex = beforeCursor.lastIndexOf('/');

    if (slashIndex === -1) {
      setShowSlashMenu(false);
      setSlashFilter('');
      return;
    }

    const beforeText = text.substring(0, slashIndex);
    const afterText = text.substring(cursorPos);

    // Create the new element
    const { prefix, suffix } = command.action();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = prefix + suffix;

    // Add <br> placeholder to empty elements so they are visible and editable
    tempDiv.querySelectorAll('*').forEach(el => {
      if (el.childNodes.length === 0) {
        el.appendChild(document.createElement('br'));
      }
    });

    const newElement = tempDiv.firstElementChild;
    if (!newElement) return;

    const parent = textNode.parentNode;
    if (!parent) return;

    // Block-level elements must be direct children of the editor for CSS to apply.
    // After pressing Enter, browsers wrap new lines in <div> elements, so the
    // text node may be inside a wrapper rather than directly in the editor.
    const blockTags = new Set(['H1', 'H2', 'H3', 'UL', 'OL', 'BLOCKQUOTE', 'PRE']);
    const isBlock = blockTags.has(newElement.tagName);

    // Find the ancestor that is a direct child of the editor
    let directChild: Node | null = null;
    if (parent !== editor) {
      let current: Node | null = parent;
      while (current && current.parentNode !== editor) {
        current = current.parentNode;
      }
      directChild = current;
    }

    if (directChild && isBlock) {
      // Text is inside a wrapper (browser-generated <div>, etc.)
      // Hoist the block element to be a direct child of the editor
      if (beforeText) {
        textNode.textContent = beforeText;
      } else {
        parent.removeChild(textNode);
      }

      // If the wrapper is now empty, replace it; otherwise insert after it
      const wrapperEmpty = !(directChild as HTMLElement).textContent?.trim();
      if (wrapperEmpty) {
        editor.insertBefore(newElement, directChild);
        editor.removeChild(directChild);
      } else {
        if (directChild.nextSibling) {
          editor.insertBefore(newElement, directChild.nextSibling);
        } else {
          editor.appendChild(newElement);
        }
      }

      // If there was text after the cursor, put it in a new line after the element
      if (afterText) {
        const afterDiv = document.createElement('div');
        afterDiv.textContent = afterText;
        if (newElement.nextSibling) {
          editor.insertBefore(afterDiv, newElement.nextSibling);
        } else {
          editor.appendChild(afterDiv);
        }
      }
    } else {
      // Direct child of editor, or inline element — insert in place
      if (beforeText) {
        parent.insertBefore(document.createTextNode(beforeText), textNode);
      }
      parent.insertBefore(newElement, textNode);
      if (afterText) {
        parent.insertBefore(document.createTextNode(afterText), textNode);
      }
      parent.removeChild(textNode);
    }

    // Place cursor inside the deepest element (before the <br> placeholder)
    let target: Element = newElement;
    while (target.lastElementChild && target.lastElementChild.tagName !== 'BR') {
      target = target.lastElementChild;
    }
    const newRange = document.createRange();
    newRange.setStart(target, 0);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    setShowSlashMenu(false);
    setSlashFilter('');
    setContent(editor.innerHTML);
    editor.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Exit block elements (code block, blockquote) on Enter when at the end
    // with an empty trailing line (i.e. user pressed Enter twice at the end)
    if (e.key === 'Enter' && !e.shiftKey && !showSlashMenu) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        const range = sel.getRangeAt(0);
        if (range.collapsed) {
          let blockEl: HTMLElement | null = null;
          let node: Node | null = range.startContainer;
          while (node && node !== editorRef.current) {
            if (node instanceof HTMLElement && (node.tagName === 'PRE' || node.tagName === 'BLOCKQUOTE')) {
              blockEl = node;
              break;
            }
            node = node.parentNode;
          }

          if (blockEl) {
            const textContent = blockEl.textContent || '';

            // Check if cursor is at the very end of the block
            const endRange = range.cloneRange();
            endRange.selectNodeContents(blockEl);
            endRange.setStart(range.endContainer, range.endOffset);
            const isAtEnd = endRange.toString().length === 0;

            if (isAtEnd && (textContent.endsWith('\n') || !textContent.trim())) {
              e.preventDefault();

              if (!textContent.trim()) {
                // Block is empty — replace it with a plain line
                const newDiv = document.createElement('div');
                newDiv.appendChild(document.createElement('br'));
                editorRef.current.insertBefore(newDiv, blockEl);
                editorRef.current.removeChild(blockEl);
                const newRange = document.createRange();
                newRange.setStart(newDiv, 0);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
              } else {
                // Remove the trailing newline from the block
                const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
                let lastText: Text | null = null;
                while (walker.nextNode()) {
                  lastText = walker.currentNode as Text;
                }
                if (lastText?.textContent?.endsWith('\n')) {
                  lastText.textContent = lastText.textContent.slice(0, -1);
                  if (!lastText.textContent) {
                    lastText.parentNode?.removeChild(lastText);
                  }
                }

                // Create a new line after the block
                const newDiv = document.createElement('div');
                newDiv.appendChild(document.createElement('br'));
                if (blockEl.nextSibling) {
                  editorRef.current.insertBefore(newDiv, blockEl.nextSibling);
                } else {
                  editorRef.current.appendChild(newDiv);
                }
                const newRange = document.createRange();
                newRange.setStart(newDiv, 0);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
              }

              setContent(editorRef.current.innerHTML);
              return;
            }
          }
        }
      }
    }

    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          insertSlashCommand(filteredCommands[selectedCommandIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
        setSlashFilter('');
        return;
      }
    }
    // Don't prevent Enter for normal typing
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    setContent(editorRef.current.innerHTML);

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setShowSlashMenu(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;

    if (node.nodeType !== Node.TEXT_NODE) {
      setShowSlashMenu(false);
      setSlashFilter('');
      return;
    }

    const text = node.textContent || '';
    const beforeCursor = text.substring(0, offset);
    const slashIndex = beforeCursor.lastIndexOf('/');

    if (slashIndex !== -1) {
      const beforeSlash = beforeCursor.substring(0, slashIndex);
      // Check if slash is at start or after whitespace
      if (beforeSlash.length === 0 || /[\s\n]$/.test(beforeSlash)) {
        const filter = beforeCursor.substring(slashIndex + 1);
        // Only show menu if filter doesn't contain spaces
        if (!filter.includes(' ')) {
          setSlashFilter(filter);
          setSelectedCommandIndex(0);

          // Save the current selection so clicks on menu buttons can restore it
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
          }

          const coords = getCaretCoordinates();
          if (coords) {
            setSlashMenuPosition(coords);
          }
          setShowSlashMenu(true);
          return;
        }
      }
    }

    setShowSlashMenu(false);
    setSlashFilter('');
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Close slash menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showSlashMenu && editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setShowSlashMenu(false);
        setSlashFilter('');
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showSlashMenu]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center max-w-md px-8">
          {/* Decorative background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3B7EF4]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#96D9A5]/10 rounded-full blur-3xl" />
          </div>
          
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-xl" style={{
              background: 'linear-gradient(to top right, #3B7EF4, #96D9A5)'
            }}>
              <FileText className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Welcome to <Logo size="sm" variant="dark" className="inline-flex" />
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Select a note from the sidebar or create a new one to start writing your thoughts.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-[#96D9A5]" />
              <span>Type <kbd className="px-2 py-0.5 rounded bg-muted border border-border text-xs font-mono">/</kbd> for formatting commands</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border p-4 pl-14 lg:pl-4">
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-xl font-semibold border-none shadow-none focus:outline-none bg-transparent flex-1"
          />
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="sm"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        {hasChanges && (
          <p className="text-xs text-muted-foreground mt-1">Unsaved changes</p>
        )}
      </div>

      <div className="flex-1 p-4 relative overflow-auto">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          style={{ lineHeight: '1.7', minHeight: '300px' }}
          data-placeholder="Start writing... Type '/' for commands"
          className={cn(
            'w-full min-h-full focus:outline-none prose prose-sm max-w-none',
            '[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-0',
            '[&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:mt-4',
            '[&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>h3]:mt-3',
            '[&>p]:mb-4 [&>p]:leading-relaxed',
            '[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4',
            '[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4',
            '[&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground',
            '[&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto',
            '[&>strong]:font-bold',
            '[&>em]:italic',
            'before:text-muted-foreground before:pointer-events-none',
            'empty:before:content-[attr(data-placeholder)]'
          )}
        />

        {showSlashMenu && (
          <div
            style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
            className="absolute z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[220px] max-h-80 overflow-y-auto"
          >
            <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border mb-1 font-medium">
              Basic blocks
            </div>
            {filteredCommands.map((command, index) => (
              <button
                key={command.label}
                type="button"
                onMouseDown={(e) => {
                  // Prevent focus from leaving the contentEditable editor
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  insertSlashCommand(command);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors',
                  selectedCommandIndex === index && 'bg-accent'
                )}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded border bg-background text-muted-foreground">
                  {command.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{command.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {command.description}
                  </div>
                </div>
              </button>
            ))}
            {filteredCommands.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No commands found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
