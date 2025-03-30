import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get the base URL for API requests based on environment
const getBaseUrl = () => {
  if (typeof window === 'undefined') return ''; // Server-side rendering
  if (window.location.hostname === 'localhost') return '';
  if (window.location.hostname.includes('vercel.app')) return '';
  return ''; // Default to relative URLs
};

const BASE_URL = getBaseUrl();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error(data.message || data.error || `${res.status}: ${res.statusText}`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        // Not JSON, try text
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
      throw e;
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure URL starts with BASE_URL
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  
  // Add retry logic for network issues
  let retries = 0;
  const MAX_RETRIES = 3;
  
  while (retries < MAX_RETRIES) {
    try {
      const res = await fetch(fullUrl, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
  
      await throwIfResNotOk(res);
      return res;
    } catch (error) {
      retries++;
      if (retries >= MAX_RETRIES || !(error instanceof TypeError)) {
        throw error; // Not a network error or max retries reached
      }
      
      // Exponential backoff for network errors
      await new Promise(resolve => setTimeout(resolve, 2 ** retries * 100));
    }
  }
  
  throw new Error('Maximum retries exceeded');
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    
    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
      });
  
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }
  
      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`API error for ${fullUrl}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute, more realistic than Infinity for a deployed app
      retry: 1, // Allow one retry for network issues
    },
    mutations: {
      retry: 1, // Allow one retry for network issues
    },
  },
});
