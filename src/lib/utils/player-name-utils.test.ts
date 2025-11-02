import { splitPlayerName, validatePlayerName, validatePlayerNames } from './player-name-utils';

describe('player-name-utils', () => {
    test('splitPlayerName handles empty string', () => {
        const res = splitPlayerName('');
        expect(res.isValid).toBe(false);
        expect(res.lastName).toBe('');
        expect(res.firstName).toBe('');
    });

    test('splitPlayerName splits two-part name', () => {
        const res = splitPlayerName('山田 太郎');
        expect(res.isValid).toBe(true);
        expect(res.lastName).toBe('山田');
        expect(res.firstName).toBe('太郎');
    });

    test('splitPlayerName joins multiple first name parts', () => {
        const res = splitPlayerName('山田 太郎 次郎');
        expect(res.isValid).toBe(true);
        expect(res.lastName).toBe('山田');
        expect(res.firstName).toBe('太郎 次郎');
    });

    test('splitPlayerName returns invalid for single token', () => {
        const res = splitPlayerName('単一名');
        expect(res.isValid).toBe(false);
        expect(res.lastName).toBe('単一名');
        expect(res.firstName).toBe('');
    });

    test('validatePlayerName works', () => {
        expect(validatePlayerName('山田 太郎')).toBe(true);
        expect(validatePlayerName('単一')).toBe(false);
    });

    test('validatePlayerNames returns invalid indices', () => {
        const names = ['山田 太郎', '', '単一'];
        const invalid = validatePlayerNames(names);
        expect(invalid).toEqual([1, 2]);
    });
});
