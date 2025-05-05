
import Navbar from "@/components/Navbar";
import SidePanel from "@/components/dashboard/SidePanel";
import SuccessAlert from "@/components/dashboard/SuccessAlert";
import GenerationDashboard from "@/components/dashboard/GenerationDashboard";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container px-4 py-8 mx-auto mt-16">
        <SuccessAlert />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <GenerationDashboard />
          </div>
          <div className="md:col-span-1">
            <SidePanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
