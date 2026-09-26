import { useEffect, useState } from "react";

import WelcomeHero from "@/components/customer/dashboard/WelcomeHero";
import ServicePreview from "@/components/customer/dashboard/ServicePreview";
import ActiveOrder from "@/components/customer/dashboard/ActiveOrder";
import RecentOrders from "@/components/customer/dashboard/RecentOrders";
import DashboardFooter from "@/components/customer/DashboardFooter";

import { getMyOrders } from "@/services/order.service";
import type { Order, OrderServiceStatus } from "@/types/order";

import { socket, connectSocket, disconnectSocket } from "@/services/socket";

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setLoading(true);

        const data = await getMyOrders();

        if (!cancelled) {
          setOrders(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch customer orders:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const activeOrders = orders.filter(
      (order) =>
        order.service_status === "WAITING" ||
        order.service_status === "CONFIRMED" ||
        order.service_status === "IN_PROGRESS",
    );

    if (activeOrders.length === 0) {
      return;
    }

    const handleOrderStatusUpdated = (data: {
      orderId: number;
      serviceStatus: OrderServiceStatus;
    }) => {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === data.orderId
            ? {
                ...order,
                service_status: data.serviceStatus,
              }
            : order,
        ),
      );
    };

    const handleConnect = () => {
      activeOrders.forEach((order) => {
        socket.emit("join-order", order.id);
      });
    };

    socket.on("order-status-updated", handleOrderStatusUpdated);
    socket.on("connect", handleConnect);

    connectSocket();

    if (socket.connected) {
      activeOrders.forEach((order) => {
        socket.emit("join-order", order.id);
      });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("order-status-updated", handleOrderStatusUpdated);

      disconnectSocket();
    };
  }, [orders]);

  const activeOrder =
    orders.find(
      (order) =>
        order.service_status === "WAITING" ||
        order.service_status === "CONFIRMED" ||
        order.service_status === "IN_PROGRESS",
    ) ?? null;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <WelcomeHero />

      <ActiveOrder order={activeOrder} loading={loading} />

      <ServicePreview />

      <RecentOrders orders={recentOrders} loading={loading} />

      <DashboardFooter />
    </div>
  );
}
