import { getCorrespondingLoudlyGenre } from "@/lib/services/generation/audio/loudly";


describe('getCorrespondingLoudlyGenre', () => {
    it('should return the correct loudly genre for an existing genre with same case', () => {
        const result = getCorrespondingLoudlyGenre('Techno');
        expect(result).toEqual('Techno');
    });

    it('should return the correct loudly genre for an existing genre with different case', () => {
        const result = getCorrespondingLoudlyGenre('techno');
        expect(result).toEqual('Techno');
    });

    it('should return undefined for a non-existing genre', () => {
        const result = getCorrespondingLoudlyGenre('Guimbarde accoustique');
        expect(result).toBeUndefined();
    });
});