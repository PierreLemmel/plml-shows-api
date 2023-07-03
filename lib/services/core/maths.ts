export class Velocity {
    value: number;

    private constructor() {
        this.value = 0.0;
    }

    static zero(): Velocity {
        return new Velocity();
    }
}

export function clamp(value: number, min: number, max: number) {
    return value > min ? (value < max ? value : max) : min;
}

export function clamp01(value: number) {
    return clamp(value, 0, 1);
}

export function clampByte(value: number) {
    return clamp(value, 0x00, 0xff);
} 

export function smoothDamp(
    current: number, target: number, currentVelocity: Velocity,
    smoothTime: number, maxSpeed: number, deltaTime: number): number {
    smoothTime = Math.max(0.0001, smoothTime);
    const num = 2.0 / smoothTime;
    const num2 = num * deltaTime;
    const num3 = 1.0 / (1.0 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
    let num4 = current - target;
    const num5 = target;
    const num6 = maxSpeed * smoothTime;
    num4 = clamp(num4, -num6, num6);
    target = current - num4;
    const num7 = (currentVelocity.value + num * num4) * deltaTime;
    currentVelocity.value = (currentVelocity.value - num * num7) * num3;
    let num8 = target + (num4 + num7) * num3;

    if (num5 - current > 0 == num8 > num5) {
        num8 = num5;
        currentVelocity.value = (num8 - num5) / deltaTime;
    }
    return num8;
}

export function lerp(min: number, max: number, a: number): number {
    return min + (max - min) * clamp01(a);
}

export function inverseLerp(val: number, min: number, max: number): number {
    return clamp01((val - min) / (max - min));
}

export function resample(input: number[]|Float32Array, samples: number): number[] {
    const blockSize = input.length / samples;
    const result = new Array<number>(samples);

    let block=0, blockCount=0, blockSum=0;
    const addBlockToResult = () => {

        result[block++] = blockSum / blockCount;

        blockSum = 0;
        blockCount = 0;
    }

    for (let i = 0; i < input.length; i++){

        blockSum += Math.abs(input[i]);
        blockCount++;

        if (i >= (block + 1) * blockSize) {
            addBlockToResult();
        }
    }

    if (blockCount > 0) {
        addBlockToResult();
    }

    return result;
}

export function sum(input: number[]): number {
    let sum = 0;
    for (let i = 0; i < input.length; i++){
        sum += input[i];
    }
    return sum;
}