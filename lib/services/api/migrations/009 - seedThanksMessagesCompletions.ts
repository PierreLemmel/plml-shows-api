import { pathCombine } from "../../core/files";
import { CompletionsData } from "../../generation/text-gen";
import { setDocument } from "../firebase";

export async function seedThanksMessagesCompletions() {
    const docPath = pathCombine("aleas", "messages", "completions");

    const completions: CompletionsData = {
        model: "gpt-4",
        completions: [
            {
                system: 'Tu es le chargé de communication de la compagnie de théâtre "Tout est dans le Titre" qui a réalisé un appel à don pour jouer son spectacle "Aléas" à Avignon.',
                prompt: 'Ecris un court message de remerciement d\'une dizaine de lignes pour un donateur.',
                n: 2,
                repetitions: 2,
                enabled: true
            }
        ]
    };

    await setDocument<CompletionsData>(docPath, completions);
    // await batchGenerateCompletions()
}