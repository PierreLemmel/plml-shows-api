import { useRouter } from "next/router";


export function useRouterQuery<T extends string>(arg: T, ...args: T[]): { [key in T]: string } {

    const router = useRouter();
    let result: Partial<{ [key in T]: string }> = {};

    [arg, ...args].forEach(arg => {
        result[arg] = router.query[arg] as string;
    })

    return result as { [key in T]: string };
}