import { createRemoteJWKSet, jwtVerify } from "jose";
import dotenv from 'dotenv';

dotenv.config();

const AUTH0_DOMAIN = process.env.VITE_AUTH0_DOMAIN;
const ISSUER = `https://${AUTH0_DOMAIN}/`; // Who is issuing the token (i.e., Auth0)
const AUDIENCE = process.env.VITE_AUTH0_API_AUDIENCE; // The API accepting token (i.e., Auth0 application)
const JWKS = createRemoteJWKSet(
    new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
); // Set of secret keys provided by Auth0 to verify token

// Function for verifying authorization for request and retrieving user data from Auth0
export async function verifyAuth(req) {
    // Retrieve jwt (token) from request header
    if (!req || !req.headers) 
        return new Response(JSON.stringify({ error: "Missing request or headers" }), { status: 401, headers: { 'content-type': 'application/json' } });

    const authHeader = req.headers.authorization;
    if (!authHeader) 
        return new Response(JSON.stringify({ error: "Missing authorization header" }), { status: 401, headers: { 'content-type': 'application/json' } });

    const token = authHeader.replace('Bearer ', '');

    // Get payload from token (contains user data from Auth0)
    try {
        const {payload, protectedHeader} = await jwtVerify(token, JWKS, {
            issuer: ISSUER,
            audience: AUDIENCE
        });
        return payload;
    } catch (e) {
        // verification failed
        return null;
    }
}