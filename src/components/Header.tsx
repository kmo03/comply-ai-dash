import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-semibold text-primary">comply.ai</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-white">
            2
          </span>
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}