// "test": "jest --config jest.config.ts --runInBand",
import type { Config } from 'jest'

const config: Config = {
    bail: 3,
    clearMocks: true,
    cache: false,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    // detectLeaks: true,
    displayName: {
        name: 'server',
        color: 'blue',
    },
    detectOpenHandles: true,
    errorOnDeprecated: true,
    maxConcurrency: 5,
    maxWorkers: '50%',
    modulePaths: ['<rootDir>/src/'],
    modulePathIgnorePatterns: ['<rootDir>/build/'],
    moduleDirectories: ['node_modules'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'cjs', 'jsx', 'json', 'node'],
    openHandlesTimeout: 1000,
    preset: 'ts-jest',
    // randomize: true,
    resetMocks: true,
    resetModules: true,
    reporters: ['default', ['github-actions', { silent: false }]],
    testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
    testEnvironment: 'node', // 'jsdom' | 'node' | 'jsdom-sixteen' | 'node-sixteen'
    testTimeout: 30000,
    verbose: true,
    watchman: true,
}

export default config
