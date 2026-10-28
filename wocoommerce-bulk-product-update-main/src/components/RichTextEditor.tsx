import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Code, Eye } from 'lucide-react';
import { formatHtml } from '../utils/formatting';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label, height = '200px' }) => {
    const [isCodeView, setIsCodeView] = useState(false);
    const [codeContent, setCodeContent] = useState('');

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'link', 'image'
    ];

    const toggleCodeView = () => {
        if (!isCodeView) {
            // Switching TO Code View: Format existing value
            setCodeContent(formatHtml(value));
        } else {
            // Switching BACK to Visual: Update parent with raw code content
            // (Parent onChange already updated during editing, but ensuring consistent state)
            onChange(codeContent);
        }
        setIsCodeView(!isCodeView);
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setCodeContent(newVal);
        onChange(newVal);
    };

    return (
        <div className="rich-text-editor-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>{label}</label>
                <button
                    onClick={toggleCodeView}
                    type="button"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: 'var(--color-primary)',
                        padding: '4px 8px',
                        borderRadius: '4px'
                    }}
                    className="hover:bg-gray-100"
                >
                    {isCodeView ? (
                        <><Eye size={14} /> Visual Editor</>
                    ) : (
                        <><Code size={14} /> Edit HTML</>
                    )}
                </button>
            </div>

            {isCodeView ? (
                <textarea
                    className="form-input"
                    value={codeContent}
                    onChange={handleCodeChange}
                    style={{
                        width: '100%',
                        height: height,
                        fontFamily: 'monospace',
                        resize: 'vertical',
                        padding: '10px',
                        marginBottom: '42px',
                        whiteSpace: 'pre'
                    }}
                />
            ) : (
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={(content) => {
                        // Replace &nbsp; with normal space to prevent accumulation
                        const cleanContent = content.replace(/&nbsp;/g, ' ');
                        onChange(cleanContent);
                    }}
                    modules={modules}
                    formats={formats}
                    style={{ height: height, marginBottom: '40px' }}
                />
            )}
        </div>
    );
};
