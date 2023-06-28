import { mergeClasses } from '@/lib/services/core/utils';
import { useEffect, useRef } from 'react';

interface AleasTextAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    onTextChange?: (value: string) => void;
}

const AleasTextArea = (props: AleasTextAreaProps) => {

    const {
        value,
        onTextChange,
        className
    } = props;

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key === 'Tab' && textareaRef.current) {
                event.preventDefault();

                const { selectionStart, selectionEnd } = textareaRef.current;
                const currentValue = textareaRef.current.value;

                const newValue = currentValue.substring(0, selectionStart) + '\t' + currentValue.substring(selectionEnd);

                if (onTextChange) {
                    onTextChange(newValue);
                }

                // Set the updated selection position after the tab indentation
                textareaRef.current.selectionStart = selectionStart + 1;
                textareaRef.current.selectionEnd = selectionStart + 1;
            }
        };

        const textAreaCurrentVal = textareaRef.current;

        if (textAreaCurrentVal) {
            textAreaCurrentVal.addEventListener('keydown', handleTabKey);

            return () => {
                textAreaCurrentVal.removeEventListener('keydown', handleTabKey);
            }
        }
    }, [onTextChange]);

    return <textarea
        className={mergeClasses(
            "w-full min-w-[30rem] min-h-[15rem] p-4 rounded-md resize-none",
            "border border-gray-300 focus:outline-none focus:border-blue-500",
            "bg-slate-900/90",
            className
        )}
        ref={textareaRef}
        value={value}
        onChange={(e) => onTextChange && onTextChange(e.target.value)}
    />
};

export default AleasTextArea;