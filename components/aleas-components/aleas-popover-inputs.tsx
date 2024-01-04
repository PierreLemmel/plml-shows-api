import { ValueOrFunction } from '@/lib/services/core/types/utils';
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
	canValidate?: ValueOrFunction<string, boolean>;
}

export const AleasPopoverTextInput = (props: AleasPopoverTextInputProps) => {

	const {
		isOpen,
		title,
		children,
		initialValue,
		onCancel,
		onConfirm,
		canValidate = true,
	} = props;

	const [value, setValue] = useState('');

	useEffect(() => {
		setValue(initialValue || '');
	}, [initialValue, isOpen])

	const canValidateValue = typeof canValidate === 'function' ? canValidate(value) : canValidate;

	return <AleasModalDialog
		isOpen={isOpen}
		canValidate={canValidateValue}
		onCancel={onCancel}
		onConfirm={() => onConfirm(value)}
		confirmText="Ok"
		cancelText="Annuler"
	>
		<div className="full flex flex-col gap-2 mb-6 items-stretch w-100 max-w-[50vw] text-base">		
			{title && <div className="text-2xl font-bold">{title}</div>}
			{children && <div>{children}</div>}
			<AleasTextField
				value={value}
				onValueChange={setValue}
			/>
		</div>
	</AleasModalDialog>
};


interface AleasConfirmDialogProps {
	isOpen: boolean;
	title?: string;
	message?: string;
	onConfirm: () => void;
	onCancel: () => void;
	canConfirm?: ValueOrFunction<void, boolean>;
	confirmText?: string;
	cancelText?: string;
}
  
export const AleasConfirmDialog = (props: AleasConfirmDialogProps) => {
	const {
		isOpen,
		title,
		message,
		onConfirm,
		onCancel,
		canConfirm = true,
		confirmText="Ok",
		cancelText="Annuler",
	} = props;
  
	const canConfirmValue = typeof canConfirm === 'function' ? canConfirm() : canConfirm;
  
	return <AleasModalDialog
		isOpen={isOpen}
		canValidate={canConfirmValue}
		onCancel={onCancel}
		onConfirm={onConfirm}
		confirmText={confirmText}
		cancelText={cancelText}
	>
		<div className="full flex flex-col gap-2 mb-6 items-stretch w-100 max-w-[50vw]">
			{title && <div className="text-lg font-bold">{title}</div>}
			{message && <div>{message}</div>}
		</div>
	</AleasModalDialog>
};