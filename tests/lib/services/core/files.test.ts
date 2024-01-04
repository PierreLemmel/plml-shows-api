import { pathCombine } from "@/lib/services/core/files";

describe('pathCombine', () => {
    test('should combine multiple parts into a single path', () => {
        const result = pathCombine('part1', 'part2', 'part3');
        expect(result).toBe('part1/part2/part3');
    });

    test('should handle leading and trailing slashes correctly', () => {
        const result = pathCombine('/part1/', '/part2/', '/part3/');
        expect(result).toBe('part1/part2/part3');
    });

    test('should handle empty parts correctly', () => {
        const result = pathCombine('', '', 'part1', '', 'part2', '', 'part3');
        expect(result).toBe('part1/part2/part3');
    });

    test('should handle blank parts correctly', () => {
        const result = pathCombine('   ', '  ', 'part1', '  ', 'part2', '', 'part3');
        expect(result).toBe('part1/part2/part3');
    });
});