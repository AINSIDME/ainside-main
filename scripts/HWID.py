
import os, sys, uuid, json, webbrowser, socket, tkinter as tk
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from tkinter import ttk
from tkinter import messagebox

# ttkbootstrap for themed UI (optional)
# If missing, we still allow a CLI-mode output so the HWID can be obtained
# without requiring any extra packages.
HAS_TTKBOOTSTRAP = False
try:
    from ttkbootstrap import Style  # type: ignore
    from ttkbootstrap.widgets import Button, Label, Entry, Combobox  # type: ignore
    HAS_TTKBOOTSTRAP = True
except Exception:
    # Fallback widgets for type annotations and to keep imports working.
    # Note: the full GUI experience requires ttkbootstrap.
    Style = object  # type: ignore
    Button = ttk.Button  # type: ignore
    Label = ttk.Label  # type: ignore
    Entry = ttk.Entry  # type: ignore
    Combobox = ttk.Combobox  # type: ignore

def cli_main() -> int:
    hwid = get_hwid()
    save_hwid(hwid)
    try:
        # Also try to save alongside the script for convenience when run from elsewhere.
        script_dir = os.path.abspath(os.path.dirname(__file__))
        save_hwid(hwid, os.path.join(script_dir, "my_hwid.txt"))
    except Exception:
        pass
    print(hwid, flush=True)
    return 0

# Optional clipboard
try:
    import pyperclip
    HAS_PYPERCLIP = True
except Exception:
    HAS_PYPERCLIP = False

# Optional Pillow for high-quality logo resize
try:
    from PIL import Image, ImageTk
    HAS_PIL = True
except Exception:
    HAS_PIL = False

# Optional requests for HTTP probe
try:
    import requests
    HAS_REQUESTS = True
except Exception:
    HAS_REQUESTS = False

from urllib.request import urlopen, Request as UrlRequest

APP_NAME = "AInside License Tool"
REGISTER_URL = "https://ainside.me/register"
SUPPORT_URL = "https://ainside.me/contact"
ACCOUNT_URL = "https://ainside.me/account"
CONFIG_FILE = "platform_probe.json"
API_BASE = os.environ.get("AINSIDE_API_BASE", "https://ainside.me/api")
HEARTBEAT_URL = "https://odlxhgatqyodxdessxts.supabase.co/functions/v1/client-heartbeat"
LICENSE_ACTIVATE_URL = "https://odlxhgatqyodxdessxts.supabase.co/functions/v1/license-activate"
LICENSE_CHECK_URL = "https://odlxhgatqyodxdessxts.supabase.co/functions/v1/license-check"
AUTH_DIR = os.path.join(os.path.expanduser("~"), ".ainside_tool")
AUTH_FILE = os.path.join(AUTH_DIR, "auth.json")

# ensure auth dir exists
os.makedirs(AUTH_DIR, exist_ok=True)

# --------- Brand assets resolution ---------
def resource_path(rel_path: str) -> str:
    if hasattr(sys, "_MEIPASS"):
        base = sys._MEIPASS
    else:
        base = os.path.abspath(os.path.dirname(__file__))
    return os.path.join(base, "assets", rel_path)

# --------- HWID helpers ---------
def get_hwid() -> str:
    return str(uuid.getnode())

def save_hwid(hwid: str, filename: str = "my_hwid.txt") -> None:
    try:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(hwid)
    except Exception as e:
        print(f"[WARN] Could not save HWID: {e}")

# --------- Clipboard ---------
def copy_to_clipboard(widget, text: str):
    try:
        if HAS_PYPERCLIP:
            pyperclip.copy(text)
        else:
            widget.clipboard_clear()
            widget.clipboard_append(text)
        return True
    except Exception:
        return False

# --------- Config for status probe ---------
def load_probe_config():
    defaults = {
        "mode": "http",               # "http" or "tcp"
        "url": "http://127.0.0.1:8787/health",
        "method": "GET",
        "timeout": 1.5,
        "expected_status": [200, 204],
        "tcp_host": "127.0.0.1",
        "tcp_port": 8787
    }
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            user = json.load(f)
            defaults.update({k: v for k, v in user.items() if v is not None})
    except Exception:
        pass
    return defaults

def platform_is_online(cfg) -> bool:
    mode = (cfg.get("mode") or "http").lower()
    timeout = float(cfg.get("timeout") or 1.5)
    if mode == "tcp":
        host = cfg.get("tcp_host") or "127.0.0.1"
        port = int(cfg.get("tcp_port") or 8787)
        try:
            with socket.create_connection((host, port), timeout=timeout):
                return True
        except Exception:
            return False
    else:
        url = cfg.get("url") or "http://127.0.0.1:8787/health"
        method = (cfg.get("method") or "GET").upper()
        expected = cfg.get("expected_status") or [200, 204]
        try:
            if HAS_REQUESTS:
                resp = requests.request(method, url, timeout=timeout)
                return int(resp.status_code) in expected
            else:
                req = UrlRequest(url, method=method)
                with urlopen(req, timeout=timeout) as resp:
                    return int(resp.status) in expected
        except Exception:
            return False

