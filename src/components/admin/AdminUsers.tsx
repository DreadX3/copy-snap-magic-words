
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Plus, ShieldAlert, Trash2, UserCheck } from "lucide-react";

interface AdminUsersProps {
  isSuperAdmin: boolean;
}

interface AdminUser {
  id: string;
  user_id: string;
  is_super_admin: boolean;
  created_at: string;
  email?: string;
}

const addAdminSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

const AdminUsers = ({ isSuperAdmin }: AdminUsersProps) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isRemovingAdmin, setIsRemovingAdmin] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { toast } = useToast();
  
  const form = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      const { data: admins, error } = await supabase
        .from('admin_users')
        .select('*');
      
      if (error) {
        console.error("Error fetching admin users:", error);
        return;
      }

      // Get emails for each admin user
      const adminsWithEmails = await Promise.all(
        admins.map(async (admin: AdminUser) => {
          // Use auth.admin APIs to get user details (note: this will only work in edge functions)
          // Here we're just showing the user_id as a demo
          return {
            ...admin,
            email: `admin_${admin.user_id.substring(0, 8)}@example.com` // Placeholder
          };
        })
      );
      
      setAdminUsers(adminsWithEmails);
    } catch (error) {
      console.error("Error in fetchAdminUsers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the getUserByEmail function to use listUsers and filter instead of getUserByEmail
  const getUserByEmail = async (email: string) => {
    try {
      // Since we can't directly access auth.users, we'll need to use an edge function or another approach
      // For demo purposes, we'll simulate finding a user
      const { data: existingUsers, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user:", error);
        return { user: null, error };
      }
      
      if (!existingUsers) {
        return { user: null, error: new Error('User not found') };
      }
      
      const user = { id: existingUsers.id };
      return { user, error: null };
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      return { user: null, error };
    }
  };

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
      
      fetchAdminUsers();
      form.reset();
      setAddDialogOpen(false);
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

  const confirmRemoveAdmin = (admin: AdminUser) => {
    if (!isSuperAdmin) return;
    setSelectedUser(admin);
    setRemoveDialogOpen(true);
  };

  const handleRemoveAdmin = async () => {
    if (!isSuperAdmin || !selectedUser) return;
    
    setIsRemovingAdmin(true);
    try {
      // Check if user is the last super admin
      if (selectedUser.is_super_admin) {
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
        .eq('id', selectedUser.id);

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
      
      fetchAdminUsers();
      setRemoveDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error removing admin:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o administrador",
        variant: "destructive",
      });
    } finally {
      setIsRemovingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciar Administradores</CardTitle>
            <CardDescription>
              Adicione ou remova administradores do sistema
            </CardDescription>
          </div>
          {isSuperAdmin && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
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
                      <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
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
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum administrador encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.email || 'Email não disponível'}</TableCell>
                    <TableCell>
                      {admin.is_super_admin ? (
                        <div className="flex items-center">
                          <ShieldAlert className="mr-2 h-4 w-4 text-destructive" />
                          <span>Super Admin</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <UserCheck className="mr-2 h-4 w-4 text-primary" />
                          <span>Admin</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {isSuperAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmRemoveAdmin(admin)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remover Administrador</DialogTitle>
                <DialogDescription>
                  Você tem certeza que deseja remover este administrador? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemoveAdmin}
                  disabled={isRemovingAdmin}
                >
                  {isRemovingAdmin ? (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
