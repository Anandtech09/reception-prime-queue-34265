import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog, Tv, Activity } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <Activity className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-primary">
            Clinic Token & Queue Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline patient flow, maximize efficiency, and improve the waiting experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <UserCog className="h-8 w-8 text-primary" />
                Receptionist Dashboard
              </CardTitle>
              <CardDescription className="text-base">
                Generate tokens, manage queues, and control doctor availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/receptionist">
                <Button size="lg" className="w-full text-lg">
                  Open Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Tv className="h-8 w-8 text-accent" />
                Public Display
              </CardTitle>
              <CardDescription className="text-base">
                Real-time queue status for patient waiting area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/display">
                <Button size="lg" variant="outline" className="w-full text-lg">
                  Open Display
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Token generation with service isolation (GP & Dental)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Real-time doctor status management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Automatic queue redistribution during breaks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Halted patient pool with re-queue functionality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Timed break management with auto-restore</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Large-format TV display for waiting areas</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
