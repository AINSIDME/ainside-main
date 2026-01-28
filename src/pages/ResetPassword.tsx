import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordMismatch = useMemo(() => {
    if (!password || !confirmPassword) return false;
    return password !== confirmPassword;
  }, [password, confirmPassword]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (cancelled) return;
        setHasSession(Boolean(data.session));
      } catch {
        if (cancelled) return;
        setHasSession(false);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      toast({
        title: t('resetPassword.errors.tooShort.title'),
        description: t('resetPassword.errors.tooShort.description'),
        variant: "destructive",
      });
      return;
    }

    if (passwordMismatch) {
      toast({
        title: t('resetPassword.errors.mismatch.title'),
        description: t('resetPassword.errors.mismatch.description'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: t('resetPassword.success.title'),
        description: t('resetPassword.success.description'),
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: t('resetPassword.errors.update.title'),
        description: error?.message ?? t('resetPassword.errors.update.description'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">{t('resetPassword.title')}</CardTitle>
          <CardDescription className="text-slate-300">
            {t('resetPassword.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkingSession ? (
            <div className="text-sm text-slate-300">{t('resetPassword.checking')}</div>
          ) : !hasSession ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                {t('resetPassword.noSession.message')}
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                {t('resetPassword.noSession.button')}
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">{t('resetPassword.form.newPassword.label')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-950/60 border-slate-800 text-slate-50 placeholder:text-slate-500"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">{t('resetPassword.form.confirmPassword.label')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-950/60 border-slate-800 text-slate-50 placeholder:text-slate-500"
                  autoComplete="new-password"
                  required
                />
                {passwordMismatch && (
                  <div className="text-xs text-red-300">{t('resetPassword.form.mismatch')}</div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('resetPassword.form.updating') : t('resetPassword.form.updateButton')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
