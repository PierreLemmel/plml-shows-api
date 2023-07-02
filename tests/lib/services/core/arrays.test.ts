import { replaceFirstElement } from "@/lib/services/core/arrays";



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
