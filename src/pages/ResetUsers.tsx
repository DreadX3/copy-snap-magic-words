
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ResetUsers = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    if (!confirm("This will delete ALL users and create a new super admin with email dreadx3@gmail.com. Are you sure?")) {
      return;
    }
    
    setLoading(true);
    try {
      // Call the Supabase Edge Function
      const response = await fetch(
        "https://jwblwuzihcozkfwuarzu.supabase.co/functions/v1/reset-users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "All users have been reset and a new super admin has been created. Email: dreadx3@gmail.com, Password: @Dread325",
        });
      } else {
        throw new Error(data.error || "Failed to reset users");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while resetting users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reset All Users</h1>
          <p className="mt-2 text-gray-600">
            This will delete ALL existing users and create a new super admin with the following credentials:
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-md text-left">
            <p><strong>Email:</strong> dreadx3@gmail.com</p>
            <p><strong>Password:</strong> @Dread325</p>
          </div>
        </div>
        <div className="pt-4">
          <Button 
            onClick={handleReset} 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting Users...
              </>
            ) : (
              "Reset All Users"
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500 text-center mt-4">
          Warning: This action cannot be undone!
        </p>
      </div>
    </div>
  );
};

export default ResetUsers;
