
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddAdminDialog from "./AddAdminDialog";
import RemoveAdminDialog from "./RemoveAdminDialog";
import AdminUsersList from "./AdminUsersList";
import { fetchAdminUsers } from "@/utils/admin";

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

const AdminUsers = ({ isSuperAdmin }: AdminUsersProps) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      setIsLoading(true);
      const admins = await fetchAdminUsers();
      setAdminUsers(admins);
    } catch (error) {
      console.error("Error loading admin users:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os administradores",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRemoveAdmin = (admin: AdminUser) => {
    if (!isSuperAdmin) return;
    setSelectedUser(admin);
    setRemoveDialogOpen(true);
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
            <AddAdminDialog 
              onAdminAdded={loadAdminUsers}
              isSuperAdmin={isSuperAdmin}
            />
          )}
        </CardHeader>
        <CardContent>
          <AdminUsersList 
            adminUsers={adminUsers}
            isLoading={isLoading}
            isSuperAdmin={isSuperAdmin}
            onRemoveClick={confirmRemoveAdmin}
          />
          
          <RemoveAdminDialog
            admin={selectedUser}
            isOpen={removeDialogOpen}
            onOpenChange={setRemoveDialogOpen}
            onAdminRemoved={loadAdminUsers}
            isSuperAdmin={isSuperAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
