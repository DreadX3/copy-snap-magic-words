
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AdminUser {
  id: string;
  user_id: string;
  is_super_admin: boolean;
  created_at: string;
  email?: string;
}

interface RemoveAdminDialogProps {
  admin: AdminUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminRemoved: () => void;
  isSuperAdmin: boolean;
}

const RemoveAdminDialog = ({ admin, isOpen, onOpenChange, onAdminRemoved, isSuperAdmin }: RemoveAdminDialogProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  const handleRemoveAdmin = async () => {
    if (!isSuperAdmin || !admin) return;
    
    setIsRemoving(true);
    try {
      // Check if user is the last super admin
      if (admin.is_super_admin) {
        const { data: superAdmins, error: countError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('is_super_admin', true);
          
        if (countError) {
          console.error("Error counting super admins:", countError);
          return;
        }
        
        if (superAdmins.length <= 1) {
          toast({
            title: "Erro",
            description: "Não é possível remover o último super administrador",
            variant: "destructive",
          });
          return;
        }
      }

      // Remove admin
      const { error: deleteError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', admin.id);

      if (deleteError) {
        toast({
          title: "Erro",
          description: "Não foi possível remover o administrador",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Administrador removido com sucesso",
      });
      
      onAdminRemoved();
      onOpenChange(false);
    } catch (error) {
      console.error("Error removing admin:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o administrador",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover Administrador</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja remover este administrador? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemoveAdmin}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removendo...
              </>
            ) : (
              "Remover"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveAdminDialog;
