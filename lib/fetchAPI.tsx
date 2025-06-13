// lib/fetchApi.ts
const API_URL = process.env.API_URL
const TENANT_ID = process.env.TENANT_ID
const USER_ID = process.env.USER_ID
const USER_ROLE = process.env.USER_ROLE
const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID
const AUTH_CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET

type FetchMethod = "POST"

export const fetchAPI = async (
    url: string,
    method: FetchMethod = "POST",
    payload?: any
): Promise<any> => {
    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "x-rdp-version": "8.1",
            "x-rdp-clientId": "rdpclient",
            "x-rdp-tenantId": TENANT_ID || "",
            "x-rdp-userId": USER_ID || "",
            "x-rdp-userRoles": USER_ROLE || "",
            "auth-client-id": AUTH_CLIENT_ID || "",
            "auth-client-secret": AUTH_CLIENT_SECRET || "",
        }

        const res = await fetch(`https://${API_URL}/api${url}`, {
            method,
            headers,
            body: payload ? JSON.stringify(payload) : undefined,
        })
        if (!res.ok) {
            const errorData = await res.json()
            console.error(`Error ${res.status}:`, errorData)
            throw new Error(errorData.message || "Request failed")
        }

        return await res.json()
    } catch (err) {
        console.error("Fetch API error:", err)
        throw err
    }
}