# --------- DPI scaling ---------
def set_dpi_awareness(root: tk.Tk):
    try:
        if sys.platform.startswith("win"):
            import ctypes
            try:
                ctypes.windll.shcore.SetProcessDpiAwareness(2)
            except Exception:
                try:
                    ctypes.windll.user32.SetProcessDPIAware()
                except Exception:
                    pass
            hwnd = ctypes.windll.user32.GetForegroundWindow()
            dpi = 96
            try:
                dpi = ctypes.windll.user32.GetDpiForWindow(hwnd)
            except Exception:
                try:
                    ctypes.windll.shcore.GetDpiForSystem.restype = ctypes.c_uint
                    dpi = ctypes.windll.shcore.GetDpiForSystem()
                except Exception:
                    dpi = 96
            scale = dpi / 96.0
            try:
                root.tk.call('tk', 'scaling', scale)
            except Exception:
                pass
        else:
            env_scale = os.environ.get("TK_SCALING")
            if env_scale:
                root.tk.call('tk', 'scaling', float(env_scale))
    except Exception:
        pass

# --------- Logo handling ---------
def load_logo(max_width=300):
    logo_path = resource_path("logo_white.png")
    if HAS_PIL and os.path.exists(logo_path):
        try:
            img = Image.open(logo_path).convert("RGBA")
            w, h = img.size
            if w > max_width:
                ratio = max_width / float(w)
                new_size = (int(w * ratio), int(h * ratio))
                img = img.resize(new_size, Image.LANCZOS)
            return ImageTk.PhotoImage(img)
        except Exception:
            pass
    try:
        return tk.PhotoImage(file=logo_path)
    except Exception:
        return None

def load_logo_path(rel_path: str, max_width=300):
    """Load a specific logo asset by relative path within assets/.
    Falls back gracefully if the asset is missing.
    """
    logo_path = resource_path(rel_path)
    if HAS_PIL and os.path.exists(logo_path):
        try:
            img = Image.open(logo_path).convert("RGBA")
            w, h = img.size
            if w > max_width:
                ratio = max_width / float(w)
                new_size = (int(w * ratio), int(h * ratio))
                img = img.resize(new_size, Image.LANCZOS)
            return ImageTk.PhotoImage(img)
        except Exception:
            pass
    try:
        if os.path.exists(logo_path):
            return tk.PhotoImage(file=logo_path)
    except Exception:
        pass
    return None

def _make_mono_from_alpha(base_img, rgb_color=(17, 17, 17)):
    """Given an RGBA image (white logo on transparent), create a solid-color
    version using the alpha mask, preserving alpha, with the provided RGB color."""
    try:
        if base_img.mode != "RGBA":
            base_img = base_img.convert("RGBA")
        r, g, b = rgb_color
        color_img = Image.new("RGBA", base_img.size, (r, g, b, 255))
        alpha = base_img.split()[-1]
        color_img.putalpha(alpha)
        return color_img
    except Exception:
        return None

def generate_theme_logo(theme_key: str, max_width=300):
    """Return an ImageTk.PhotoImage suitable for the current theme.
    - Dark: prefers logo_white.png
    - Light: prefers logo_dark.png, and if missing, recolors logo_white.png to dark.
    """
    is_dark = (theme_key == "Dark")
    if is_dark:
        # Prefer the white logo as-is
        return load_logo_path("logo_white.png", max_width=max_width)
    # Light theme: try a dark asset first
    dark_img = load_logo_path("logo_dark.png", max_width=max_width)
    if dark_img is not None:
        return dark_img
    # If missing and PIL available, recolor white logo to dark
    if HAS_PIL:
        src_path = resource_path("logo_white.png")
        if os.path.exists(src_path):
            try:
                img = Image.open(src_path).convert("RGBA")
                w, h = img.size
                if w > max_width:
                    ratio = max_width / float(w)
                    img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
                mono = _make_mono_from_alpha(img, rgb_color=(17, 17, 17))  # near-black
                if mono is not None:
                    return ImageTk.PhotoImage(mono)
            except Exception:
                pass
    # Last resort: None (caller will show text fallback)
    return None

def set_window_icon(root: tk.Tk):
    ico_path = resource_path("app_icon.ico")
    try:
        if os.path.exists(ico_path) and sys.platform.startswith("win"):
            root.iconbitmap(ico_path)
    except Exception:
        pass
    try:
        png_path = resource_path("icon_512.png")
        if os.path.exists(png_path):
            icon_png = tk.PhotoImage(file=png_path)
            root.iconphoto(True, icon_png)
    except Exception:
        pass

# --------- i18n (EN/HE) ---------
LANG = "EN"  # default

