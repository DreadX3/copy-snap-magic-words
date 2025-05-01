
import { ShieldAlert, Trash2, UserCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  user_id: string;
  is_super_admin: boolean;
  created_at: string;
  email?: string;
}

interface AdminUsersListProps {
  adminUsers: AdminUser[];
  isLoading: boolean;
  isSuperAdmin: boolean;
  onRemoveClick: (admin: AdminUser) => void;
}

const AdminUsersList = ({ 
  adminUsers, 
  isLoading, 
  isSuperAdmin,
  onRemoveClick 
}: AdminUsersListProps) => {
  return (
    <>
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
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
                      onClick={() => onRemoveClick(admin)}
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
    </>
  );
};

export default AdminUsersList;
