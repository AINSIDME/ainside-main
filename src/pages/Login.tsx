import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";

const getAppOrigin = () => {
  const configured = (import.meta.env.VITE_APP_ORIGIN as string | undefined)?.trim();
  if (configured) return configured.replace(/\/$/, "");

  // Avoid www/non-www session split in localStorage.
  if (window.location.hostname === 'www.ainside.me') {
    return `${window.location.protocol}//ainside.me`;
  }

  return window.location.origin;
};

type LoginCardProps = {
  redirectTo?: string;
};

export const LoginCard = ({ redirectTo = "/dashboard" }: LoginCardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const setMode = (mode: "login" | "reset" | "signup") => {
    setIsResetMode(mode === "reset");
    setIsSignUpMode(mode === "signup");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: t("login.success.title", { defaultValue: "¡Bienvenido!" }),
        description: t("login.success.message", { defaultValue: "Has iniciado sesión correctamente" }),
      });

      try {
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        const currentLevel = (data as any)?.currentLevel as string | undefined;
        const nextLevel = (data as any)?.nextLevel as string | undefined;
        if (currentLevel !== "aal2" && nextLevel === "aal2") {
          navigate("/mfa", { replace: true, state: { redirectTo } });
          return;
        }
      } catch {
        // If MFA isn't enabled/available, proceed normally.
      }

      navigate(redirectTo);
    } catch (error: any) {
      toast({
        title: t("login.error.title", { defaultValue: "Error" }),
        description:
          error.message ||
          t("login.error.message", { defaultValue: "No se pudo iniciar sesión. Verifica tus credenciales." }),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const appOrigin = getAppOrigin();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${appOrigin}/dashboard`,
          data: fullName ? { full_name: fullName } : undefined,
        },
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: t("login.success.title", { defaultValue: "¡Bienvenido!" }),
          description: t("login.success.message", { defaultValue: "Has iniciado sesión correctamente" }),
        });

        try {
          const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          const currentLevel = (aal as any)?.currentLevel as string | undefined;
          const nextLevel = (aal as any)?.nextLevel as string | undefined;
          if (currentLevel !== "aal2" && nextLevel === "aal2") {
            navigate("/mfa", { replace: true, state: { redirectTo } });
            return;
          }
        } catch {
          // Ignore and continue
        }

        navigate(redirectTo);
        return;
      }

      toast({
        title: t("login.signup.success.title", { defaultValue: "Cuenta creada" }),
        description: t("login.signup.success.message", {
          defaultValue: "Revisa tu email para confirmar tu cuenta (si la confirmación está activada).",
        }),
      });

      setMode("login");
    } catch (error: any) {
      toast({
        title: t("login.error.title", { defaultValue: "Error" }),
        description:
          error.message ||
          t("login.signup.error.message", {
            defaultValue: "No se pudo crear la cuenta. Intenta nuevamente.",
          }),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const appOrigin = getAppOrigin();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${appOrigin}${redirectTo}` },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google OAuth error:", error);

      if (error.message?.includes("provider is not enabled") || error.error_code === "validation_failed") {
        toast({
          title: t("login.googleOAuthNotEnabled.title", { defaultValue: "⚠️ Google OAuth no habilitado" }),
          description: t("login.googleOAuthNotEnabled.description", {
            defaultValue: "Ve a Supabase Dashboard → Authentication → Providers → Google y activa el toggle 'Enable Sign in con Google'",
          }),
          variant: "destructive",
          duration: 8000,
        });
      } else {
        toast({
          title: t("login.error.title", { defaultValue: "Error" }),
          description:
            error.message ||
            t("login.error.googleError", {
              defaultValue: "No se pudo iniciar sesión con Google. Intenta con email/password.",
            }),
          variant: "destructive",
        });
      }
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const appOrigin = getAppOrigin();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appOrigin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: t("login.reset.success.title", { defaultValue: "Email Enviado" }),
        description: t("login.reset.success.message", { defaultValue: "Revisa tu email para restablecer tu contraseña" }),
      });

      setIsResetMode(false);
    } catch (error: any) {
      toast({
        title: t("login.error.title", { defaultValue: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
      <CardContent className="pt-6 pb-8 px-6 space-y-5">{/* Google Login (only in login mode) */}
        {!isResetMode && !isSignUpMode && (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 py-5 rounded-lg font-medium transition-all hover:shadow-md"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {t("login.google", { defaultValue: "Continuar con Google" })}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900/50 px-2 text-slate-400">{t("login.or", { defaultValue: "O" })}</span>
              </div>
            </div>
          </>
        )}

        <form
          onSubmit={isResetMode ? handlePasswordReset : isSignUpMode ? handleEmailSignUp : handleEmailLogin}
          className="space-y-4"
        >
          {isSignUpMode && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-200">
                {t("login.signup.name.label", { defaultValue: "Nombre" })}
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder={t("login.signup.name.placeholder", { defaultValue: "Tu nombre" })}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-800/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400 py-5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 text-sm font-medium">
              <Mail className="inline h-4 w-4 mr-2" />
              {t("login.email.label", { defaultValue: "Email" })}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("login.email.placeholder", { defaultValue: "tu@email.com" })}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-800/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400 py-5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {!isResetMode && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 text-sm font-medium">
                <Lock className="inline h-4 w-4 mr-2" />
                {t("login.password.label", { defaultValue: "Contraseña" })}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400 py-5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-5 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("login.loading", { defaultValue: "Cargando..." })}
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                {isResetMode
                  ? t("login.reset.button", { defaultValue: "Enviar Email" })
                  : isSignUpMode
                    ? t("login.signup.submit", { defaultValue: "Crear Cuenta" })
                    : t("login.button", { defaultValue: "Iniciar Sesión" })}
              </>
            )}
          </Button>
        </form>

        <div className="space-y-3 text-center text-sm pt-2">
          <button
            type="button"
            onClick={() => {
              if (isResetMode) setMode("login");
              else setMode("reset");
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors block w-full font-medium"
          >
            {isResetMode
              ? t("login.backToLogin", { defaultValue: "Volver a iniciar sesión" })
              : t("login.forgotPassword", { defaultValue: "¿Olvidaste tu contraseña?" })}
          </button>

          <div className="text-slate-300">
            {t("login.noAccount", { defaultValue: "¿No tienes cuenta?" })}{" "}
            <button
              type="button"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              onClick={() => setMode(isSignUpMode ? "login" : "signup")}
              disabled={isResetMode}
            >
              {isSignUpMode
                ? t("login.backToLogin", { defaultValue: "Volver a iniciar sesión" })
                : t("login.register", { defaultValue: "Regístrate" })}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (() => {
    const state = (location.state as any) ?? null;
    const candidate = typeof state?.redirectTo === "string" ? state.redirectTo : null;
    if (candidate && candidate.startsWith("/")) return candidate;
    return "/dashboard";
  })();


  return (
    <>
      <PageSEO
        title={t("login.seo.title", { defaultValue: "Iniciar Sesión - AInside" })}
        description={t("login.seo.description", { defaultValue: "Accede a tu cuenta de AInside para gestionar tu licencia y estrategias de trading algorítmico" })}
        keywords={t("login.seo.keywords", { defaultValue: "login, iniciar sesión, acceso, cuenta, dashboard" })}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Login Card Container */}
        <div className="relative w-full max-w-md">
          {/* Login Form */}
          <LoginCard redirectTo={redirectTo} />
        </div>
      </div>
    </>
  );
};

export default Login;