TEXTS = {
    "EN": {
        "title": "AInside HWID License Tool",
        "subtitle": "Your Hardware ID (HWID)",
        "hwid_label": "Your HWID Number:",
        "copy": "Copy HWID",
        "copied": "✓ Copied!",
        "register": "Register License Online",
        "register_hint": "Opens web registration page with your HWID pre-copied",
        "help": "Contact Support",
        "footer": "Software licensed by AInside.me",
        "status": "Platform Status",
        "connected": "● Online",
        "disconnected": "● Offline",
        "lang": "Language",
        "en": "English",
        "he": "עברית",
        "es": "Español",
        "theme": "Theme",
        "dark": "Dark",
        "light": "Light",
        "instructions_title": "Quick Start Guide:",
        "instruction_1": "1. Copy your HWID number using the button above",
        "instruction_2": "2. Click 'Register License Online' to open the registration page",
        "instruction_3": "3. Paste your HWID in the registration form",
        "instruction_4": "4. Complete the form with your order information",
        "note": "Note: Your HWID is unique to this computer and required for license activation.",
    },
    "ES": {
        "title": "Herramienta de Licencia HWID AInside",
        "subtitle": "Tu ID de Hardware (HWID)",
        "hwid_label": "Tu Número HWID:",
        "copy": "Copiar HWID",
        "copied": "✓ ¡Copiado!",
        "register": "Registrar Licencia Online",
        "register_hint": "Abre la página de registro web con tu HWID pre-copiado",
        "help": "Contactar Soporte",
        "footer": "Software licenciado por AInside.me",
        "status": "Estado de la Plataforma",
        "connected": "● En línea",
        "disconnected": "● Fuera de línea",
        "lang": "Idioma",
        "en": "English",
        "he": "עברית",
        "es": "Español",
        "theme": "Tema",
        "dark": "Oscuro",
        "light": "Claro",
        "instructions_title": "Guía Rápida:",
        "instruction_1": "1. Copia tu número HWID usando el botón de arriba",
        "instruction_2": "2. Haz clic en 'Registrar Licencia Online' para abrir la página de registro",
        "instruction_3": "3. Pega tu HWID en el formulario de registro",
        "instruction_4": "4. Completa el formulario con tu información de orden",
        "note": "Nota: Tu HWID es único para esta computadora y es requerido para la activación de licencia.",
    },
    "HE": {
        "title": "כלי רישוי HWID של AInside",
        "subtitle": "מזהה החומרה שלך (HWID)",
        "hwid_label": "מספר ה-HWID שלך:",
        "copy": "העתק HWID",
        "copied": "✓ הועתק!",
        "register": "רישום רישיון באינטרנט",
        "register_hint": "פותח את דף הרישום עם ה-HWID שלך מועתק מראש",
        "help": "צור קשר עם תמיכה",
        "footer": "תוכנה מורשית ע״י AInside.me",
        "status": "סטטוס הפלטפורמה",
        "connected": "● מחובר",
        "disconnected": "● מנותק",
        "lang": "שפה",
        "en": "English",
        "he": "עברית",
        "es": "Español",
        "theme": "ערכת נושא",
        "dark": "כהה",
        "light": "בהירה",
        "instructions_title": "מדריך מהיר:",
        "instruction_1": "1. העתק את מספר ה-HWID שלך באמצעות הכפתור למעלה",
        "instruction_2": "2. לחץ על 'רישום רישיון באינטרנט' לפתיחת דף הרישום",
        "instruction_3": "3. הדבק את ה-HWID שלך בטופס הרישום",
        "instruction_4": "4. השלם את הטופס עם מידע ההזמנה שלך",
        "note": "הערה: ה-HWID שלך ייחודי למחשב זה ונדרש להפעלת הרישיון.",
    }
}

def tr(key: str) -> str:
    return TEXTS.get(LANG, TEXTS["EN"]).get(key, key)

def apply_theme(style: Style, theme_key: str, ui_frames):
    theme_map = {"Dark": "superhero", "Light": "flatly"}
    style.theme_use(theme_map.get(theme_key, "superhero"))
    new_bg = style.colors.bg
    for fr in ui_frames:
        try:
            fr.configure(bg=new_bg)
        except Exception:
            pass

def update_theme_assets(theme_key: str, ui, style: Style):
    """Swap logo and adjust text styles for contrast according to theme."""
    is_dark = (theme_key == "Dark")
    # Update container/label backgrounds that are tk widgets
    try:
        bg = style.colors.bg
        ui.get("logo_label").configure(bg=bg)
    except Exception:
        pass

    # Choose appropriate logo (or recolor fallback for Light theme)
    img = generate_theme_logo(theme_key, max_width=300)

    # If no image available, show text fallback; otherwise set and persist image ref
    if img is None:
        try:
            ui["logo_label"].configure(image="", text="AInside", fg=style.colors.fg, font=("Segoe UI", 20, "bold"))
            ui["logo_img"] = None
            if hasattr(ui["logo_label"], "_img_ref"):
                delattr(ui["logo_label"], "_img_ref")
        except Exception:
            pass
    else:
        try:
            ui["logo_img"] = img
            ui["logo_label"].configure(image=img, text="")
            ui["logo_label"]._img_ref = img  # keep reference on widget to avoid GC
        except Exception:
            pass

    # Title: use inverse only on dark theme; default on light for dark text
    try:
        ui["title_label"].configure(bootstyle=("inverse" if is_dark else "default"))
    except Exception:
        pass

