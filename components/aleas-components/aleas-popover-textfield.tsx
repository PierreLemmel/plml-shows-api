import { mergeClasses } from '@/lib/services/core/utils';
import React, { useEffect, useState } from 'react';
import { AleasButton } from './aleas-buttons';
import AleasTextField from './aleas-textfield';

interface AleasPopoverTextInputProps {
	title: string;
	initialValue?: string;
	content?: React.ReactNode;
	onCancel: () => void;
	onConfirm: (value: string) => void;
	validationFunction?: (value: string) => boolean;
}

const AleasPopoverTextInput = (props: AleasPopoverTextInputProps) => {

	const {
		content,
		initialValue,
		onCancel,
		onConfirm,
		validationFunction = () => true,
	} = props;

	const [value, setValue] = useState('');

	useEffect(() => {
		setValue(initialValue || '');
	}, [])

	const canValidate = validationFunction(value);

	return <div className="fixed w-screen h-screen top-0 left-0 flex flex-col items-center justify-center">
		<div className={mergeClasses(
			"w-3/5 h-3/5 p-6",
			"bg-red flex flex-col items-stretch justify-center",
		)}>
			<div className="flex flex-row">
				<div className="flex-grow text-2xl">
					{props.title}
				</div>
				<div className="flex-grow-0">
					<button onClick={onCancel}>X</button>
				</div>
			</div>
			{content && <div>{content}</div>}
			<AleasTextField
				value={value}
				onValueChange={setValue}
			/>
			<div className="flex flex-row gap-3 items-center justify-center">
				<AleasButton
					onClick={onCancel}
				>
					Annuler
				</AleasButton>
				<AleasButton
					onClick={() => onConfirm(value)}
					disabled={!canValidate}
				>
					Valider
				</AleasButton>
			</div>
		</div>
	</div>
};

export default AleasPopoverTextInput;