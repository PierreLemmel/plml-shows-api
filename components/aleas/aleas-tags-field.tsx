import React, { Dispatch, InputHTMLAttributes, useCallback } from "react";
import { useState } from "react";
import { doNothing, mergeClasses } from "@/lib/services/core/utils";

interface AleasTagsFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: string[];
  onTagsChange?: (tags: string[]) => void;
}

const AleasTagsField = (props: AleasTagsFieldProps) => {
    const {
        tags,
        onTagsChange,
        className,
        ...restProps
    } = {
        onTagsChange: () => { },
        ...props
    };

    const [inputValue, setInputValue] = useState("");

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            const newTags = [...tags, inputValue.trim()];
            onTagsChange(newTags);
            setInputValue("");
        }
    }, [tags, inputValue, onTagsChange]);

    const removeTag = useCallback((tag: string) => {
        const newTags = tags.filter((t) => t !== tag);
        onTagsChange(newTags);
    }, [tags, onTagsChange]);

    return <div
        className={mergeClasses(
            "w-full min-w-[8rem] px-3 py-1 rounded-md",
            "border border-gray-300 focus:outline-none focus:border-blue-500",
            "bg-slate-900/90",
            className
        )}
        {...restProps}
    >
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => <div
                    key={tag}
                    className="px-2 py-1 bg-gray-200 rounded-md text-gray-700"
                >
                    {tag}
                    <button
                        className="ml-2 text-red-600"
                        onClick={() => removeTag(tag)}
                    >
                        &times;
                    </button>
                </div>
            )}
            <input
                type="text"
                className="bg-transparent focus:outline-none min-w-[1rem] w-[1rem] flex-grow"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
            />
        </div>
        
    </div>
};

export default AleasTagsField;