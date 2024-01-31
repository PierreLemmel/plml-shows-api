import { useState, useEffect } from 'react';

const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        try {
            const item = localStorage.getItem(key);
            setStoredValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
            console.error(`Error retrieving value from local storage: ${error}`);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(storedValue) ?? "");
        } catch (error) {
            console.error(`Error storing value in local storage: ${error}`);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
};

export default useLocalStorage;
