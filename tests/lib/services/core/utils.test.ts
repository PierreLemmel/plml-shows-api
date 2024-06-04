import { incrementId, stringToKey, withValue, withValues } from "@/lib/services/core/utils";

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

describe("incrementId", () => {
    it("should increment an id without number with '-01'", () => {
        expect(incrementId("test")).toBe("test-01");
    });

    it("should increment a simple id with a number", () => {
        expect(incrementId("id-test42")).toBe("id-test43");
    });

    it("should increment a simple id with a number and a space", () => {
        expect(incrementId("id-test 42")).toBe("id-test 43");
    });

    it("should increment tens", () => {
        expect(incrementId("test-9")).toBe("test-10");
    });

    it("should deal with zeros", () => {
        expect(incrementId("test-001")).toBe("test-002");
    });

    it("should deal with and increment", () => {
        expect(incrementId("test-009")).toBe("test-010");
    });

    it("should not modify number in the middle of the string", () => {
        expect(incrementId("test-2-id-4")).toBe("test-2-id-5");
    });

    it("should deal with special case where it ends with '0'", () => {
        expect(incrementId("test")).toBe("test-01");
    });
})

describe("stringToKey", () => {
    it("should replace spaces with hyphens and lowercase letters", () => {
        expect(stringToKey("Hello World")).toBe("hello-world");
    });

    it("should replace underscores with hyphens", () => {
        expect(stringToKey("Hello_World")).toBe("hello-world");
    });

    it("should replace underscores and spaces mix with a single hyphens", () => {
        expect(stringToKey("Hello__ _ World")).toBe("hello-world");
    });

    it("should preserve hyphens", () => {
        expect(stringToKey("hello-world")).toBe("hello-world");
    });

    it("should avoid multiple hyphens", () => {
        expect(stringToKey("hello  world")).toBe("hello-world");
    });

    it("should replace spaces with hyphens, lowercase letters and remove diacritics", () => {
        expect(stringToKey("Hello Aléas")).toBe("hello-aleas");
    });

    it("should replace spaces with hyphens, lowercase letters, remove diacritics and remove special characters", () => {
        expect(stringToKey("#Hello Aléas!")).toBe("hello-aleas");
    });
})