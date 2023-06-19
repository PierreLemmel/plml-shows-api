import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasTextArea from "@/components/aleas/aleas-textarea";
import { useCallback, useEffect, useRef, useState } from "react";

type IntFunc = (i: number) => void;

const Test = () => {

    const [count, setCount] = useState<number>(1);
    const [inputText, setInputText] = useState<string>("console.log('Hello world from script')");

    const [compiledString, setCompiledString] = useState<string|null>(null);
    const compiledFuncRef = useRef<IntFunc|null>(null);

    const onCompileBtnClicked = useCallback(() => {
        const compiled = inputText;
        
        setCompiledString(compiled);
        const result = eval(`(i) => {
    ${inputText}
}`) as IntFunc;

        compiledFuncRef.current = result;
    }, [inputText])



    const onExecuteBtnClicked = useCallback(() => {
        if (compiledFuncRef.current) {
            compiledFuncRef.current(count);
        }
    }, [count]);
 

    return <AleasMainLayout>
        <AleasTextArea value={inputText} onTextChange={setInputText} />
        <div className="w-full flex flex-row center-items justify-center gap-4">
            <AleasButton onClick={onCompileBtnClicked}>Compile</AleasButton>
            <AleasButton onClick={onExecuteBtnClicked}>Execute</AleasButton>
            <AleasButton onClick={() => setCount(count + 1)}>Increase</AleasButton>
        </div>
        <div>
            Count: {count}
        </div>
    </AleasMainLayout>
}

export default Test;