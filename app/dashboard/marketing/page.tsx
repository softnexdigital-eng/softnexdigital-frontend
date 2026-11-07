"use client";

import { useCallback, useEffect, useState } from "react";
import { FiCheckCircle, FiSave, FiSend, FiShield } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { showToast } from "@/lib/toast";

interface MetaSettings {
  enabled: boolean;
  pixelId: string;
  hasAccessToken: boolean;
  serverTrackingEnabled: boolean;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function MarketingSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const [settings, setSettings] = useState<MetaSettings>({
    enabled: false,
    pixelId: "",
    hasAccessToken: false,
    serverTrackingEnabled: false,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [clearAccessToken, setClearAccessToken] = useState(false);
  const [testEventCode, setTestEventCode] = useState("");
  const [eventSourceUrl, setEventSourceUrl] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [testError, setTestError] = useState("");
  const [testSuccess, setTestSuccess] = useState("");

  const refreshSettings = useCallback(async (): Promise<boolean> => {
    setSettingsError("");
    try {
      const response = await api.get("/marketing/meta/settings");
      if (!response.data?.success || !response.data?.data) {
        setSettingsError(response.data?.message || "Meta settings could not be loaded.");
        return false;
      }

      const data = response.data.data;
      setSettings({
        enabled: Boolean(data.enabled),
        pixelId: typeof data.pixelId === "string" ? data.pixelId : "",
        hasAccessToken: Boolean(data.hasAccessToken),
        serverTrackingEnabled: Boolean(data.serverTrackingEnabled),
      });
      return true;
    } catch (error) {
      setSettingsError(getApiErrorMessage(error, "Meta settings could not be loaded."));
      return false;
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || isSuperAdmin) return;
    const timer = window.setTimeout(() => void refreshSettings(), 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, isSuperAdmin, refreshSettings]);

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSuperAdmin || saving) return;

    setSaving(true);
    setSettingsError("");
    try {
      const payload: {
        pixelId: string;
        enabled: boolean;
        accessToken?: string;
        clearAccessToken?: boolean;
      } = {
        pixelId: settings.pixelId.trim(),
        enabled: settings.enabled,
      };
      if (clearAccessToken) {
        payload.clearAccessToken = true;
      } else if (accessToken.trim()) {
        payload.accessToken = accessToken.trim();
      }

      const response = await api.put("/marketing/meta/settings", payload);
      if (!response.data?.success) {
        setSettingsError(response.data?.message || "Meta settings could not be saved.");
        return;
      }
      setAccessToken("");
      setClearAccessToken(false);
      const refreshed = await refreshSettings();
      if (refreshed) {
        showToast.success("Meta settings saved.");
      } else {
        showToast.warning("Settings saved, but the latest status could not be refreshed.");
      }
    } catch (error) {
      setSettingsError(getApiErrorMessage(error, "Meta settings could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  const sendTestEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSuperAdmin || sendingTest) return;

    setSendingTest(true);
    setTestError("");
    setTestSuccess("");
    try {
      const response = await api.post("/marketing/meta/test", {
        testEventCode: testEventCode.trim(),
        eventSourceUrl: eventSourceUrl.trim(),
      });
      if (!response.data?.success) {
        setTestError(response.data?.message || "Meta test event could not be sent.");
        return;
      }
      setTestSuccess(response.data.message || "Test event sent to Meta.");
    } catch (error) {
      setTestError(getApiErrorMessage(error, "Meta test event could not be sent."));
    } finally {
      setSendingTest(false);
    }
  };

  if (!authLoading && isSuperAdmin) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <FiShield /> Store admin access required
        </h1>
        <p className="mt-2 text-sm">
          Super admin accounts cannot view or manage tenant Meta tracking settings.
        </p>
      </section>
    );
  }

  if (authLoading || settingsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Meta Pixel &amp; Conversions API</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure tracking for this store. The access token is sent only to the backend and is never displayed here.
        </p>
      </header>

      {settingsError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {settingsError}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Tracking settings</h2>
            <p className="mt-1 text-sm text-gray-500">Pixel ID enables browser tracking; server tracking also requires a saved token.</p>
          </div>
          <div className="space-y-1 text-right text-xs">
            <p className={settings.hasAccessToken ? "text-emerald-700" : "text-gray-500"}>
              CAPI token: {settings.hasAccessToken ? "Configured" : "Not configured"}
            </p>
            <p className={settings.serverTrackingEnabled ? "text-emerald-700" : "text-gray-500"}>
              Server tracking: {settings.serverTrackingEnabled ? "Enabled" : "Unavailable"}
            </p>
          </div>
        </div>

        <form onSubmit={saveSettings} className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Meta Pixel ID</span>
            <input
              inputMode="numeric"
              pattern="[0-9]{5,30}"
              value={settings.pixelId}
              onChange={(event) => setSettings((current) => ({ ...current, pixelId: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="123456789012345"
            />
            <span className="mt-1 block text-xs text-gray-500">Enter 5–30 digits.</span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Conversions API access token</span>
            <input
              type="password"
              autoComplete="new-password"
              value={accessToken}
              onChange={(event) => {
                setAccessToken(event.target.value);
                if (event.target.value) setClearAccessToken(false);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder={settings.hasAccessToken ? "Saved token is hidden; leave blank to keep it" : "Paste access token"}
            />
            <span className="mt-1 block text-xs text-gray-500">
              A newly entered token replaces the saved token. The saved value is never returned by the API.
            </span>
          </label>

          {settings.hasAccessToken && (
            <label className="flex items-center gap-2 text-sm text-red-700">
              <input
                type="checkbox"
                checked={clearAccessToken}
                onChange={(event) => {
                  setClearAccessToken(event.target.checked);
                  if (event.target.checked) setAccessToken("");
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              Clear the saved access token when saving
            </label>
          )}

          <label className="flex items-center gap-3 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) => setSettings((current) => ({ ...current, enabled: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            Enable Meta tracking
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave /> {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Send test event</h2>
          <p className="mt-1 text-sm text-gray-500">Use the test code shown in Meta Events Manager.</p>
        </div>
        <form onSubmit={sendTestEvent} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Test event code</span>
            <input
              required
              value={testEventCode}
              onChange={(event) => setTestEventCode(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="TEST12345"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Event source URL</span>
            <input
              required
              type="url"
              value={eventSourceUrl}
              onChange={(event) => setEventSourceUrl(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="https://your-store.example"
            />
          </label>
          {testError && <p role="alert" className="text-sm text-red-700">{testError}</p>}
          {testSuccess && (
            <p role="status" className="flex items-center gap-2 text-sm text-emerald-700">
              <FiCheckCircle /> {testSuccess}
            </p>
          )}
          <button
            type="submit"
            disabled={sendingTest}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSend /> {sendingTest ? "Sending…" : "Send test event"}
          </button>
        </form>
      </section>
    </div>
  );
}