def set_lang(new_lang: str, ui):
    global LANG
    LANG = "HE" if new_lang.upper().startswith("HE") else "EN"
    ui["title_label"].configure(text=tr("title"))
    ui["subtitle_label"].configure(text=tr("subtitle"))
    ui["copy_btn"].configure(text=tr("copy"))
    ui["register_btn"].configure(text=tr("register"))
    ui["help_btn"].configure(text=tr("help"))
    ui["footer_label"].configure(text=tr("footer"))
    ui["status_text"].configure(text=f'{tr("status")}:')
    ui["lang_label"].configure(text=f'{tr("lang")}:')
    ui["theme_label"].configure(text=f'{tr("theme")}:')
    rtl = LANG == "HE"
    justify = "right" if rtl else "center"
    ui["hwid_entry"].configure(justify=justify)

# --------- Auth storage & API helpers ---------
def auth_load():
    try:
        with open(AUTH_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None

def auth_save(data: dict):
    try:
        with open(AUTH_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f)
        return True
    except Exception:
        return False

def auth_unlink():
    try:
        if os.path.exists(AUTH_FILE):
            os.remove(AUTH_FILE)
    except Exception:
        pass

def http_request(method: str, url: str, headers=None, payload=None, timeout=6.0):
    headers = headers or {}
    if HAS_REQUESTS:
        resp = requests.request(method, url, json=payload, headers=headers, timeout=timeout)
        try:
            data = resp.json()
        except Exception:
            data = {"status": resp.status_code, "text": resp.text}
        return resp.status_code, data
    else:
        try:
            body = json.dumps(payload).encode("utf-8") if payload is not None else None
            req = UrlRequest(url, method=method, headers={"Content-Type": "application/json", **headers}, data=body)
            with urlopen(req, timeout=timeout) as resp:
                txt = resp.read().decode("utf-8", errors="ignore")
                try:
                    return resp.status, json.loads(txt)
                except Exception:
                    return resp.status, {"text": txt}
        except Exception as e:
            return 0, {"error": str(e)}

def base64_urlsafe_random(nbytes: int) -> str:
    try:
        import secrets
        return secrets.token_urlsafe(nbytes)
    except Exception:
        return str(uuid.uuid4()).replace("-", "")

def _auth_get_device_secret() -> str:
    info = auth_load() or {}
    return (info.get("deviceSecret") or "").strip()

def _auth_set_device_secret(device_secret: str):
    info = auth_load() or {}
    info["deviceSecret"] = device_secret
    auth_save(info)

def activate_device(order_id: str, email: str, hwid: str) -> dict:
    payload = {"orderId": order_id, "email": email, "hwid": hwid}
    status, data = http_request("POST", LICENSE_ACTIVATE_URL, payload=payload, timeout=10.0)
    if status not in (200, 201):
        raise RuntimeError((data or {}).get("error") or f"Activation failed ({status})")
    if isinstance(data, dict) and data.get("deviceSecret"):
        _auth_set_device_secret(str(data.get("deviceSecret")))
    return data

def license_check(hwid: str, device_secret: str) -> dict:
    payload = {"hwid": hwid, "deviceSecret": device_secret, "nonce": base64_urlsafe_random(12)}
    status, data = http_request("POST", LICENSE_CHECK_URL, payload=payload, timeout=8.0)
    if status != 200:
        raise RuntimeError((data or {}).get("error") or (data or {}).get("reason") or f"license-check failed ({status})")
    return data


# --------- Local License Service (for TradeStation DLL/strategy) ---------
class _LicenseState:
    def __init__(self):
        self.lock = threading.Lock()
        self.allowed = False
        self.reason = "not_checked"
        self.last_check_ts = 0
        self.hwid = ""
        self.payload = None
        self.signature = None
        self.alg = None

LICENSE_STATE = _LicenseState()

def _json_response(handler: BaseHTTPRequestHandler, status: int, obj: dict):
    raw = json.dumps(obj).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(raw)))
    handler.end_headers()
    handler.wfile.write(raw)

class LocalLicenseHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def do_GET(self):
        if self.path.startswith("/health"):
            return _json_response(self, 200, {"ok": True})

        if self.path.startswith("/hwid"):
            with LICENSE_STATE.lock:
                return _json_response(self, 200, {"hwid": LICENSE_STATE.hwid})

        if self.path.startswith("/status"):
            with LICENSE_STATE.lock:
                return _json_response(
                    self,
                    200,
                    {
                        "allowed": LICENSE_STATE.allowed,
                        "reason": LICENSE_STATE.reason,
                        "hwid": LICENSE_STATE.hwid,
                        "lastCheckTs": LICENSE_STATE.last_check_ts,
                        "license": {
                            "payload": LICENSE_STATE.payload,
                            "signature": LICENSE_STATE.signature,
                            "alg": LICENSE_STATE.alg,
                        },
                    },
                )

        return _json_response(self, 404, {"error": "not_found"})


