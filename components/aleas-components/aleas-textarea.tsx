import { doNothing, mergeClasses } from '@/lib/services/core/utils';
import { Dispatch, InputHTMLAttributes, useEffect, useRef } from 'react';

interface AleasTextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onValueChange?: Dispatch<string>;
}

const AleasTextArea = (props: AleasTextAreaProps) => {

    const {
        value,
        onValueChange,
        className,
        ...restProps
    } = {
        onValueChange: doNothing,
        ...props
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key === 'Tab' && textareaRef.current) {
                event.preventDefault();

                const { selectionStart, selectionEnd } = textareaRef.current;
                const currentValue = textareaRef.current.value;

                const newValue = currentValue.substring(0, selectionStart) + '\t' + currentValue.substring(selectionEnd);

                onValueChange(newValue);

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
    }, [onValueChange]);

    return <textarea
        className={mergeClasses(
            "w-full min-w-[30rem] min-h-[15rem] px-3 py-1 rounded-md resize-none",
            "border border-gray-300 focus:outline-none focus:border-blue-500",
            "bg-slate-900/90",
            className
        )}
        ref={textareaRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...restProps}
    />
};

export default AleasTextArea;