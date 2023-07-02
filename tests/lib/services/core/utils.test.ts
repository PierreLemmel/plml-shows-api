import { setValue } from "@/lib/services/core/utils";

global.structuredClone = jest.fn(val => {
    return JSON.parse(JSON.stringify(val));
});

describe("setValue", () => {
    type Test = {
        a: {
            b: number;
            c: {
                d: string;
                e: number;
                f: {
                    g: boolean;
                    h: string;
                }
            };
        };
        x: string;
    };

    let test: Test;

    beforeEach(() => {
        test = {
            a: {
                b: 0,
                c: {
                    d: "Hello",
                    e: 42,
                    f: {
                        g: true,
                        h: "World",
                    }
                },
            },
            x: "World",
        };
    });

    it("should set a nested property", () => {
        setValue(test, "a.b", 42);
        expect(test.a.b).toBe(42);
    });

    it("should set a deep nested property", () => {
        setValue(test, "a.c.d", "Updated");
        expect(test.a.c.d).toBe("Updated");
    });

    it("should set a top-level property", () => {
        setValue(test, "x", "New Value");
        expect(test.x).toBe("New Value");
    });


    // it("should not compile for invalid value type", () => {
    //     expect(() => {
    //         setValue(test, "a.b", "Invalid Value");
    //     }); // Should not compile
    // });

    it("Should compile for nested object", () => {
        expect(() => {
            const result = setValue(test, "a.c", {
                d: "Updated",
                e: 14,
                f: {
                    g: false,
                    h: "Updated",
                }
            });

            expect(result).toStrictEqual({
                d: "Updated",
                e: 14,
                f: {
                    g: false,
                    h: "Updated",
                }
            });
        }).not.toThrow();
    });
});

console.log(`Node Version: ${process.version}`);