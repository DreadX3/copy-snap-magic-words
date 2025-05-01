
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getUserByEmail } from "@/utils/admin";

const addAdminSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

interface AddAdminDialogProps {
  onAdminAdded: () => void;
  isSuperAdmin: boolean;
}

const AddAdminDialog = ({ onAdminAdded, isSuperAdmin }: AddAdminDialogProps) => {
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleAddAdmin = async (values: AddAdminFormValues) => {
    if (!isSuperAdmin) return;
    
    setIsAddingAdmin(true);
    try {
      // First check if user exists
      const { user, error: userError } = await getUserByEmail(values.email);
      
      if (userError || !user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already an admin
      const { data: existingAdmin, error: existingError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingAdmin) {
        toast({
          title: "Erro",
          description: "Este usuário já é um administrador",
          variant: "destructive",
        });
        return;
      }

      // Add user as admin
      const { error: addError } = await supabase
        .from('admin_users')
        .insert([
          {
            user_id: user.id,
            is_super_admin: false,
          }
        ]);

      if (addError) {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o administrador",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Administrador adicionado com sucesso",
      });
      
      onAdminAdded();
      form.reset();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding admin:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o administrador",
        variant: "destructive",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Administrador</DialogTitle>
          <DialogDescription>
            Digite o email do usuário que você deseja promover a administrador.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddAdmin)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Usuário</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isAddingAdmin}>
                {isAddingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdminDialog;
