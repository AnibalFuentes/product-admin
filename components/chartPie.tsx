"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Solicitud {
  state: string; // estado de la solicitud (pendiente, asignada, finalizada)
}

interface SolicitudesChartProps {
  data: Solicitud[];
}

export function SolicitudesChart({ data }: SolicitudesChartProps) {
  // Agrupar y contar las solicitudes por estado
  const chartData = React.useMemo(() => {
    const statesCount = data.reduce(
      (acc, curr) => {
        if (curr.state in acc) {
          acc[curr.state] += 1;
        }
        return acc;
      },
      { pendiente: 0, asignada: 0, finalizada: 0 }
    );

    return [
      { name: "Pendiente", value: statesCount.pendiente, fill: "var(--color-pendiente)" },
      { name: "Asignada", value: statesCount.asignada, fill: "var(--color-asignada)" },
      { name: "Finalizada", value: statesCount.finalizada, fill: "var(--color-finalizada)" },
    ];
  }, [data]);

  // Calcular el total de solicitudes
  const totalSolicitudes = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Solicitudes por Estado</CardTitle>
        <CardDescription>Resumen de solicitudes</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{
            solicitudes: { label: "Solicitudes" },
            pendiente: { label: "Pendiente", color: "hsl(var(--chart-1))" },
            asignada: { label: "Asignada", color: "hsl(var(--chart-2))" },
            finalizada: { label: "Finalizada", color: "hsl(var(--chart-3))" },
          }}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalSolicitudes}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Crecimiento del 5.2% este mes <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando el total de solicitudes agrupadas por estado
        </div>
      </CardFooter>
    </Card>
  );
}
