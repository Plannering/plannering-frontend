/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Card, CardContent } from "@/core/components/ui/card";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Mail,
  User,
  Lock,
  EyeIcon,
  EyeOffIcon,
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  BookOpen,
  ListTodo,
  BrainCircuit,
} from "lucide-react";
import Link from "next/link";
import * as yup from "yup";
import apiFetch from "@/core/api/fetcher";
import { RegisterRequest, RegisterResponse } from "@/core/types/auth";
import { cn } from "@/core/lib/utils";

const registerSchema = yup.object({
  nome: yup.string().required("Nome é obrigatório").min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: yup.string().email("Digite um email válido").required("Email é obrigatório"),
  senha: yup.string().required("Senha é obrigatória").min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: yup
    .string()
    .required("Confirme sua senha")
    .test("passwords-match", "As senhas não conferem", function (value) {
      return this.parent.senha === value;
    }),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

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

const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 },
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

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formStep, setFormStep] = useState(0); // Para formulário em etapas em dispositivos móveis

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const validateField = useCallback(
    async (name: keyof RegisterFormData, value: any) => {
      try {
        if (name === "confirmarSenha") {
          if (value !== formData.senha) {
            setErrors((prev) => ({
              ...prev,
              confirmarSenha: "As senhas não conferem",
            }));
            return false;
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.confirmarSenha;
              return newErrors;
            });
            return true;
          }
        }

        const fieldSchema = yup.object({ [name]: registerSchema.fields[name] });
        await fieldSchema.validate({ [name]: value }, { abortEarly: false });

        setErrors((prev) => {
          if (!prev[name]) return prev;
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });

        return true;
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          error.inner.forEach((err) => {
            if (err.path === name) {
              setErrors((prev) => ({
                ...prev,
                [name]: err.message,
              }));
            }
          });
        }
        return false;
      }
    },
    [formData.senha],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      validateField(name as keyof RegisterFormData, value);
    },
    [validateField],
  );

  const nextStep = async () => {
    const currentFields = ["nome", "email"];
    let isValid = true;

    for (const field of currentFields) {
      const valid = await validateField(field as keyof RegisterFormData, formData[field as keyof RegisterFormData]);
      if (!valid) isValid = false;
    }

    if (isValid) {
      setFormStep(1);
    }
  };

  const prevStep = () => {
    setFormStep(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);

    try {
      await registerSchema.validate(formData, { abortEarly: false });
      const dataToSend: RegisterRequest = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
      };

      await apiFetch<RegisterResponse>("auth/register", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      router.push("/login?registered=true");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);

        if (Object.keys(validationErrors).some((key) => ["senha", "confirmarSenha"].includes(key))) {
          setFormStep(1);
        } else if (Object.keys(validationErrors).some((key) => ["nome", "email"].includes(key))) {
          setFormStep(0);
        }
      } else if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError("Ocorreu um erro inesperado");
      }
      console.error("Erro no registro:", error);
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
              <div className="w-12 h-12 rounded-lg bg-gray-50 backdrop-blur-sm flex items-center justify-center">
                <span className="text-sky-500 text-2xl font-bold">P</span>
              </div>
              <h1 className="text-3xl font-bold">
                Planner<span className="text-sky-200">ing</span>
              </h1>
            </div>
            <p className="text-sky-100 mt-4 text-lg max-w-md">
              Crie sua conta para começar a organizar seus estudos e alcançar seus objetivos acadêmicos.
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
      <div className="flex-1 flex w-full pattern-point items-center justify-center p-6 md:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="border-none shadow-lg bg-white">
            <CardContent className="pt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 text-center"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Comece agora mesmo</h2>
                <p className="text-gray-500">Preencha os dados para criar sua conta</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Versão para dispositivos móveis com steps */}
                <AnimatePresence mode="wait" initial={false}>
                  {formStep === 0 ? (
                    <motion.div key="step1" {...pageTransition} className="space-y-4 md:hidden">
                      <div className="space-y-2">
                        <Label htmlFor="nome-mobile" className="text-sm font-medium text-gray-700">
                          Nome completo
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            <User className="h-4 w-4" />
                          </div>
                          <Input
                            id="nome-mobile"
                            name="nome"
                            type="text"
                            autoComplete="name"
                            className={cn(
                              "pl-10 transition-all",
                              errors.nome
                                ? "border-destructive focus-visible:ring-destructive/30"
                                : formData.nome
                                ? "border-green-500 focus-visible:ring-green-500/30"
                                : "",
                            )}
                            value={formData.nome}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Seu nome completo"
                          />
                          <AnimatePresence>
                            {formData.nome && !errors.nome && (
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
                        {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email-mobile" className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input
                            id="email-mobile"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className={cn(
                              "pl-10 transition-all",
                              errors.email
                                ? "border-destructive focus-visible:ring-destructive/30"
                                : formData.email
                                ? "border-green-500 focus-visible:ring-green-500/30"
                                : "",
                            )}
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="seu.email@exemplo.com"
                          />
                          <AnimatePresence>
                            {formData.email && !errors.email && (
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
                        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                      </div>

                      <Button
                        type="button"
                        onClick={nextStep}
                        className="w-full mt-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600"
                      >
                        Próximo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="step2" {...pageTransition} className="space-y-4 md:hidden">
                      <div className="space-y-2">
                        <Label htmlFor="senha-mobile" className="text-sm font-medium text-gray-700">
                          Senha
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </div>
                          <Input
                            id="senha-mobile"
                            name="senha"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={cn(
                              "pl-10 pr-10 transition-all",
                              errors.senha
                                ? "border-destructive focus-visible:ring-destructive/30"
                                : formData.senha
                                ? "border-green-500 focus-visible:ring-green-500/30"
                                : "",
                            )}
                            value={formData.senha}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.senha && <p className="text-xs text-destructive mt-1">{errors.senha}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmarSenha-mobile" className="text-sm font-medium text-gray-700">
                          Confirmar senha
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </div>
                          <Input
                            id="confirmarSenha-mobile"
                            name="confirmarSenha"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={cn(
                              "pl-10 pr-10 transition-all",
                              errors.confirmarSenha
                                ? "border-destructive focus-visible:ring-destructive/30"
                                : formData.confirmarSenha
                                ? "border-green-500 focus-visible:ring-green-500/30"
                                : "",
                            )}
                            value={formData.confirmarSenha}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmarSenha && (
                          <p className="text-xs text-destructive mt-1">{errors.confirmarSenha}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Use pelo menos 6 caracteres, incluindo letras e números
                        </p>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Aguarde
                            </>
                          ) : (
                            "Cadastrar"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Versão para desktop - tudo em uma página */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="hidden md:block space-y-6"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                        Nome completo
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          <User className="h-4 w-4" />
                        </div>
                        <Input
                          id="nome"
                          name="nome"
                          type="text"
                          autoComplete="name"
                          className={cn(
                            "pl-10 transition-all",
                            errors.nome
                              ? "border-destructive focus-visible:ring-destructive/30"
                              : formData.nome
                              ? "border-green-500 focus-visible:ring-green-500/30"
                              : "",
                          )}
                          value={formData.nome}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Seu nome completo"
                        />
                        <AnimatePresence>
                          {formData.nome && !errors.nome && (
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
                      {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome}</p>}
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          className={cn(
                            "pl-10 transition-all",
                            errors.email
                              ? "border-destructive focus-visible:ring-destructive/30"
                              : formData.email
                              ? "border-green-500 focus-visible:ring-green-500/30"
                              : "",
                          )}
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="seu.email@exemplo.com"
                        />
                        <AnimatePresence>
                          {formData.email && !errors.email && (
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
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="bg-sky-50/50 rounded-lg p-4 border border-sky-100 space-y-4"
                    >
                      <h3 className="text-sm font-medium text-sky-700 flex items-center">
                        <Lock className="h-4 w-4 mr-1.5" />
                        Segurança da Conta
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
                          Senha
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </div>
                          <Input
                            id="senha"
                            name="senha"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={cn(
                              "pl-10 pr-10 transition-all",
                              errors.senha
                                ? "border-destructive focus-visible:ring-destructive/30"
                                : formData.senha
                                ? "border-green-500 focus-visible:ring-green-500/30"
                                : "",
                            )}
                            value={formData.senha}
                            onChange={(e) => {
                              handleChange(e);
                              if (formData.confirmarSenha) {
                                validateField("confirmarSenha", formData.confirmarSenha);
                              }
                            }}
                            onBlur={handleBlur}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.senha && <p className="text-xs text-destructive mt-1">{errors.senha}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmarSenha" className="text-sm font-medium text-gray-700">
                          Confirmar senha
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </div>
                          <Input
                            id="confirmarSenha"
                            name="confirmarSenha"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={cn(
                              "pl-10 pr-10 transition-all",
                              errors.confirmarSenha
                                ? "border-destructive focus-visible:ring-destructive/30"
                                : formData.confirmarSenha
                                ? "border-green-500 focus-visible:ring-green-500/30"
                                : "",
                            )}
                            value={formData.confirmarSenha}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmarSenha && (
                          <p className="text-xs text-destructive mt-1">{errors.confirmarSenha}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Use pelo menos 6 caracteres, incluindo letras e números
                        </p>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 transition-all"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando sua conta...
                          </>
                        ) : (
                          "Criar conta"
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-6 text-sm text-gray-500"
                >
                  Já tem uma conta?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-sky-600 hover:text-sky-800 transition-colors underline-offset-4 hover:underline"
                  >
                    Faça login
                  </Link>
                </motion.div>
              </form>
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
