import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummarySection from "@/components/dashboard/SummarySection";
import OrderOverview from "@/components/dashboard/OrderOverview";
import PopularServices from "@/components/dashboard/PopularServices";
import ActiveOrdersTable from "@/components/dashboard/ActiveOrdersTable";
import QuickStatus from "@/components/dashboard/QuickStatus";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <SummarySection />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OrderOverview />
        </div>

        <PopularServices />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActiveOrdersTable />
        </div>

        <QuickStatus />
      </div>
    </div>
  );
}
