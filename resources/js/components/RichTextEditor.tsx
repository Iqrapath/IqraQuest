import React, { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { usePage } from '@inertiajs/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Unlink
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
    const { translations } = usePage<any>().props;
    const __ = (key: string) => (translations && translations[key]) ? translations[key] : key;

    const [, setUpdateCount] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-[#338078] underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Start typing...',
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        onTransaction: () => {
            setUpdateCount(prev => prev + 1);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-[#344054]',
            },
        },
    })

    if (!editor) {
        return null
    }

    const addLink = () => {
        const url = window.prompt('URL')
        if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }
    }

    const getActiveStyles = (name: string, attributes?: any) => {
        const isActive = editor.isActive(name, attributes)
        return cn(
            "transition-all duration-200 shadow-sm border",
            isActive
                ? "bg-[#338078] text-white border-[#338078] hover:bg-[#2a6b63]"
                : "bg-transparent text-gray-500 border-transparent hover:bg-gray-100"
        )
    }

    return (
        <div className={cn(
            "rounded-[12px] border border-[#E4E7EC] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#338078] transition-all",
            className
        )}>
            {/* Toolbar */}
            <TooltipProvider delayDuration={400}>
                <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F8F9FA] border-b border-[#E4E7EC]">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('bold')}
                                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                                className={getActiveStyles('bold')}
                            >
                                <Bold className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>{__("Bold")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('italic')}
                                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                                className={getActiveStyles('italic')}
                            >
                                <Italic className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>{__("Italic")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('underline')}
                                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                                className={getActiveStyles('underline')}
                            >
                                <UnderlineIcon className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>{__("Underline")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('strike')}
                                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                                className={getActiveStyles('strike')}
                            >
                                <Strikethrough className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>{__("Strikethrough")}</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('bulletList')}
                                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                                className={getActiveStyles('bulletList')}
                            >
                                <List className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>{__("Bullet List")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('orderedList')}
                                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                                className={getActiveStyles('orderedList')}
                            >
                                <ListOrdered className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>{__("Numbered List")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('blockquote')}
                                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                                className={getActiveStyles('blockquote')}
                            >
                                <Quote className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>{__("Blockquote")}</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('link')}
                                onPressedChange={addLink}
                                className={getActiveStyles('link')}
                            >
                                <LinkIcon className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>{__("Add Link")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().unsetLink().run()}
                                disabled={!editor.isActive('link')}
                                className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-30 cursor-pointer transition-colors"
                            >
                                <Unlink className="h-4 w-4 text-gray-500" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{__("Remove Link")}</TooltipContent>
                    </Tooltip>

                    <div className="flex-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().undo().run()}
                                disabled={!editor.can().undo()}
                                className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-30 cursor-pointer transition-colors"
                            >
                                <Undo className="h-4 w-4 text-gray-500" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{__("Undo")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().redo().run()}
                                disabled={!editor.can().redo()}
                                className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-30 cursor-pointer transition-colors"
                            >
                                <Redo className="h-4 w-4 text-gray-500" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{__("Redo")}</TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>

            {/* Editor Area */}
            <EditorContent editor={editor} />

            <style>{`
                .tiptap p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .tiptap ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                }
                .tiptap ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                }
                .tiptap blockquote {
                    border-left: 3px solid #338078;
                    padding-left: 1rem;
                    font-style: italic;
                    color: #667085;
                }
            `}</style>
        </div>
    )
}

export default RichTextEditor
