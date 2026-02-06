import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export type PreEntradaItem = {
  filial: number;
  numNota: number;
  codFornec: number;
  fornecedor: string;
};

export type EntradaNotaItem = {
  codfilial: number;
  numNota: number;
  codFornec: number;
  fornecedor: string;
  entrada: "S" | "N";
};

type ApiResponsePre = {
  ok: boolean;
  total: number;
  data: PreEntradaItem[];
  error?: string;
  detalhe?: string;
};

type ApiResponseEntrada = {
  ok: boolean;
  total: number;
  data: Array<{
    codfilial: number;
    numNota: number;
    codFornec: number;
    enrtada?: string; // sua API retornou "enrtada" (typo)
    entrada?: string; // caso você corrija no backend
  }>;
  error?: string;
  detalhe?: string;
};

export type EntradaPayload = {
  codfilial: number;
  numnota: number;
  codfornec: number;
};

const API = "https://api.devbr.site/preentrada";

export function usePreEntrada() {
  const [data, setData] = useState<PreEntradaItem[]>([]);
  const [dataNota, setDataNota] = useState<EntradaNotaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalEntrada, setTotalEntrada] = useState(0);

  const [loading, setLoading] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingConfirm, setSavingConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchPreEntrada = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get<ApiResponsePre>(`${API}/`, {
        timeout: 15000,
      });

      if (!res.data?.ok) {
        setError(res.data?.error || "Resposta inválida da API");
        setData([]);
        setTotal(0);
        return;
      }

      setData(res.data.data || []);
      setTotal(res.data.total ?? res.data.data?.length ?? 0);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Erro ao buscar pré-entradas",
      );
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntradaNota = useCallback(
    async (payload: EntradaPayload) => {
      setSavingCreate(true);
      setError(null);

      try {
        const res = await axios.post(`${API}/pre`, payload, {
          timeout: 15000,
        });

        if (!res.data?.ok) {
          throw new Error(res.data?.error || "Erro ao criar entrada");
        }

        // atualiza listas
        await Promise.all([fetchPreEntrada(), fetchEntrada()]);
        return res.data;
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Erro ao salvar entrada";
        setError(msg);
        throw err;
      } finally {
        setSavingCreate(false);
      }
    },
    [fetchPreEntrada],
  );

  const confirmEntradaNota = useCallback(
    async (payload: EntradaPayload) => {
      setSavingConfirm(true);
      setError(null);

      try {
        const res = await axios.put(`${API}/confirmar`, payload, {
          timeout: 15000,
        });

        if (!res.data?.ok) {
          throw new Error(res.data?.error || "Erro ao confirmar entrada");
        }

        // atualiza listas
        await Promise.all([fetchPreEntrada(), fetchEntrada()]);
        return res.data;
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Erro ao confirmar entrada";
        setError(msg);
        throw err;
      } finally {
        setSavingConfirm(false);
      }
    },
    [fetchPreEntrada],
  );

  const fetchEntrada = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get<ApiResponseEntrada>(`${API}/enrtada`, {
        timeout: 15000,
      });

      if (!res.data?.ok) {
        setError(res.data?.error || "Resposta inválida da API");
        setDataNota([]);
        setTotalEntrada(0);
        return;
      }

      const normalized: EntradaNotaItem[] = (res.data.data || []).map(
        (r: any) => ({
          codfilial: Number(r.codfilial),
          numNota: Number(r.numNota),
          codFornec: Number(r.codFornec),
          fornecedor: r.fornecedor ? String(r.fornecedor) : "",
          entrada:
            String(r.entrada ?? r.enrtada ?? "N")
              .trim()
              .toUpperCase() === "S"
              ? "S"
              : "N",
        }),
      );

      setDataNota(normalized);
      setTotalEntrada(
        Number.isFinite(Number(res.data.total))
          ? Number(res.data.total)
          : normalized.length,
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.error || err?.message || "Erro ao buscar entradas",
      );
      setDataNota([]);
      setTotalEntrada(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreEntrada();
    fetchEntrada();
  }, [fetchPreEntrada, fetchEntrada]);

  return {
    data,
    total,
    dataNota,
    totalEntrada,
    loading,
    savingCreate,
    savingConfirm,
    error,
    refresh: fetchPreEntrada,
    fetchEntrada,
    createEntradaNota,
    confirmEntradaNota,
  };
}
