import { pathCombine, urlCombine } from "@/lib/services/core/files";

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

describe('urlCombine', () => {
    test('should combine multiple parts into a single path', () => {
        const result = urlCombine('http://plml.fr', 'foo', 'bar');
        expect(result).toBe('http://plml.fr/foo/bar');
    });

    test('should combine multiple parts without multiple slashes 1', () => {
        const result = urlCombine('http://plml.fr', '/foo', 'bar');
        expect(result).toBe('http://plml.fr/foo/bar');
    });

    test('should combine multiple parts without multiple slashes 2', () => {
        const result = urlCombine('http://plml.fr/', 'foo', 'bar');
        expect(result).toBe('http://plml.fr/foo/bar');
    });

    test('should combine multiple parts without multiple slashes 3', () => {
        const result = urlCombine('https://soundtracks-dev.loudly.com/', '/b2b/ai/genres');
        expect(result).toBe('https://soundtracks-dev.loudly.com/b2b/ai/genres');
    });
});