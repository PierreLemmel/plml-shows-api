import React, { Dispatch, useEffect, useState } from 'react';
import { doNothing, mergeClasses } from '../../lib/services/core/utils';

interface MusicSignatureEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  signature: string;
  onSignatureChange?: Dispatch<string>;
}

const MusicSignatureEditor = (props: MusicSignatureEditorProps) => {

	const {
		signature,
		onSignatureChange = doNothing,
		className,
		...restProps
	} = props;

    const [timeNumerator, setTimeNumerator] = useState('');
    const [timeDenominator, setTimeDenominator] = useState('');

    const handleNumeratorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputNumerator = event.target.value.replace(/[^0-9]/g, '');
        setTimeNumerator(inputNumerator);
        onSignatureChange(`${inputNumerator} / ${timeDenominator}`);
    };

    const handleDenominatorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputDenominator = event.target.value.replace(/[^0-9]/g, '');
        setTimeDenominator(inputDenominator);
        onSignatureChange(`${timeNumerator} / ${inputDenominator}`);
    };

    const [numerator, denominator] = signature.split('/').map((item) => item.trim());

    useEffect(() => {
        setTimeNumerator(numerator);
      	setTimeDenominator(denominator);
    }, [numerator, denominator]);

    return <div {...restProps} className={mergeClasses(
		"w-full min-w-[8rem] px-3 py-1 rounded-md",
		"border border-gray-300 focus:outline-none focus:border-blue-500",
		"bg-slate-900/90",
		className
	)}>
        <input type="text"
			value={timeNumerator}
			className="bg-transparent focus:outline-none w-2 overflow-visible text-center"
			onChange={handleNumeratorChange}
			maxLength={2}
		/>
        {' / '}
        <input type="text"
			value={timeDenominator}
			className="bg-transparent focus:outline-none w-2 overflow-visible text-center"
			onChange={handleDenominatorChange}
			maxLength={2}
		/>
	</div>
};

export default MusicSignatureEditor;