import { doNothing } from '@/lib/services/core/utils';
import { ChangeEvent, useState } from 'react';

interface AleasCheckboxProps {
    checked: boolean;
    onChange?: (isChecked: boolean) => void;
}

const AleasCheckbox = (props: AleasCheckboxProps) => {

    const {
        checked,
        onChange = doNothing,
    } = props;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newVal = event.target.checked;
        onChange(newVal);
    };

    return <input
        type="checkbox"
        className="text-blue-500 h-5 w-5"
        checked={checked}
        onChange={handleChange}
    />
};

export default AleasCheckbox;
