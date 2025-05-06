"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiCalendar, FiCheckCircle, FiClock, FiBook, FiInstagram, FiLinkedin, FiTwitter } from "react-icons/fi";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-sky-500 font-bold text-2xl">
                Planner<span className="text-gray-400">ing</span>
              </span>
            </div>
            <div className="hidden gap-4 md:flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-sky-600 transition-colors">
                Entrar
              </Link>
              <Link
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md transition-colors"
                href="/register"
              >
                Começar Agora
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button className="text-gray-600" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir menu">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden mt-2 flex flex-col gap-2 pb-4">
              <Link href="/login" className="text-gray-600 hover:text-sky-600 transition-colors px-2 py-2 rounded">
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Começar Agora
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Simplificado apenas com texto */}
      <section className="py-24 md:py-32 h-screen flex items-center pattern-point">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-700 mb-6"
          >
            Planeje sua vida acadêmica com <span className="text-sky-500">simplicidade</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
          >
            Gerencie suas tarefas, prazos e compromissos acadêmicos em um só lugar. Aumente sua produtividade e nunca
            mais perca uma entrega importante.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              href={"/register"}
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-md text-lg font-medium transition-colors shadow-sm"
            >
              Começar gratuitamente
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Mantido o existente */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold text-gray-700"
            >
              Recursos para impulsionar seus estudos
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Ferramentas poderosas para ajudar você a gerenciar seu tempo e manter o foco no que importa.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FiCalendar className="w-6 h-6 text-sky-500" />,
                title: "Agenda Inteligente",
                description: "Visualize suas aulas, prazos e compromissos em um calendário integrado.",
              },
              {
                icon: <FiCheckCircle className="w-6 h-6 text-sky-500" />,
                title: "Gerenciador de Tarefas",
                description: "Organize suas atividades acadêmicas com listas de tarefas personalizáveis.",
              },
              {
                icon: <FiClock className="w-6 h-6 text-sky-500" />,
                title: "Lembretes Automáticos",
                description: "Receba notificações para nunca mais perder prazos importantes.",
              },
              {
                icon: <FiBook className="w-6 h-6 text-sky-500" />,
                title: "Organização de Disciplinas",
                description: "Centralize materiais e informações de todas as suas disciplinas.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Mantido o existente */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-700">Como funciona</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Começar a organizar sua vida acadêmica nunca foi tão fácil
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Cadastre-se",
                description: "Crie sua conta gratuitamente em menos de um minuto.",
              },
              {
                step: "02",
                title: "Configure seu perfil",
                description: "Adicione suas disciplinas e personalize suas preferências.",
              },
              {
                step: "03",
                title: "Comece a planejar",
                description: "Organize suas tarefas e acompanhe seu progresso com facilidade.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-sky-100 text-sky-600 rounded-full text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mantido o existente */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-sky-600 rounded-2xl p-8 sm:p-12 text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pronto para transformar sua vida acadêmica?</h2>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              Junte-se a milhares de estudantes que já estão aproveitando os benefícios de uma organização acadêmica
              eficiente.
            </p>
            <button className="bg-white text-sky-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-sky-50 transition-colors">
              Começar Gratuitamente
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer - Redesenhado minimalista */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <span className="text-sky-500 font-bold text-2xl">
                Planner<span className="text-gray-400">ing</span>
              </span>
            </div>
            <div className=" text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} Plannering. Todos os direitos reservados.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
                <FiLinkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
