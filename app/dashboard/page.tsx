"use client";
import Navbar from "@/components/navbar";
// import { Metadata } from 'next';
import Items from "./users/components/items";
import { DevelopmentComponent } from "@/components/developmetPage";
import { useUser } from "@/hooks/use-user";
import { Solicitud } from "@/interfaces/solicitud.interface";
import { useEffect, useState } from "react";
import { getDocument } from "@/lib/firebase";
import toast from "react-hot-toast";
import { SolicitudesChart } from "@/components/chartPie";

// export const metadata: Metadata = {
//   title: 'Dashboard - Product Admin',
//   description: 'Sign in to your account',
// };

const Dashboard = () => {
  const { user } = useUser();
  const [items, setItems] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getSolicitudes = async () => {
    const path = `solicitudes/solicitudes`;

    setIsLoading(true);
    try {
      const res = (await getDocument(path)) as { solicitudes: Solicitud[] };

      if (res && res.solicitudes) {
        setItems(res.solicitudes);
      } else {
        setItems([]);
      }
    } catch (error: unknown) {
      toast.error("Ocurrió un error desconocido", { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") getSolicitudes();
  }, [user]);

  return (
    <>
      <SolicitudesChart data={items} />
    </>
  );
};

export default Dashboard;
