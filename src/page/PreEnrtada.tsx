import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { usePreEntrada, type PreEntradaItem } from "../hooks/usePreEntrada";

const PreEnrtada = () => {
  const [abrir, setAbrir] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState<PreEntradaItem | null>(null);

  const { data, total, savingCreate, createEntradaNota } = usePreEntrada();

  const abrirModal = (item: PreEntradaItem) => {
    setNotaSelecionada(item);
    setAbrir(true);
  };

  const confirmar = async () => {
    if (!notaSelecionada) return;

    try {
      await createEntradaNota({
        codfilial: notaSelecionada.filial,
        numnota: notaSelecionada.numNota,
        codfornec: notaSelecionada.codFornec,
      });

      alert(`✅ Registrado: NF #${notaSelecionada.numNota}`);
      setAbrir(false);
    } catch (erro) {
      console.log(erro);
      alert("❌ Erro ao registrar (talvez já exista).");
    }
  };

  return (
    <div className="bg-zinc-950 h-screen flex flex-col overflow-hidden text-zinc-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 h-20 w-full flex items-center justify-between px-4 max-w-7xl mx-auto shrink-0 shadow-lg border-b border-red-900/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-black/25 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold tracking-wide">Pré-Entradas</h1>
            <p className="text-sm text-red-100/80">Notas aguardando chegada</p>
          </div>
        </div>

        <div className="text-xs bg-black/25 px-3 py-2 rounded-xl border border-white/10">
          <span className="font-semibold">Total:</span> <span>{total}</span>
        </div>
      </div>

      {/* Lista */}
      <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {data.map((p) => (
            <button
              key={`${p.filial}-${p.numNota}-${p.codFornec}`}
              onClick={() => abrirModal(p)}
              className="w-full text-left bg-zinc-900 hover:bg-zinc-800 transition p-4 rounded-2xl border border-zinc-800 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-400" />
                  </div>

                  <div>
                    <p className="font-semibold">
                      Filial {p.filial} · {p.codFornec} - {p.fornecedor}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Aguardando entrada no sistema
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold text-red-200 bg-red-500/15 border border-red-500/20 px-3 py-1 rounded-full">
                    NF #{p.numNota}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Clique para registrar (ENTRADA = 'N')</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-7xl mx-auto px-4 py-3 bg-zinc-950 shrink-0 border-t border-zinc-800">
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/entrada"
            className="flex justify-center items-center gap-2 h-12 rounded-2xl bg-red-600 hover:bg-red-500 transition font-semibold shadow-md"
          >
            <span>Entradas</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <button className="flex justify-center items-center gap-2 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition font-semibold text-zinc-200 border border-zinc-700">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <a href="https://api.whatsapp.com/send/?phone=5591992536958&text=Olá%2C+não+encontrei+a+NF&type=phone_number&app_absent=0">Não tem entrada</a>
          </button>
        </div>
      </div>

      {/* MODAL */}
      {abrir && notaSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Confirmar registro</p>
                <h2 className="text-lg font-bold text-white">
                  NF #{notaSelecionada.numNota}
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Filial {notaSelecionada.filial} · {notaSelecionada.codFornec} -{" "}
                  {notaSelecionada.fornecedor}
                </p>
              </div>

              <button
                onClick={() => setAbrir(false)}
                className="h-10 w-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <button
                disabled={savingCreate}
                onClick={confirmar}
                className={`h-12 rounded-2xl transition font-semibold text-white flex items-center justify-center gap-2 ${
                  savingCreate
                    ? "bg-red-800/60 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {savingCreate ? "Salvando..." : "Confirmar"}
              </button>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Isso cria registro na <b>ENTRADA_NOTA</b> com <b>ENTRADA='N'</b>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreEnrtada;
