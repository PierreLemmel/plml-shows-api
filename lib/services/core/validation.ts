export module Validators {

    export const strings = {

        lengthBetween: (min: number, max: number) => (value: string) => {
            return value.length >= min && value.length <= max;
        }
    }
}