import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { handlers } from './handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen())

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

// DEBUG: For debugging intercepted requests
// server.events.on("request:start", ({ request }) => {
//   console.log("MSW intercepted:", request.method, request.url);
// });
