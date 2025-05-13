"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Home() {
  const [repoName, setRepoName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!repoName.trim()) {
      setError("Please enter a repository name");
      return;
    }

    // Format: owner/repo
    const parts = repoName.trim().split('/');
    if (parts.length !== 2) {
      setError("Please enter repository in format: owner/repo (e.g., facebook/react)");
      return;
    }

    setIsLoading(true);
    
    // Navigate to analyze page with the catch-all route
    router.push(`/analyze/${parts[0]}/${parts[1]}`);
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">GitHub Issue Analyzer</h1>
          <p className="text-lg text-muted-foreground">
            Enter a GitHub repository to analyze its issues
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full max-w-2xl flex gap-4">
          <Input 
            placeholder="Enter repository (e.g., facebook/react)" 
            className="flex-1"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Analyze"}
          </Button>
        </form>
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </main>
  );
}
