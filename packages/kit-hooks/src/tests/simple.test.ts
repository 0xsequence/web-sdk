import { useQuery } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createWrapper } from './createWrapper'

const useSimpleHook = () => {
  return { data: 'ok' }
}

describe('Simple hook', async () => {
  it('should return result', async () => {
    const { result } = renderHook(() => useSimpleHook(), {
      wrapper: createWrapper()
    })

    expect(result.current.data).toBe('ok')
  })
})

const useSimpleQuery = () => {
  return useQuery({
    queryKey: ['simple'],
    queryFn: async () => {
      // fetch data from api endpoint '/hello'
      const res = await fetch('/hello')

      return await res.text()
    }
  })
}

describe('Simple query', async () => {
  it('should return result', async () => {
    const { result } = renderHook(() => useSimpleQuery(), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBe('ok')
  })
})

// import { http } from "msw";
// import { describe, it, expect } from "vitest";

// import { createWrapper } from "./createWrapper";
// import { useNetwork } from "@/hooks/useNetwork";
// import { server } from "./setup";

// describe("useUsers", () => {
//   it("should return users successfully", async () => {
//     const { result, waitFor } = renderHook(() => useNetwork(1), {
//       wrapper: createWrapper(),
//     });

//     await waitFor(() => result.current.isSuccess);

//     const user = result.current.data?.[0];

//     expect(user?.login).toBe("user-login-1");
//   });

//   it("should return error when fetching users fails", async () => {
//     server.use(
//       http.get("*", (req, res, ctx) => {
//         return res(ctx.status(500));
//       })
//     );

//     const { result, waitFor } = renderHook(() => useUsers(), {
//       wrapper: createWrapper(),
//     });

//     await waitFor(() => result.current.isError);

//     expect(result.current.error).toBeDefined();
//   });
// });