def start_local_license_service(hwid: str, host: str = "127.0.0.1", port: int = 8787) -> int:
    with LICENSE_STATE.lock:
        LICENSE_STATE.hwid = hwid
        LICENSE_STATE.allowed = False
        LICENSE_STATE.reason = "starting"
        LICENSE_STATE.last_check_ts = int(time.time())

    def poll_loop():
        while True:
            try:
                device_secret = _auth_get_device_secret()
                if not device_secret:
                    with LICENSE_STATE.lock:
                        LICENSE_STATE.allowed = False
                        LICENSE_STATE.reason = "not_activated"
                        LICENSE_STATE.payload = None
                        LICENSE_STATE.signature = None
                        LICENSE_STATE.alg = None
                        LICENSE_STATE.last_check_ts = int(time.time())
                    time.sleep(3)
                    continue

                data = license_check(hwid, device_secret)
                payload = data.get("payload") if isinstance(data, dict) else None
                signature = data.get("signature") if isinstance(data, dict) else None
                alg = data.get("alg") if isinstance(data, dict) else None

                allowed = bool(payload and payload.get("allowed"))
                reason = (payload or {}).get("reason") or "unknown"

                with LICENSE_STATE.lock:
                    LICENSE_STATE.allowed = allowed
                    LICENSE_STATE.reason = reason
                    LICENSE_STATE.payload = payload
                    LICENSE_STATE.signature = signature
                    LICENSE_STATE.alg = alg
                    LICENSE_STATE.last_check_ts = int(time.time())
            except Exception as e:
                with LICENSE_STATE.lock:
                    LICENSE_STATE.allowed = False
                    LICENSE_STATE.reason = f"error:{e}"
                    LICENSE_STATE.payload = None
                    LICENSE_STATE.signature = None
                    LICENSE_STATE.alg = None
                    LICENSE_STATE.last_check_ts = int(time.time())

            time.sleep(25)

    threading.Thread(target=poll_loop, daemon=True).start()

    httpd = ThreadingHTTPServer((host, port), LocalLicenseHandler)
    print(f"[AInside] Local License Service running at http://{host}:{port} (/status, /health)", flush=True)
    httpd.serve_forever()
    return 0

def api_link_account(email: str, code: str, hwid: str):
    """POST to link account and retrieve token/plan. Adjust endpoint to your backend."""
    url = f"{API_BASE}/v1/link"
    status, data = http_request("POST", url, payload={"email": email, "code": code, "hwid": hwid})
    if status == 200 and isinstance(data, dict):
        return data  # expected fields: { token, user: {email,...}, plan: {...} }
    raise RuntimeError(f"Link failed ({status}): {data}")

def api_whoami(token: str):
    url = f"{API_BASE}/v1/me"
    status, data = http_request("GET", url, headers={"Authorization": f"Bearer {token}"})
    if status == 200 and isinstance(data, dict):
        return data
    raise RuntimeError(f"Auth check failed ({status}): {data}")

def api_get_plan(token: str):
    url = f"{API_BASE}/v1/plan"
    status, data = http_request("GET", url, headers={"Authorization": f"Bearer {token}"})
    if status == 200 and isinstance(data, dict):
        return data
    raise RuntimeError(f"Plan fetch failed ({status}): {data}")

def send_heartbeat(hwid: str, plan_name: str = "Basic", strategies: list = None):
    """Send heartbeat to server to report online status and get updated configuration"""
    try:
        if strategies is None:
            strategies = []
        
        payload = {
            "hwid": hwid,
            "plan_name": plan_name,
            "strategies_active": strategies,
        }
        
        status, data = http_request("POST", HEARTBEAT_URL, payload=payload, timeout=3.0)
        
        if status in (200, 201):
            # Server returns updated configuration
            return data
        else:
            return None
    except Exception as e:
        print(f"Heartbeat error: {e}")
        return None

# --------- Status light ---------
class StatusLight(tk.Canvas):
    def __init__(self, master, size=12, **kwargs):
        super().__init__(master, width=size, height=size, highlightthickness=0, **kwargs)
        self.size = size
        self._oval = self.create_oval(1, 1, size-1, size-1, fill="#cc3333", outline="")
    def set_state(self, ok: bool):
        self.itemconfig(self._oval, fill=("#21c55d" if ok else "#cc3333"))  # green / red

def start_status_poll(light: StatusLight, status_label: Label, interval_ms=3500):
    cfg = load_probe_config()
    def poll():
        ok = platform_is_online(cfg)
        light.set_state(ok)
        status_label.configure(text=(tr("connected") if ok else tr("disconnected")))
        light.after(interval_ms, poll)
    poll()

# --------- Dynamic sizing helper ---------
def fit_to_content(root: tk.Tk, padding_w=40, padding_h=40, min_w=680, min_h=560):
    """
    Ensures the window is at least as big as the required width/height of contents,
    plus padding. This prevents buttons from clipping on high DPI or different themes.
    """
    root.update_idletasks()
    req_w = root.winfo_reqwidth() + padding_w
    req_h = root.winfo_reqheight() + padding_h
    final_w = max(req_w, min_w)
    final_h = max(req_h, min_h)
    # center
    sw, sh = root.winfo_screenwidth(), root.winfo_screenheight()
    x = int((sw - final_w) / 2)
    y = int((sh - final_h) / 2.6)
    root.geometry(f"{final_w}x{final_h}+{x}+{y}")
    root.minsize(final_w, final_h)

