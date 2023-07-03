import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
	dir: './',
})

/** @type {import('jest').Config} */
const config = {

	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	testEnvironment: 'jest-environment-jsdom',
}

export default createJestConfig(config)