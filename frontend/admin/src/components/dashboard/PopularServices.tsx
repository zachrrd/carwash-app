import { useEffect, useMemo, useState } from "react";

import { getOrders } from "@/services/order.service";
import type { Order } from "@/types/order";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function PopularServices() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();

        setOrders(response.data.data.data);
      } catch (error) {
        console.error("Failed to fetch popular services:", error);
      }
    };

    fetchOrders();
  }, []);

  const services = useMemo(() => {
    const serviceMap = new Map<
      number,
      {
        name: string;
        total: number;
      }
    >();

    orders.forEach((order) => {
      order.order_items?.forEach((item) => {
        const serviceId = item.service_id;
        const serviceName = item.services?.name ?? `Service #${serviceId}`;

        const existing = serviceMap.get(serviceId);

        if (existing) {
          existing.total += item.qty ?? 1;
        } else {
          serviceMap.set(serviceId, {
            name: serviceName,
            total: item.qty ?? 1,
          });
        }
      });
    });

    const sortedServices = Array.from(serviceMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    const maxTotal = sortedServices[0]?.total ?? 1;

    return sortedServices.map((service) => ({
      ...service,
      percentage: Math.round((service.total / maxTotal) * 100),
    }));
  }, [orders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Services</CardTitle>

        <CardDescription>Most requested services.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {services.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No service data available.
          </div>
        ) : (
          services.map((service) => (
            <div key={service.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{service.name}</span>

                <span className="text-sm text-muted-foreground">
                  {service.total} orders
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${service.percentage}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
