import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Inbox,
  FileText,
  X,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import { usePreEntrada } from "../hooks/usePreEntrada";

type EntradaItem = {
  codfilial: number;
  numNota: number;
  codFornec: number;
  entrada?: string;  // se backend retornar certo
  enrtada?: string;  // se backend retornar com typo
  ENTRADA?: string;  // se vier do Oracle sem normalizar
};

function getEntradaStatus(nota: any): "S" | "N" {
  const raw = String(nota?.entrada ?? nota?.enrtada ?? nota?.ENTRADA ?? "")
    .trim()
    .toUpperCase();
  return raw === "S" ? "S" : "N";
}

const Entrada = () => {
  const {
    dataNota,
    totalEntrada,
    loading,
    error,
    savingConfirm,
    confirmEntradaNota,
  } = usePreEntrada();

  const [abrir, setAbrir] = useState(false);
  const [notaSel, setNotaSel] = useState<EntradaItem | null>(null);

  const abrirModal = (nota: EntradaItem) => {
    setNotaSel(nota);
    setAbrir(true);
  };

  const confirmarEntrada = async () => {
    if (!notaSel) return;

    try {
      await confirmEntradaNota({
        codfilial: notaSel.codfilial,
        numnota: notaSel.numNota,
        codfornec: notaSel.codFornec,
      });

      alert(`✅ Entrada confirmada: NF #${notaSel.numNota}`);
      setAbrir(false);
    } catch (e) {
      console.log(e);
      alert("❌ Erro ao confirmar entrada.");
    }
  };

  return (
    <div className="bg-zinc-950 h-screen flex flex-col overflow-hidden text-zinc-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 h-20 w-full flex items-center justify-between px-4 max-w-7xl mx-auto shrink-0 shadow-lg border-b border-red-900/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-black/25 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold tracking-wide">Entradas</h1>
            <p className="text-sm text-red-100/80">Total: {totalEntrada}</p>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 text-sm bg-black/25 px-3 py-2 rounded-xl border border-white/10 hover:bg-black/30 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Lista */}
      <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto px-4 py-4">
        {loading && <p className="text-zinc-400">Carregando...</p>}
        {error && <p className="text-red-300">Erro: {error}</p>}

        <div className="space-y-3">
          {(dataNota as any[]).map((nota) => {

            return (
              <button
                key={`${nota.codfilial}-${nota.numNota}-${nota.codFornec}`}
                onClick={() => abrirModal(nota)}
                className="w-full text-left bg-zinc-900 hover:bg-zinc-800 transition p-4 rounded-2xl border border-zinc-800 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>

                    <div>
                      <p className="font-semibold">
                        Filial {nota.codfilial} · Fornec {nota.codFornec} - {nota.fornecedor}
                      </p>
                      <p className="text-sm text-zinc-400">NF #{nota.numNota}</p>

                      {nota.entrada === 'S' && (
                        <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 rounded-full">
                        <BadgeCheck className="w-4 h-4" />
                        Entrada confirmada
                      </div>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-red-200 bg-red-500/15 border border-red-500/20 px-3 py-1 rounded-full">
                    NF {nota.numNota}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-7xl mx-auto px-4 py-3 bg-zinc-950 shrink-0 border-t border-zinc-800">
        <div className="grid grid-cols-1 gap-3">
          <Link
            to="/"
            className="flex justify-center items-center gap-2 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition font-semibold text-zinc-100 border border-zinc-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Pré-Entradas</span>
          </Link>
        </div>
      </div>

      {/* MODAL confirmar entrada */}
      {abrir && notaSel && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Confirmar entrada</p>
                <h2 className="text-lg font-bold text-white">
                  NF #{notaSel.numNota}
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Filial {notaSel.codfilial} · Fornec {notaSel.codFornec}
                </p>
              </div>

              <button
                onClick={() => setAbrir(false)}
                className="h-10 w-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <button
                onClick={confirmarEntrada}
                disabled={savingConfirm || getEntradaStatus(notaSel) === "S"}
                className={`h-12 rounded-2xl transition font-semibold text-white flex items-center justify-center gap-2 ${savingConfirm
                    ? "bg-emerald-800/60 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {getEntradaStatus(notaSel) === "S"
                  ? "Já confirmado"
                  : savingConfirm
                    ? "Confirmando..."
                    : "Confirmar entrada"}
              </button>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Isso atualiza no banco para <b>ENTRADA='S'</b>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entrada;
