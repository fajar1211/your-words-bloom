import type { NavigateFunction } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { invokeWithAuth } from "@/lib/invokeWithAuth";

import type { MidtransEnv, MidtransStatus } from "@/components/super-admin/MidtransIntegrationCard";

const SETTINGS_FN = "super-admin-midtrans-settings";

type GetResponse = {
  configured: boolean;
  updated_at: string | null;
  active_env: MidtransEnv | null;
  merchant_id: string | null;
  sandbox: {
    configured: boolean;
    client_key_masked: string | null;
    server_key_masked: string | null;
    updated_at: string | null;
  };
  production: {
    configured: boolean;
    client_key_masked: string | null;
    server_key_masked: string | null;
    updated_at: string | null;
  };
};

type SetActiveEnvResponse = { ok: boolean; active_env: MidtransEnv };

export function useMidtransIntegration({ navigate }: { navigate: NavigateFunction }) {
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<MidtransStatus>({
    merchantId: null,
    updatedAt: null,
    activeEnv: null,
    sandbox: { configured: false, clientKeyMasked: null, serverKeyMasked: null, updatedAt: null },
    production: { configured: false, clientKeyMasked: null, serverKeyMasked: null, updatedAt: null },
  });

  const [selectedEnv, setSelectedEnv] = useState<MidtransEnv>("production");

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeWithAuth<GetResponse>(SETTINGS_FN, { action: "get" });
      if (error) throw error;

      const sandbox = (data as any)?.sandbox ?? {};
      const production = (data as any)?.production ?? {};

      setStatus({
        merchantId: ((data as any)?.merchant_id ?? null) as any,
        updatedAt: ((data as any)?.updated_at ?? null) as any,
        activeEnv: ((data as any)?.active_env ?? null) as any,
        sandbox: {
          configured: Boolean(sandbox?.configured),
          clientKeyMasked: (sandbox?.client_key_masked ?? null) as any,
          serverKeyMasked: (sandbox?.server_key_masked ?? null) as any,
          updatedAt: (sandbox?.updated_at ?? null) as any,
        },
        production: {
          configured: Boolean(production?.configured),
          clientKeyMasked: (production?.client_key_masked ?? null) as any,
          serverKeyMasked: (production?.server_key_masked ?? null) as any,
          updatedAt: (production?.updated_at ?? null) as any,
        },
      });

      const active = (data as any)?.active_env;
      if (active === "sandbox" || active === "production") {
        setSelectedEnv(active);
      }
    } catch (e: any) {
      console.error(e);
      if (String(e?.message ?? "").toLowerCase().includes("unauthorized")) {
        toast.error("Your session has expired. Please sign in again.");
        navigate("/super-admin/login", { replace: true });
        return;
      }
      toast.error(e?.message || "Unable to load Midtrans status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveSelectedEnv = async () => {
    setLoading(true);
    try {
      const { error } = await invokeWithAuth<SetActiveEnvResponse>(SETTINGS_FN, {
        action: "set_active_env",
        env: selectedEnv,
      });
      if (error) throw error;
      toast.success(`Midtrans environment set to ${selectedEnv}.`);
      await fetchStatus();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Unable to save Midtrans environment.");
    } finally {
      setLoading(false);
    }
  };

  return useMemo(
    () => ({
      loading,
      status,
      selectedEnv,
      setSelectedEnv,
      onSaveSelectedEnv,
      onRefresh: fetchStatus,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, status, selectedEnv],
  );
}
