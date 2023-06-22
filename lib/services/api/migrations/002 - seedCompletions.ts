import { CompletionsData } from "../billetreduc";
import { getDocument, setDocument } from "../firebase";

type Completions = {
    prompt: string;
    n?: number;
    repetitions?: number;
}

const completionsDocPath = "billetreduc/completions";

const newData: Completions[] = [
    { 
        prompt: "Tu es une influenceuse mode et lifestyle. Écris une critique courte et enthousiaste sur un spectacle d'impro nommé \"Aléas\". Tu trouves surtout que les artistes sont très stylés et devraient absolument participer à la Fashion Week !",
        n: 2,
        repetitions: 1
    },
    { 
        prompt: `Ecris en ancien français du haut moyen âge combien la troupe de saltimbanques qui jouait un spectacle d'improvisation nommé "Aléas" a su divertir tous les convives du château !`,
        n: 2,
        repetitions: 1
    },
    { 
        prompt: `Tu es Dieu tout puissant. Ecris un message à l'humanité pour lui ordonner d'aller voir un spectacle d'improvisation nommé "Aléas".`,
        n: 2,
        repetitions: 1
    },
    { 
        prompt: `Ecris en anglais une courte critique enthousiaste de spectateur sur un spectacle d'improvisation qui s'appelle "Aléas" et qui utilise une intelligence artificielle pour gérer son et lumière. Tu es un exécutif de Netflix qui veut absolument faire de ce spectacle une série à succès.`,
        n: 2,
        repetitions: 2
    },
    { 
        prompt: `Ecris un court passage du Nouveau Testament sur un spectacle d'improvisation qui s'appelle "Aléas" et qui a été loué par Jésus.`,
        n: 2,
        repetitions: 2
    },
    { 
        prompt: `Résume le spectacle Aléas en 5 mots de 1 syllabe. Aléas est un spectacle d'improvisation théâtrale dans lequel sons et lumières sont gérés par ordinateur. Les scènes sont variées : plus ou moins longue, plus ou moins drôles, plus ou moins profondes.`,
        n: 2,
        repetitions: 3
    },
    { 
        prompt: `Résume le spectacle Aléas en 5 mots.  Aléas est un spectacle d'improvisation théâtrale dans lequel sons et lumières sont gérés par ordinateur. Les scènes sont variées : plus ou moins longue, plus ou moins drôles, plus ou moins profondes.`,
        n: 2,
        repetitions: 4
    },
    { 
        prompt: `parle du spectacle aléas comme si c'était la meilleure chose que tu aies jamais vu en une phrase. Le son et la lumière sont générés aléatoirement par un ordinateur.`,
        n: 2,
        repetitions: 4
    },
    { 
        prompt: `Ecris 3 citations très courtes sur le spectacle d'improvisation Aléas comme celles qu´on voit sur les affiches de cinéma. Exemple : telerama, voici, le canard enchainé`,
        n: 2,
        repetitions: 2
    },
    { 
        prompt: `Ecris une critique courte et drôle d'un enfant de 3 ans décrivant le spectacle d'improvisation Aléas`,
        n: 2,
        repetitions: 3
    },
    { 
        prompt: `tu as vu un spectacle d'improvisation nommé aléas où les lumières et le son sont gérées aléatoirement par un logiciel. les saynetes sont variées, courtes ou longues, profonde ou absurde. ecris en 10 mot une critique positive et drole`,
        n: 3,
        repetitions: 3
    },
    { 
        prompt: `tu as vu un spectacle d'improvisation nommé aléas où les lumières et le son sont gérées aléatoirement par un logiciel. les saynetes sont variées, courtes ou longues, profonde ou absurde. ecris en 3 mots qui n'existent pas mais que l'on comprend une critique positive et drole`,
        n: 3,
        repetitions: 4
    },
    { 
        prompt: `tu as vu un spectacle d'improvisation nommé aléas où les lumières et le son sont gérées aléatoirement par un logiciel. les saynetes sont variées, courtes ou longues, profonde ou absurde. ecris en une ligne une critique positive et drole en utilisant une formule mathématiques`,
        n: 2,
        repetitions: 3
    },
    { 
        prompt: `tu as vu un spectacle d'improvisation nommé aléas où les lumières et le son sont gérées aléatoirement par un logiciel. les saynetes sont variées, courtes ou longues, profonde ou absurde. ecris en une ligne une critique positive et drole en utilisant des jeux de mots`,
        n: 2,
        repetitions: 3
    },
    { 
        prompt: `tu as vu un spectacle d'improvisation nommé aléas où les lumières et le son sont gérées aléatoirement par un logiciel. les saynetes sont variées, courtes ou longues, profonde ou absurde. ecris en une ligne une critique positive et drole à la manière d'une fable de jean de la fontaine avec une morale`,
        n: 2,
        repetitions: 2
    },
    {
        prompt: `tu as vu un spectacle d'improvisation nommé aléas où les lumières et le son sont gérées aléatoirement par un logiciel. les saynetes sont variées, courtes ou longues, profonde ou absurde. ecris en une ligne une critique positive et drole à la manière d'une grand mère sénile`,
        n: 2,
        repetitions: 2,
    },
    {
        prompt: `sous la forme d'une charade du Père Fouras dans Fort Boyard pour laquelle la réponse est "aléas". Aléas est un spectacle extraordinaire drôle et passionnant d'improvisation dans lequel les lumières et le son sont gérées aléatoirement par un logiciel. les saynetes sont variées, courtes ou longues, profonde ou absurde. la charade sera utilisé pour une critique ultra positive du spectacle`,
        n: 2,
        repetitions: 2
    },
    {
        prompt: `ecris sous la forme d'une question à choix multiple (que des choix vrais et positifs) une critique ultra positive pour Aléas et répond a la question. Aleas est un spectacle extraordinaire drôle et passionnant d'improvisation dans lequel les lumières et le son sont gérées aléatoirement par un logiciel. les saynetes sont variées, courtes ou longues, profonde ou absurde. la question sera utilisée comme critique pour le spectacle Aléas:`,
        n: 2,
        repetitions: 1
    },
    {
        prompt: `Ecris une courte critique du spectacle d'improvisation "Aléas" sous forme d'un télégramme.`,
        n: 2,
        repetitions: 3
    },
    {
        prompt: `Ecris un commandement de DIEU TOUT PUISSANT demandant aux Humains d'aller immédiatement voir le spectacle d'Impro "Aléas".`,
        n: 2,
        repetitions: 1
    },
    {
        prompt: `Ecris un slogan publicitaire vantant les mérites du spectacle d'Impro "Aléas".`,
        n: 2,
        repetitions: 4
    },
]

async function seedCompletions() {
    const { completions: oldCompletions } = await getDocument<CompletionsData>(completionsDocPath);

    const newCompletions = newData.map(c => {
        return {
            ...c,
            enabled: true
        }
    })

    const completions = [
        ...oldCompletions,
        ...newCompletions
    ]

    await setDocument<CompletionsData>(completionsDocPath, { completions })
}

export default seedCompletions;