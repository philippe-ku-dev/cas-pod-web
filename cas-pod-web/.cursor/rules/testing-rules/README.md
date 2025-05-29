# Testing Rules for Pod SDK

This directory contains testing-specific rules and best practices for the Pod SDK project. These rules are based on official Jest documentation and established testing patterns.

## Files in this Directory

- **jest-testing.mdc**: Core testing rules and best practices using Jest
- **typescript-jest-testing.mdc**: TypeScript-specific Jest testing rules and patterns

## Usage

These rules serve as guidelines for writing and maintaining tests in the Pod SDK project. They ensure consistency, reliability, and maintainability of the test suite.

The rules cover:

1. Basic test structure and organization
2. Jest configuration and setup
3. Proper use of matchers and assertions
4. Asynchronous testing patterns
5. Mocking and spying techniques
6. Test coverage considerations
7. TypeScript-specific testing practices
8. React component and hook testing

## Enforcement

For automatic enforcement of these standards, consider integrating them with:

- ESLint with Jest plugins
- Pre-commit hooks
- CI/CD pipelines that run tests
- Code review checklists

## References

These rules are based on:

- [Official Jest Documentation](https://jestjs.io/docs/getting-started)
- TypeScript testing best practices
- React Testing Library patterns
- Industry standards for effective test-driven development 