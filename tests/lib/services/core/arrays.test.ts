import { arrayMove, replaceFirstElement } from "@/lib/services/core/arrays";



describe('replaceFirstElement', () => {
	it('should replace the first element that matches the predicate', () => {

		const arr1 = [1, 2, 3, 4, 5];
		const predicate1 = (num: number) => num % 2 === 0;
		const result1 = replaceFirstElement(arr1, predicate1, 0);
		expect(result1).toEqual([1, 0, 3, 4, 5]);


		const arr2 = [1, 2, -3, 4, -5];
		const predicate2 = (num: number) => num < 0;
		const result2 = replaceFirstElement(arr2, predicate2, -1);
		expect(result2).toEqual([1, 2, -1, 4, -5]);


		const arr3 = ['banana', 'avocado', 'cherry', 'pineapple'];
		const predicate3 = (str: string) => str.startsWith('a');
		const result3 = replaceFirstElement(arr3, predicate3, 'apple');
		expect(result3).toEqual(['banana', 'apple', 'cherry', 'pineapple']);

	});

	it('should return the original array if no element matches the predicate', () => {

		const arr4 = [1, 2, 3, 4, 5];
		const predicate4 = (num: number) => num === 0;
		const result4 = replaceFirstElement(arr4, predicate4, 0);
		expect(result4).toEqual([1, 2, 3, 4, 5]);


		const arr5 = ['banana', 'cherry', 'apple'];
		const predicate5 = (str: string) => str === 'orange';
		const result5 = replaceFirstElement(arr5, predicate5, 'orange');
		expect(result5).toEqual(['banana', 'cherry', 'apple']);

	});

	it('should return an empty array if the input array is empty', () => {

		const arr6: number[] = [];
		const predicate6 = (num: number) => num === 0;
		const result6 = replaceFirstElement(arr6, predicate6, 0);
		expect(result6).toEqual([]);

	});
});

describe('arrayMove', () => {
	it('should move the first element to the last position', () => {
		
		const arr1 = [1, 2, 3, 4, 5];
		const result1 = arrayMove(arr1, 0, 4);
		expect(result1).toEqual([2, 3, 4, 5, 1]);
	});

	it('should move the last element to the first position', () => {
		
		const arr2 = [1, 2, 3, 4, 5];
		const result2 = arrayMove(arr2, 4, 0);
		expect(result2).toEqual([5, 1, 2, 3, 4]);
	});

	it('should move the first element to the middle position', () => {
		
		const arr3 = [1, 2, 3, 4, 5];
		const result3 = arrayMove(arr3, 0, 2);
		expect(result3).toEqual([2, 3, 1, 4, 5]);
	});

	it('should move the middle element to the first position', () => {
		
		const arr4 = [1, 2, 3, 4, 5];
		const result4 = arrayMove(arr4, 2, 0);
		expect(result4).toEqual([3, 1, 2, 4, 5]);
	});

	it('should move the last element to the middle position', () => {
		
		const arr5 = [1, 2, 3, 4, 5];
		const result5 = arrayMove(arr5, 4, 2);
		expect(result5).toEqual([1, 2, 5, 3, 4]);
	});

	it ('should move element to the next position', () => {
		const arr6 = [1, 2, 3, 4, 5];
		const result6 = arrayMove(arr6, 1, 2);
		expect(result6).toEqual([1, 3, 2, 4, 5]);
	});

	it ('should move element to the previous position', () => {
		const arr7 = [1, 2, 3, 4, 5];
		const result7 = arrayMove(arr7, 2, 1);
		expect(result7).toEqual([1, 3, 2, 4, 5]);
	});

	it ('should move element to the same position', () => {
		const arr8 = [1, 2, 3, 4, 5];
		const result8 = arrayMove(arr8, 2, 2);
		expect(result8).toEqual([1, 2, 3, 4, 5]);
	});
});