"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignIn, signOutAccount } from "@/lib/firebase";
import { getAuth } from "firebase/auth"; // Importación para verificar el estado de email
import { useState } from "react";
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const SignInForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false); // Estado para mostrar u ocultar la contraseña

  const formSchema = z.object({
    email: z
      .string()
      .email("El formato del email no es válido. Ejemplo: user@mail.com")
      .min(1, { message: "Este campo es requerido" }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe contener al menos 6 caracteres" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  const onSubmit = async (user: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await SignIn(user);

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser && !currentUser.emailVerified) {
        toast.error(
          "Por favor verifica tu correo electrónico antes de iniciar sesión.",
          { duration: 3000 }
        );
        
        signOutAccount();

        return;
      }

      toast.success("Ingreso Exitoso", { duration: 2500 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, { duration: 2500 });
      } else {
        toast.error("Ocurrió un error desconocido", { duration: 2500 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Inicio Sesión</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu email y contraseña para acceder
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <div className="grid gap-2">
          {/* <=================Email=============> */}
          <div className="mb-3">
            <Label htmlFor="email">Correo</Label>
            <Input
              {...register("email")}
              id="email"
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
            />
            <p className="form-error">{errors.email?.message}</p>
          </div>
          {/* <=================Password============> */}
          <div className="mb-3 relative">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              {...register("password")}
              id="password"
              placeholder="******"
              type={showPassword ? "text" : "password"} // Cambia el tipo según el estado `showPassword`
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-9"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            <p className="form-error">{errors.password?.message}</p>
          </div>
          <Link
            href="/forgot-password"
            className="underline text-muted-foreground underline-offset-4 hover:text-primary mb-6 text-sm text-end"
          >
            ¿Olvidaste la contraseña?
          </Link>

          {/* <=======================Submit===================> */}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <LoaderCircle className="mr-2 h-4 animate-spin" />}
            {!isLoading && "Iniciar Sesión"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default SignInForm;
