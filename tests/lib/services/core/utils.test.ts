import { withValue, withValues } from "@/lib/services/core/utils";

global.structuredClone = global.structuredClone ?? jest.fn(val => {
    return JSON.parse(JSON.stringify(val));
});

describe("withValue", () => {
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
        const result = withValue(test, "a.b", 42);
        expect(result.a.b).toBe(42);
    });

    it("should set a deep nested property", () => {
        const result = withValue(test, "a.c.d", "Updated");
        expect(result.a.c.d).toBe("Updated");
    });

    it("should set a top-level property", () => {
        const result = withValue(test, "x", "New Value");
        expect(result.x).toBe("New Value");
    });


    // it("should not compile for invalid value type", () => {
    //     expect(() => {
    //         setValue(test, "a.b", "Invalid Value");
    //     }); // Should not compile
    // });

    it("Should compile for nested object", () => {
        expect(() => {
            const result = withValue(test, "a.c", {
                d: "Updated",
                e: 14,
                f: {
                    g: false,
                    h: "Updated",
                }
            });

            expect(result.a.c).toStrictEqual({
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

describe("withValues", () => {
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

    it("should set a nested properties", () => {
        const result = withValues(test, {
            "a.b": 42,
            "a.c.d": "Updated"
        });

        expect(result.a.b).toBe(42);
        expect(result.a.c.d).toBe("Updated");
    });

    it("should set a top-level property", () => {
        const result = withValues(test, {
            "x": "New Value"
        });
        expect(result.x).toBe("New Value");
    });

    it("Should compile for nested object", () => {
        expect(() => {
            const result = withValues(test, {
                "a.c": {
                    d: "Updated",
                    e: 14,
                    f: {
                        g: false,
                        h: "Updated",
                    }
                }
            });

            expect(result.a.c).toStrictEqual({
                d: "Updated",
                e: 14,
                f: {
                    g: false,
                    h: "Updated",
                }
            });
        }).not.toThrow();
    })
})