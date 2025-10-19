import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentVotings = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Class Votings</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/login-selection')}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Card className="p-6 text-muted-foreground">No active votings.</Card>
      </main>
    </div>
  );
};

export default StudentVotings;
