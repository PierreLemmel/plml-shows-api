import { Pathes, ValueAtPath } from "@/lib/services/core/types/utils";

describe("Pathes<T>", () => {
    type ExampleType = {
        a: number;
        b: {
            c: string;
            d: boolean;
        };
        e: {
            f: {
                g: number[];
            };
        };
    };
  
    type Result = Pathes<ExampleType>;

    // Test the inferred paths
    const test: Result = "b.c"; // Should be valid
    expect(test).toBeDefined();

    const test2: Result = "b"; // Should be valid
    expect(test2).toBeDefined();
    // const invalid: Result = "x"; // Should be invalid
});

describe("ValueAtPath", () => {
    it("should correctly infer values at specified paths", () => {
        type ExampleType = {
            a: number;
            b: {
                c: string;
                d: boolean;
            };
            e: {
                f: {
                    g: number[];
                };
            };
        };
    
        const exampleObj: ExampleType = {
            a: 42,
            b: {
                c: "hello",
                d: true,
            },
            e: {
                f: {
                    g: [1, 2, 3],
                },
            },
        };
    
        // Test the inferred values
        const value1: ValueAtPath<ExampleType, "a"> = exampleObj.a; // Should be valid
        expect(value1).toBe(42);
        const value2: ValueAtPath<ExampleType, "b.c"> = exampleObj.b.c; // Should be valid
        expect(value2).toBe("hello");
        const value3: ValueAtPath<ExampleType, "e.f.g"> = exampleObj.e.f.g; // Should be valid
        expect(value3).toEqual([1, 2, 3]);

        const value4: ValueAtPath<ExampleType, "b"> = exampleObj.b; // Should be valid
        expect(value4).toStrictEqual({
            c: "hello",
            d: true,
        });
        //const invalid: ValueAtPath<ExampleType, "x"> = exampleObj.x; // Should be invalid
    });
});