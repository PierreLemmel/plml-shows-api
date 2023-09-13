import { MinMax } from '@/lib/services/core/types/utils';
import { mergeClasses } from '@/lib/services/core/utils';
import { useState, ChangeEvent } from 'react';
import AleasNumberInput from './aleas-number-input';

interface AleasMinMaxEditorProps extends React.HTMLAttributes<HTMLDivElement>{
    value: MinMax;
    onValueChange: (newValue: MinMax) => void;
    range?: MinMax;
    step?: number;
}

const AleasMinMaxEditor = (props: AleasMinMaxEditorProps) => {

    const {
        value,
        onValueChange,
        className,
        range,
        step,
        ...restProps
    } = props;
    
    const { min, max } = value;

    return <div className={mergeClasses(
        "grid gap-3 content-center items-center",
        "grid-cols-[auto_1fr_auto_1fr]",
        className
    )} {...restProps}>
        <div className="">Min</div>
        <AleasNumberInput
            value={min}
            min={range?.min} max={range?.max}
            step={step}
            inputSize="Small"
            onValueChange={m => onValueChange({ min: Math.min(max, m), max })}
        />

        <div className="">Max</div>
        <AleasNumberInput
            value={max}
            min={range?.min} max={range?.max}
            step={step}
            inputSize="Small"
            onValueChange={m => onValueChange({ min, max: Math.max(min, m) })} />
    </div>;
};

export default AleasMinMaxEditor;
