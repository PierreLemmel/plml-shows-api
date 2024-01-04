import { Action } from '@/lib/services/core/types/utils';
import { doNothing, mergeClasses } from '@/lib/services/core/utils';
import React, { useCallback, useState } from 'react';
import { AleasButton } from './aleas-buttons';

interface AleasModalDialogProps extends React.HTMLAttributes<HTMLDivElement> {
	isOpen: boolean;
	canValidate?: boolean;
	onCancel?: Action;
	onConfirm?: Action;
	children: React.ReactNode;
	contentClassName?: string;

	confirmText?: string;
	cancelText?: string;
}

const AleasModalDialog = (props: AleasModalDialogProps) => {

	const {
		isOpen,
		onCancel = doNothing,
		onConfirm = doNothing,
		canValidate = true,
		children,
		className,
		contentClassName,
		confirmText = "Ok",
		cancelText = "Annuler",
		...restProps
	} = props;

	const [isConfirming, setIsConfirming] = useState(false);
	const [isCanceling, setIsCanceling] = useState(false);

	const onActualConfirm = useCallback(async () => {
		setIsConfirming(true);
		await onConfirm();
		setIsConfirming(false);
	}, [onConfirm])

	const onActualCancel = useCallback(async () => {
		setIsCanceling(true);
		await onCancel();
		setIsCanceling(false);
	}, [onCancel])

  	return isOpen ? <div
		className={mergeClasses(
			"fixed full inset-0 z-50 flex items-center justify-center bg-slate-500/10",
			"backdrop-blur-[2px]",
			className
		)}
		{...restProps}
    >
		<div className={mergeClasses(
			"bg-slate-800 rounded-lg p-6",
		)}>
			<div className={contentClassName}>
				<div>{children}</div>
				<div className="flex flex-row justify-center items-center gap-3">
					<AleasButton
						onClick={onActualConfirm}
						disabled={!canValidate || isCanceling}
					>
						{confirmText}
					</AleasButton>
					<AleasButton
						onClick={onActualCancel}
						disabled={isConfirming}
					>
						{cancelText}
					</AleasButton>
				</div>
			</div>
		</div>
    </div> : <></>
};

export default AleasModalDialog;