# --------- Main UI ---------
def main():
    global LANG
    if "--service" in sys.argv:
        hwid = get_hwid()
        save_hwid(hwid)
        return start_local_license_service(hwid)

    if "--activate" in sys.argv:
        hwid = get_hwid()
        save_hwid(hwid)
        # Very simple arg parsing (no extra deps)
        order_id = ""
        email = ""
        for arg in sys.argv[1:]:
            if arg.startswith("--order="):
                order_id = arg.split("=", 1)[1].strip()
            if arg.startswith("--email="):
                email = arg.split("=", 1)[1].strip()
        if not order_id:
            order_id = input("Order ID: ").strip()
        if not email:
            email = input("Email (must match purchase): ").strip().lower()
        if not order_id or not email:
            print("Missing Order ID or Email", flush=True)
            return 1
        try:
            data = activate_device(order_id, email, hwid)
            if data.get("alreadyActivated"):
                print("Device already activated. If you lost the secret, contact support.", flush=True)
            else:
                print("Activated OK.", flush=True)
            return 0
        except Exception as e:
            print(f"Activation failed: {e}", flush=True)
            return 1

    if ("--cli" in sys.argv) or (not HAS_TTKBOOTSTRAP):
        if not HAS_TTKBOOTSTRAP and "--cli" not in sys.argv:
            print("[INFO] ttkbootstrap is not installed. Running in CLI mode.")
            print("[INFO] Install GUI dependencies with: pip install ttkbootstrap")
        return cli_main()

    hwid = get_hwid()
    save_hwid(hwid)

    # Theme & root
    style = Style(theme="superhero")  # start dark
    root = style.master
    root.title(APP_NAME)
    set_dpi_awareness(root)
    set_window_icon(root)

    # Containers (tk Frames to control bg precisely)
    bg = style.colors.bg
    container = tk.Frame(root, bg=bg)
    container.pack(fill="both", expand=True, padx=22, pady=16)

    # --- Top bar: language, theme, status ---
    topbar = tk.Frame(container, bg=bg)
    topbar.pack(fill="x")

    # Language switch (left)
    lang_frame = tk.Frame(topbar, bg=bg)
    lang_frame.pack(side="left", pady=6)
    lang_label = Label(lang_frame, text=f'{tr("lang")}:', bootstyle="secondary")
    lang_label.pack(side="left", padx=(0,6))

    lang_en = Button(lang_frame, text=TEXTS["EN"]["en"], bootstyle="secondary-outline", width=10)
    lang_he = Button(lang_frame, text=TEXTS["HE"]["he"], bootstyle="secondary-outline", width=10)
    lang_en.pack(side="left", padx=3)
    lang_he.pack(side="left", padx=3)

    # Theme switch (center)
    theme_frame = tk.Frame(topbar, bg=bg)
    theme_frame.pack(side="left", padx=20, pady=6)
    theme_label = Label(theme_frame, text=f'{tr("theme")}:', bootstyle="secondary")
    theme_label.pack(side="left", padx=(0,6))

    theme_combo = Combobox(theme_frame, values=[TEXTS["EN"]["dark"], TEXTS["EN"]["light"]], width=10)
    theme_combo.set(TEXTS["EN"]["dark"])  # default Dark
    theme_combo.pack(side="left")

    # Account (right-middle)
    account_frame = tk.Frame(topbar, bg=bg)
    account_frame.pack(side="right", padx=(10,0), pady=6)
    account_label = Label(account_frame, text="Account:", bootstyle="secondary")
    account_label.pack(side="left", padx=(0,6))
    account_btn = Button(account_frame, text="Link account", width=14, bootstyle="secondary-outline")
    account_btn.pack(side="left")

    # Status (right)
    status_frame = tk.Frame(topbar, bg=bg)
    status_frame.pack(side="right", pady=6)
    status_text = Label(status_frame, text=f'{tr("status")}:', bootstyle="secondary")
    status_text.pack(side="left", padx=(0,6))
    light = StatusLight(status_frame, size=12, bg=bg)
    light.pack(side="left", padx=(0,6))
    status_value = Label(status_frame, text=tr("disconnected"), bootstyle="secondary")
    status_value.pack(side="left")

    # --- Header with logo ---
    header = tk.Frame(container, bg=bg)
    header.pack(pady=(8, 10))
    # Logo label placeholder; we'll swap the image based on theme
    logo_img = load_logo(max_width=300)  # white logo for dark theme by default
    logo_label = tk.Label(header, bg=bg)
    if logo_img:
        logo_label.configure(image=logo_img)
    else:
        logo_label.configure(text="AInside", font=("Segoe UI", 20, "bold"))
    logo_label.pack()

    # Title / subtitle
    title_label = Label(container, text=tr("title"), font=("Segoe UI", 18, "bold"), bootstyle="inverse")
    title_label.pack(pady=(2, 2))
    subtitle_label = Label(container, text=tr("subtitle"), font=("Segoe UI", 12), bootstyle="secondary")
    subtitle_label.pack()

    # HWID label
    hwid_label_text = Label(container, text=tr("hwid_label"), font=("Segoe UI", 11, "bold"), bootstyle="info")
    hwid_label_text.pack(pady=(14, 6))

    # HWID entry with better styling
    entry_frame = tk.Frame(container, bg=bg)
    entry_frame.pack(pady=(0, 8))
    hwid_entry = Entry(entry_frame, font=("Consolas", 14, "bold"), justify="center", width=48, bootstyle="dark")
    hwid_entry.insert(0, hwid)
    hwid_entry.configure(state="readonly")
    hwid_entry.pack()

    # Instructions section
    instructions_frame = tk.Frame(container, bg=bg)
    instructions_frame.pack(pady=(16, 16), fill="x", padx=40)
    
    instructions_title = Label(instructions_frame, text=tr("instructions_title"), 
                               font=("Segoe UI", 11, "bold"), bootstyle="info")
    instructions_title.pack(anchor="w", pady=(0, 8))
    
    inst1 = Label(instructions_frame, text=tr("instruction_1"), font=("Segoe UI", 10), bootstyle="secondary")
    inst1.pack(anchor="w", pady=2)
    inst2 = Label(instructions_frame, text=tr("instruction_2"), font=("Segoe UI", 10), bootstyle="secondary")
    inst2.pack(anchor="w", pady=2)
    inst3 = Label(instructions_frame, text=tr("instruction_3"), font=("Segoe UI", 10), bootstyle="secondary")
    inst3.pack(anchor="w", pady=2)
    inst4 = Label(instructions_frame, text=tr("instruction_4"), font=("Segoe UI", 10), bootstyle="secondary")
    inst4.pack(anchor="w", pady=2)
    
    note_frame = tk.Frame(instructions_frame, bg=bg)
    note_frame.pack(fill="x", pady=(12, 0))
    note_label = Label(note_frame, text=tr("note"), font=("Segoe UI", 9, "italic"), 
                      bootstyle="warning", wraplength=500)
    note_label.pack(anchor="w")

    # Actions - with better spacing and sizing
    actions = tk.Frame(container, bg=bg)
    actions.pack(pady=(12, 8))
    copy_btn = Button(actions, text=tr("copy"), width=38, bootstyle="success", 
                     cursor="hand2")
    copy_btn.pack(pady=(0, 10))
    register_btn = Button(actions, text=tr("register"), width=38, bootstyle="info", 
                         cursor="hand2")
    register_btn.pack(pady=(0, 4))
    register_hint = Label(actions, text=tr("register_hint"), font=("Segoe UI", 8), bootstyle="secondary")
    register_hint.pack()

    # Links
    links = tk.Frame(container, bg=bg)
    links.pack(pady=(16, 0))
    help_btn = Button(links, text=tr("help"), bootstyle="link")
    help_btn.pack()

    # Footer
    footer_label = Label(container, text=tr("footer"), font=("Segoe UI", 9, "italic"), bootstyle="secondary")
    footer_label.pack(side="bottom", pady=12)

    # Collect UI refs for dynamic language updates
    ui = {
        "title_label": title_label,
        "subtitle_label": subtitle_label,
        "hwid_label_text": hwid_label_text,
        "instructions_title": instructions_title,
        "inst1": inst1,
        "inst2": inst2,
        "inst3": inst3,
        "inst4": inst4,
        "note_label": note_label,
        "copy_btn": copy_btn,
        "register_btn": register_btn,
        "register_hint": register_hint,
        "help_btn": help_btn,
        "footer_label": footer_label,
        "hwid_entry": hwid_entry,
        "status_text": status_text,
        "lang_label": lang_label,
        "theme_label": theme_label,
        "logo_label": logo_label,
        "logo_img": logo_img,
        "account_frame": account_frame,
        "account_label": account_label,
        "account_btn": account_btn,
    }

    # ---- Wire up button commands (ensuring they work) ----
    def on_copy():
        ok = copy_to_clipboard(root, hwid)
        copy_btn.config(text=(tr("copied") if ok else tr("copy")))
        root.after(1400, lambda: copy_btn.config(text=tr("copy")))
    copy_btn.config(command=on_copy)

    def on_register():
        webbrowser.open(REGISTER_URL, new=2, autoraise=True)
    register_btn.config(command=on_register)

    def on_help():
        webbrowser.open(SUPPORT_URL, new=2, autoraise=True)
    help_btn.config(command=on_help)

    def on_lang_en():
        set_lang("EN", ui)
        fit_to_content(root)  # re-fit after language changes
    def on_lang_he():
        set_lang("HE", ui)
        fit_to_content(root)
    lang_en.config(command=on_lang_en)
    lang_he.config(command=on_lang_he)

    def on_theme_change(event=None):
        choice = theme_combo.get()
        key = "Dark" if choice in (TEXTS["EN"]["dark"], TEXTS["HE"]["dark"]) else "Light"
        apply_theme(style, key, ui_frames=[container, topbar, lang_frame, theme_frame, status_frame, header, entry_frame, actions, links])
        update_theme_assets(key, ui, style)
        fit_to_content(root)  # re-fit after theme changes
    theme_combo.bind("<<ComboboxSelected>>", on_theme_change)

    # Ensure correct assets for initial theme
    update_theme_assets("Dark", ui, style)

    # ---- Account linking UI ----
    def refresh_account_ui():
        info = auth_load()
        if info and info.get("token"):
            email = (info.get("user", {}) or {}).get("email") or "linked"
            plan_name = (info.get("plan", {}) or {}).get("name")
            label_txt = f"{email}"
            if plan_name:
                label_txt += f"  ·  Plan: {plan_name}"
            account_label.configure(text=label_txt)
            account_btn.configure(text="Unlink", bootstyle="danger-outline")
        else:
            account_label.configure(text="Account:")
            account_btn.configure(text="Link account", bootstyle="secondary-outline")

    def do_link_dialog():
        dlg = tk.Toplevel(root)
        dlg.title("Link account")
        dlg.transient(root)
        dlg.resizable(False, False)
        try:
            dlg.grab_set()
        except Exception:
            pass
        pad = {"padx": 10, "pady": 6}
        frm = tk.Frame(dlg)
        frm.pack(fill="both", expand=True, **pad)
        tk.Label(frm, text="Email:").grid(row=0, column=0, sticky="e", **pad)
        email_var = tk.StringVar()
        tk.Entry(frm, textvariable=email_var, width=28).grid(row=0, column=1, **pad)
        tk.Label(frm, text="Code / License:").grid(row=1, column=0, sticky="e", **pad)
        code_var = tk.StringVar()
        tk.Entry(frm, textvariable=code_var, width=28, show="*").grid(row=1, column=1, **pad)
        def on_ok():
            email = email_var.get().strip()
            code = code_var.get().strip()
            if not email or not code:
                messagebox.showwarning("Link account", "Please enter email and code")
                return
            try:
                data = api_link_account(email, code, hwid)
                token = data.get("token")
                if not token:
                    raise RuntimeError("Missing token from server")
                auth_save(data)
                refresh_account_ui()
                dlg.destroy()
            except Exception as e:
                messagebox.showerror("Link failed", str(e))
        def on_cancel():
            dlg.destroy()
        btns = tk.Frame(frm)
        btns.grid(row=2, column=0, columnspan=2, pady=(10,6))
        Button(btns, text="Cancel", bootstyle="secondary", command=on_cancel, width=12).pack(side="left", padx=6)
        Button(btns, text="Link", bootstyle="primary", command=on_ok, width=12).pack(side="left", padx=6)
        dlg.wait_visibility()
        dlg.focus_set()
        dlg.wait_window()

    def on_account_btn():
        info = auth_load()
        if not info or not info.get("token"):
            do_link_dialog()
            return
        # When linked, verify against the web and show the actual user/plan
        account_label.configure(text="Account: checking…")
        root.update_idletasks()
        try:
            me = api_whoami(info.get("token"))
            plan = api_get_plan(info.get("token"))
            email = (me.get("user", me) or {}).get("email") or (info.get("user", {}) or {}).get("email") or "(unknown)"
            plan_name = (plan or {}).get("name") or (info.get("plan", {}) or {}).get("name") or "(no plan)"
            merged = {**(info or {}), "user": me.get("user", me), "plan": plan}
            auth_save(merged)
            refresh_account_ui()
            # Show info and give actions
            msg = f"Conectado como: {email}\nPlan: {plan_name}\n\n¿Abrir cuenta en la web?"
            if messagebox.askyesno("Cuenta vinculada", msg):
                webbrowser.open(ACCOUNT_URL, new=2, autoraise=True)
            # Offer unlink as a follow-up
            if messagebox.askyesno("Desvincular", "¿Deseas desvincular este equipo de la cuenta?"):
                auth_unlink()
                refresh_account_ui()
        except Exception as e:
            # If unauthorized or network issue, reflect it
            err = str(e)
            if "401" in err or "403" in err or "unauthoriz" in err.lower():
                messagebox.showwarning("Sesión inválida", "Tu sesión ya no es válida. Vuelve a vincular tu cuenta.")
                auth_unlink()
                refresh_account_ui()
            else:
                messagebox.showerror("Error de conexión", f"No se pudo verificar la cuenta ahora.\n{err}")
    account_btn.configure(command=on_account_btn)

    # Try to validate existing token and fetch plan (best-effort)
    def try_fetch_plan_async():
        info = auth_load()
        if not info or not info.get("token"):
            return
        token = info.get("token")
        try:
            me = api_whoami(token)
            plan = api_get_plan(token)
            merged = {**info, "user": me.get("user", me), "plan": plan}
            auth_save(merged)
        except Exception:
            # ignore network errors silently, keep cached info
            pass
        finally:
            refresh_account_ui()

    refresh_account_ui()
    # defer network call after UI shows up
    root.after(200, try_fetch_plan_async)

    # --- Heartbeat to server every 30 seconds ---
    def send_heartbeat_loop():
        try:
            info = auth_load()
            plan_name = "Basic"
            if info and info.get("plan"):
                plan_name = info.get("plan", {}).get("name", "Basic")
            
            # Send heartbeat
            config = send_heartbeat(hwid, plan_name, [])
            
            if config and config.get("config"):
                # Update UI with server configuration if needed
                server_config = config.get("config")
                # Could update strategies here based on server response
                print(f"Server config: {server_config}")
        except Exception as e:
            print(f"Heartbeat loop error: {e}")
        finally:
            # Schedule next heartbeat
            root.after(30000, send_heartbeat_loop)
    
    # Start heartbeat after 5 seconds
    root.after(5000, send_heartbeat_loop)

    # --- Final fit after all widgets exist ---
    fit_to_content(root, padding_w=48, padding_h=48, min_w=720, min_h=580)

    # Initial status polling
    start_status_poll(light, status_value, interval_ms=3200)

    root.mainloop()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
