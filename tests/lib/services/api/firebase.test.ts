import { toFirebaseKey } from "@/lib/services/api/firebase";

describe('toFirebaseKey', () => {
    it('should remove white spaces and convert to lowercase', () => {
        const input = ' This is A Test ';
        const expectedOutput = 'thisisatest';
        expect(toFirebaseKey(input)).toBe(expectedOutput);
    });
    
    it('should handle an empty string', () => {
        const input = '';
        const expectedOutput = '';
        expect(toFirebaseKey(input)).toBe(expectedOutput);
    });
    
    it('should handle a string with no white spaces', () => {
        const input = 'no_spaces_here';
        const expectedOutput = 'no_spaces_here';
        expect(toFirebaseKey(input)).toBe(expectedOutput);
    });
    
    it('should handle a string with only white spaces', () => {
        const input = '       ';
        const expectedOutput = '';
        expect(toFirebaseKey(input)).toBe(expectedOutput);
    });
    
    it('should handle special characters', () => {
        const input = '@$peC!@l ch@raCt3rs*&';
        const expectedOutput = '@$pec!@lch@ract3rs*&';
        expect(toFirebaseKey(input)).toBe(expectedOutput);
    });
    
    it('should handle numbers', () => {
        const input = '1234 Some 56 Numbers';
        const expectedOutput = '1234some56numbers';
        expect(toFirebaseKey(input)).toBe(expectedOutput);
    });
});