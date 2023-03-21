import { randomRange } from "@/lib/services/core/utils";
import { AleasProvider, AleasProviderCollection, AleasProviderCollectionProps, AleasProviderConstructorProps, AleasProviderProps } from "./providers";

export interface DurationProviderProps extends AleasProviderProps {
    minDuration: number;
    maxDuration: number;
}

export class DurationProvider extends AleasProvider<number, DurationProviderProps> implements DurationProviderProps {

    public minDuration: number;
    public maxDuration: number;

    constructor(props: AleasProviderConstructorProps<DurationProviderProps>) {
        super(props);

        const { minDuration, maxDuration } = props;

        this.minDuration = minDuration;
        this.maxDuration = maxDuration;
    }

    public nextValue = () => randomRange(this.minDuration, this.maxDuration);
}

export type DurationProviderCollectionProps = AleasProviderCollectionProps<DurationProviderProps>

export type DurationProviderCollection = AleasProviderCollection<number>

export function createDurationCollection(props: DurationProviderCollectionProps): DurationProviderCollection {

    const {
        name,
        providers: providerProps
    } = props;

    return new AleasProviderCollection<number>({
        name,
        providers: providerProps.map(pp => new DurationProvider(pp))
    });
}