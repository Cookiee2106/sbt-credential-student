import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Credential Core</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Blockchain-based Credential Management System
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/admin">Admin Portal</Link>
        </Button>
        <Button asChild>
          <Link href="/student">Student Portal</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/verify/demo">Public Verify</Link>
        </Button>
      </div>
    </main>
  );
}
