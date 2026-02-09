import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { usePreEntrada, type PreEntradaItem } from "../hooks/usePreEntrada";

const PreEnrtada = () => {
  const [abrir, setAbrir] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState<PreEntradaItem | null>(
    null,
  );

  // ✅ filtros
  const [filialSelecionada, setFilialSelecionada] = useState<string>("TODAS");
  const [pesquisa, setPesquisa] = useState("");

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

  // ✅ filiais únicas (sem repetir)
  const filiaisUnicas = useMemo(() => {
    const set = new Set<number>();
    for (const p of data) set.add(Number(p.filial));
    return Array.from(set).sort((a, b) => a - b);
  }, [data]);

  // ✅ aplicar filtro + pesquisa (fornecedor + numNota)
  const dataFiltrada = useMemo(() => {
    const q = pesquisa.trim().toLowerCase();

    return data.filter((p) => {
      const okFilial =
        filialSelecionada === "TODAS" ||
        String(p.filial) === String(filialSelecionada);

      if (!okFilial) return false;

      if (!q) return true;

      const fornecedor = String(p.fornecedor ?? "").toLowerCase();
      const numNota = String(p.numNota ?? "").toLowerCase();

      return fornecedor.includes(q) || numNota.includes(q);
    });
  }, [data, filialSelecionada, pesquisa]);

  const totalFiltrado = dataFiltrada.length;

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

        <div className="text-xs bg-black/25 px-3 py-2 rounded-xl border border-white/10 text-right">
          <div>
            <span className="font-semibold">Mostrando:</span>{" "}
            <span>{totalFiltrado}</span>
          </div>
          <div className="text-[11px] text-red-100/70">
            Total geral: <span className="font-semibold">{total}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4 shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Select Filial */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-400">Filial</span>
              <select
                value={filialSelecionada}
                onChange={(e) => setFilialSelecionada(e.target.value)}
                className="h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm outline-none focus:border-red-500/60"
              >
                <option value="TODAS">Todas</option>
                {filiaisUnicas.map((f) => (
                  <option key={f} value={String(f)}>
                    Filial {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Pesquisa */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs text-zinc-400">
                Pesquisar (Fornecedor ou Nº Nota)
              </span>
              <input
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Ex: colina, agrofrut, 1652..."
                className="h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm outline-none focus:border-red-500/60"
              />
            </div>
          </div>

          {/* limpar rápido */}
          {(filialSelecionada !== "TODAS" || pesquisa.trim()) && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                Filtro ativo:{" "}
                <span className="text-zinc-200 font-semibold">
                  {filialSelecionada === "TODAS"
                    ? "Todas"
                    : `Filial ${filialSelecionada}`}
                </span>
                {pesquisa.trim() ? (
                  <>
                    {" "}
                    · Pesquisa:{" "}
                    <span className="text-zinc-200 font-semibold">
                      {pesquisa.trim()}
                    </span>
                  </>
                ) : null}
              </p>

              <button
                onClick={() => {
                  setFilialSelecionada("TODAS");
                  setPesquisa("");
                }}
                className="text-xs px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {dataFiltrada.map((p) => (
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

          {dataFiltrada.length === 0 && (
            <div className="text-center py-10 text-zinc-400">
              <p className="font-semibold text-zinc-200">Nada encontrado</p>
              <p className="text-sm">
                Tente trocar a filial ou ajustar a pesquisa.
              </p>
            </div>
          )}
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
            <a href="https://api.whatsapp.com/send/?phone=5591992536958&text=Olá%2C+não+encontrei+a+NF&type=phone_number&app_absent=0">
              Não tem Pre-entrada
            </a>
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
