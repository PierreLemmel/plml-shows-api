import { sum } from "@/lib/services/core/maths";
import { HasId, Named } from "@/lib/services/core/types/utils";
import { generateId, match, notImplemented, randomRange } from "@/lib/services/core/utils";
import { useCallback, useMemo, useRef } from "react";


//         const providers = this.excluded !== null ? this.providers.filter(val => val !== this.excluded) : this.providers;

//         const totalWeigth = providers.reduce<number>((prev, curr) => prev + curr.weight, 0);

//         const r = randomRange(0, totalWeigth);

//         let addr = r;
//         const provider = providers.find(p => {

//             addr -= p.weight;
//             return addr < 0;
//         })!;

//         this.excluded = provider.canChain ? null : provider;

//         return provider.nextValue();
//     };

export type AleasProviderItemType = "Static"|"Dynamic"|"Collection";

export type AleasProviderItem<T> = AleasProviderStaticItem<T>
    |AleasProviderDynamicItem<T>
    |AleasProviderCollectionItem<T>

export interface AleasProviderItemBase extends Named, HasId {
    readonly type: AleasProviderItemType;
    readonly active: boolean;
    readonly weight: number;
    readonly canChain: boolean;
}

export interface AleasProviderStaticItem<T> extends AleasProviderItemBase {
    readonly type: "Static";
    readonly value: T;
}

export interface AleasProviderDynamicItem<T> extends AleasProviderItemBase {
    readonly type: "Dynamic";
    readonly getValue: () => T;
}


export interface AleasProviderCollectionItem<T> extends AleasProviderItemBase {
    readonly elements: AleasProviderItem<T>[];
    readonly type: "Collection";
}

export interface AleasProvider<T> {
    readonly nextValue: () => T;
}

export function useAleasProvider<T>(providers: AleasProviderItem<T>[]): AleasProvider<T> {

    const excludeMapRef = useRef<Map<string, string|undefined>>(new Map());

    const rootId = useMemo(generateId, []);

    const getValueFromProviders = useCallback((providers: AleasProviderItem<T>[], collId: string): T => {
        
        const excludeMap = excludeMapRef.current;

        const excludedId = excludeMap.get(collId);
        const filtered = excludedId !== undefined ?
            providers.filter(p => p.id !== excludedId) : 
            providers;
        
        const totalWeigth = sum(filtered.map(p => p.weight));

        const r = randomRange(0, totalWeigth);

        let addr = r;
        const provider = providers.find(p => {

            addr -= p.weight;
            return addr < 0;
        })!;

        excludeMap.set(collId, provider.canChain ? undefined : provider.id);

        return getValueFromItem(provider);
    }, [])

    const getValueFromItem = useCallback((provider: AleasProviderItem<T>) => {

        switch (provider.type) {
            case "Static":
                return provider.value;
            case "Dynamic":
                return provider.getValue();
            case "Collection":
                const { id, elements } = provider;
                return getValueFromProviders(elements, id);
        }
    }, [])

    const nextValue = () => getValueFromProviders(providers, rootId);

    return {
        nextValue
    }
}