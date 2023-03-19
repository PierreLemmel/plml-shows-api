import { randomRange } from "@/lib/services/utils";

export const minProviderWeight = 1.0;
export const maxProviderWeight = 1.0;

export interface AleasProviderProps {
    name?: string;
    active: boolean;
    weight: number;
    canChain: boolean;
}

export interface AleasValueProvider<T> {
    nextValue: () => T
}

export type AleasProviderConstructorProps<TProps> = Partial<AleasProviderProps> & Omit<TProps, keyof AleasProviderProps>

interface IProvider<T> extends AleasProviderProps, AleasValueProvider<T> { }

export abstract class AleasProvider<T, TProps extends AleasProviderProps = AleasProviderProps> implements IProvider<T> {

    public active: boolean;
    public weight: number;
    public canChain: boolean;

    constructor(props: AleasProviderConstructorProps<TProps>) {
        const { active, weight, canChain } = {
            ...defaultProviderValues,
            ...props
        }

        this.active = active;
        this.weight = weight;
        this.canChain = canChain;
    }

    public abstract nextValue: () => T;

}

export const defaultProviderValues: AleasProviderProps = {
    active: true,
    weight: 10,
    canChain: true
}

export interface AleasProviderCollectionProps<TProviderProps extends AleasProviderProps> {
    
    name?: string;
    providers: TProviderProps[];
}

export class AleasProviderCollection<T> implements AleasValueProvider<T> {

    name?: string;
    providers: IProvider<T>[];

    excluded: IProvider<T>|null = null;

    constructor(props: { name?: string, providers: IProvider<T>[] }) {
        const { name, providers } = props;

        this.name = name;
        this.providers = providers;
    }

    nextValue = () => {

        const providers = this.excluded !== null ? this.providers.filter(val => val !== this.excluded) : this.providers;

        const totalWeigth = providers.reduce<number>((prev, curr) => prev + curr.weight, 0);

        const r = randomRange(0, totalWeigth);

        let addr = r;
        const provider = providers.find(p => {

            addr -= p.weight;
            return addr < 0;
        })!;

        this.excluded = provider.canChain ? null : provider;

        return provider.nextValue();
    };
}