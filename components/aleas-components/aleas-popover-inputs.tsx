import React, { useEffect, useState } from 'react';
import AleasModalDialog from './aleas-modal-dialog';
import AleasTextField from './aleas-textfield';

interface AleasPopoverTextInputProps {
	isOpen: boolean;
	title?: string;
	initialValue?: string;
	children?: React.ReactNode;
	onCancel: () => void;
	onConfirm: (value: string) => void;
	validationFunction?: (value: string) => boolean;
}

const AleasPopoverTextInput = (props: AleasPopoverTextInputProps) => {

	const {
		isOpen,
		title,
		children,
		initialValue,
		onCancel,
		onConfirm,
		validationFunction = () => true,
	} = props;

	const [value, setValue] = useState('');

	useEffect(() => {
		setValue(initialValue || '');
	}, [initialValue, isOpen])

	const canValidate = validationFunction(value);

	return <AleasModalDialog
		isOpen={isOpen}
		canValidate={canValidate}
		onCancel={onCancel}
		onConfirm={() => onConfirm(value)}
		confirmText="Ok"
		cancelText="Annuler"
	>
		<div className="full flex flex-col gap-2 mb-5">		
			{title && <div className="text-lg font-bold">{title}</div>}
			{children && <div>{children}</div>}
			<AleasTextField
				value={value}
				onValueChange={setValue}
			/>
		</div>
	</AleasModalDialog>
};

export default AleasPopoverTextInput;