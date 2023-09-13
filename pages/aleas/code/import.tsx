import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasDropdownInput, DropdownOption } from "@/components/aleas-components/aleas-dropdowns";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import AleasTextArea from "@/components/aleas-components/aleas-textarea";
import AleasTextField from "@/components/aleas-components/aleas-textfield";
import { toast } from "@/components/aleas-components/aleas-toast-container";
import { createAleasCodeFile } from "@/lib/services/aleas/aleas-api";
import { AleasCodeFile, AleasCodeLanguage } from "@/lib/services/aleas/misc/aleas-code-display";
import { useConstant } from "@/lib/services/core/hooks";
import { useCallback, useMemo, useState } from "react";

const CodeImport = () => {

    const [code, setCode] = useState<string>("");

    const languageDropdownOptions = useConstant<DropdownOption<AleasCodeLanguage>[]>([{
        label: "Typescript",
        value: "typescript"
    },
    {
        label: "TSX",
        value: "tsx"
    }]);

    const [language, setLanguage] = useState<DropdownOption<AleasCodeLanguage>>(languageDropdownOptions[0]);

    const [path, setPath] = useState<string>("");

    const onImport = async () => {

        try {
            const codeFile: AleasCodeFile = {
                path,
                code,
                language: language.value
            }

            await createAleasCodeFile(codeFile);
            toast.success("Fichier importé avec succès");
            setPath("");
            setCode("");
        }
        catch (e: any) {
            toast.error(e.message);
        }
    }

    return <AleasMainLayout
        title="Aléas - Import Code"
        titleDisplay={false}
        toasts
        requireAuth
    >
        <div className="full flex flex-col items-stretch justify-between gap-8">
            <div className="text-center text-4xl flex-grow-0">Importer un fichier Code</div>
            <div className="grid gap-2 grid-cols-[auto_1fr_auto_1fr] items-center justify-end">
                <div className="col-span-4">Code:</div>
                <AleasTextArea className="col-span-4" value={code} onValueChange={setCode} />
                
                <div>Language:</div>
                <AleasDropdownInput
                    className="pr-2"
                    options={languageDropdownOptions}
                    value={language}
                    onSelectedOptionChanged={setLanguage}
                />

                <div>Path:</div>
                <AleasTextField value={path} onValueChange={setPath} />

                <div className="center-child col-span-4 mt-6">
                    <AleasButton onClick={onImport}>Importer</AleasButton>
                </div>
            </div>
        </div>
    </AleasMainLayout>
}

export default CodeImport;