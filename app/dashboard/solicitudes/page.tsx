import Navbar from "@/components/navbar";
import { Metadata } from "next";
import Items from "./components/items";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = {
  title: "Solicitudes - Solicitudes Admin",
  description: "Sign in to your account",
};

const Solicitudes = () => {
  return (
    <>
      <PageTitle title="Solicitudes" />
      <div >
        {" "}
       
        <Items />
      </div>
    </>
  );
};

export default Solicitudes;
