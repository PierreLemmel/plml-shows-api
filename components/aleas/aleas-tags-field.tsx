import React, { Dispatch, InputHTMLAttributes, useCallback, useMemo } from "react";
import { useState } from "react";
import { doNothing, mergeClasses } from "@/lib/services/core/utils";

interface AleasTagsFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: string[];
  onTagsChange?: (tags: string[]) => void;
  tagOptions?: string[];
}

const AleasTagsField = (props: AleasTagsFieldProps) => {
    const {
        tags,
        onTagsChange = doNothing,
        className,
        tagOptions = [],
        ...restProps
    } = props;

    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const availableTagOptions = useMemo(() => tagOptions.filter((option) => !tags.find((tag) => tag.toLowerCase() === option.toLowerCase())), [tagOptions, tags]);
    console.log(availableTagOptions)

    const hasSuggestions = suggestions.length > 0;

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        
        setInputValue(value);

        const filteredOptions = availableTagOptions.filter((option) => option.toLowerCase().includes(value.toLowerCase()));
        setSuggestions(filteredOptions);
    }, [tagOptions]);

    const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const newTag = inputValue.trim();
        
        if (e.key === "Enter" && newTag) {

            if (hasSuggestions && !availableTagOptions.find((option) => option.toLowerCase() === newTag.toLowerCase())) {
                return;
            }

            const newTags = [...tags, newTag];
            onTagsChange(newTags);
            setInputValue("");
        }
    }, [tags, inputValue, onTagsChange]);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        const newTags = [...tags, suggestion];

        onTagsChange(newTags);
        setInputValue("");
        setSuggestions([]);

    }, [tags, onTagsChange]);

    const removeTag = useCallback((tag: string) => {
        const newTags = tags.filter((t) => t !== tag);
        onTagsChange(newTags);
    }, [tags, onTagsChange]);

    return <div
        className={mergeClasses(
            "w-full min-w-[8rem] px-3 py-1 rounded-md",
            "border border-gray-300 focus:outline-none focus:border-blue-500",
            "bg-slate-900/90",
            "relative",
            className
        )}
        {...restProps}
    >
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => <div
                    key={tag}
                    className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md text-white"
                >
                    {tag}
                    <button
                        className="ml-2 text-red-400"
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
        {suggestions.length > 0 && <div className={mergeClasses(
            "mt-2 absolute z-[100]",
            "bg-slate-700 rounded-md",
        )}>
            {suggestions.map((suggestion) => (
                <div
                    key={suggestion}
                    className={mergeClasses(
                        "cursor-pointer hover:bg-slate-600",
                        "px-2 py-1 rounded-md",
                        "transition-colors duration-200"
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                >
                    {suggestion}
                </div>
            ))}
        </div>}
    </div>
};

export default AleasTagsField;