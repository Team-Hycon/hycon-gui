declare module 'node-2fa'
{
    export function generateSecret(info: { name: string, account: string }): { secret: string, uri: string, qr: string }
    export function generateToken(string: string): { token: string }
    export function verifyToken(secret: string, token: string): { delta: number }
}
