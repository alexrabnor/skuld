import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const resolvedSearchParams = await searchParams;
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-zinc-900 to-black text-zinc-100">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none rounded-2xl" />
            <Card className="w-full max-w-sm bg-zinc-950/50 backdrop-blur-xl border-zinc-800 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">Skuld</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Logga in för att se gemensamma skulder
                    </CardDescription>
                </CardHeader>
                <form action={login}>
                    <CardContent className="space-y-4">
                        {resolvedSearchParams?.message && (
                            <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-md text-center">
                                {resolvedSearchParams.message}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">E-post</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="ange din e-post"
                                required
                                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-300">Lösenord</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 transition-colors font-medium">
                            Logga in
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
