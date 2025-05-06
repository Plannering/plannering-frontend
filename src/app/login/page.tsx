"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  EyeIcon,
  EyeOffIcon,
  CalendarRange,
  BookOpen,
  ListTodo,
  BrainCircuit,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiFetch from "@/core/api/fetcher";
import { LoginResponse } from "@/core/types/auth";
import { cn } from "@/core/lib/utils";

const loginSchema = yup.object({
  email: yup.string().required("Email é obrigatório").email("Digite um email válido"),
  senha: yup.string().required("Senha é obrigatória").min(6, "Senha deve ter pelo menos 6 caracteres"),
  rememberMe: yup.boolean().default(false),
});

type LoginFormData = {
  email: string;
  senha: string;
  rememberMe: boolean;
};

// Variantes para animações
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const featureItems = [
  {
    icon: <CalendarRange className="h-6 w-6" />,
    title: "Planejamento Eficiente",
    description: "Organize seus estudos com um calendário intuitivo e adaptável ao seu ritmo de aprendizado.",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Gestão de Conteúdos",
    description: "Cadastre e organize materiais de estudo por disciplinas, tópicos e prioridades.",
  },
  {
    icon: <ListTodo className="h-6 w-6" />,
    title: "Acompanhamento de Progresso",
    description: "Visualize seu desempenho e evolução com gráficos e estatísticas personalizadas.",
  },
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "Técnicas de Estudo",
    description: "Acesse métodos comprovados como Pomodoro, Flashcards e revisão espaçada.",
  },
];

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    const redirected = searchParams.get("redirected");
    const registered = searchParams.get("registered");

    if (redirected) {
      setError("Faça login para acessar a área administrativa");
    }

    if (registered) {
      setSuccess("Conta criada com sucesso! Faça login para continuar.");
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiFetch<LoginResponse>("auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          senha: data.senha,
        }),
      });

      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      if (data.rememberMe) {
      }

      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      if (err instanceof Error) {
        setError(err.message || "Falha na autenticação");
      } else {
        setError("Ocorreu um erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado esquerdo - Informações e branding */}
      <div className="hidden md:flex md:w-1/3 bg-gradient-to-br from-sky-600 to-sky-900 text-white p-8 lg:p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/30 via-indigo-500/20 to-purple-500/20"></div>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-white backdrop-blur-sm flex items-center justify-center">
                <span className=" text-sky-600 text-2xl font-bold">P</span>
              </div>
              <h1 className="text-3xl font-bold">
                Planner<span className="text-sky-200">ing</span>
              </h1>
            </div>
            <p className="text-sky-100 mt-4 text-lg max-w-md">
              Organize seus estudos, acompanhe seu progresso e alcance seus objetivos com eficiência.
            </p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-md">
            {featureItems.map((feature, index) => (
              <motion.div key={index} variants={itemVariants} className="flex items-start space-x-4">
                <div className="mt-1 bg-white/10 p-2 rounded-lg">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sky-100 mt-1">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="relative z-10 text-sm text-sky-200 mt-12"
        >
          &copy; {new Date().getFullYear()} Plannering - Transformando a forma de estudar
        </motion.div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="flex-1 flex  items-center justify-center p-6 md:p-12 bg-gray-50 pattern-point">
        <div className="w-full max-w-md ">
          <AnimatePresence mode="wait">
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert className="bg-green-50 border-green-200 text-green-800 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="border-none shadow-lg bg-white ">
            <CardContent className="">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 text-center md:text-left"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Bem-vindo de volta</h2>
                <p className="text-gray-500 text-center">Entre com suas credenciais para continuar</p>
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Form {...form}>
                <motion.form
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                                <Mail className="h-4 w-4" />
                              </div>
                              <Input
                                placeholder="seu.email@exemplo.com"
                                type="email"
                                autoComplete="email"
                                className={cn(
                                  "pl-10 transition-all",
                                  form.formState.errors.email
                                    ? "border-destructive focus-visible:ring-destructive/30"
                                    : "",
                                )}
                                {...field}
                              />
                              <AnimatePresence>
                                {field.value && !form.formState.errors.email && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm font-medium text-gray-700">Senha</FormLabel>
                            <Link
                              href="/forgot-password"
                              className="text-xs text-sky-600 hover:text-sky-800 transition-colors hover:underline"
                            >
                              Esqueceu a senha?
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                                <Lock className="h-4 w-4" />
                              </div>
                              <Input
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                className={cn(
                                  "pl-10 pr-10 transition-all",
                                  form.formState.errors.senha
                                    ? "border-destructive focus-visible:ring-destructive/30"
                                    : "",
                                )}
                                {...field}
                              />
                              <button
                                type="button"
                                tabIndex={-1}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal text-gray-600">
                              Lembrar-me neste dispositivo
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-6 text-sm text-gray-500"
                  >
                    Não tem uma conta?{" "}
                    <Link
                      href="/register"
                      className="font-medium text-sky-600 hover:text-sky-800 transition-colors underline-offset-4 hover:underline"
                    >
                      Cadastre-se
                    </Link>
                  </motion.div>
                </motion.form>
              </Form>
            </CardContent>
          </Card>

          {/* Versão mobile da branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center md:hidden"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
                <span className="text-white text-lg font-bold">P</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Planner<span className="text-sky-600">ing</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm">
              Organize seus estudos, acompanhe seu progresso e alcance seus objetivos com eficiência.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
