import re
import time
import subprocess
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any, Optional


def _detect_port(run_command: str) -> int:
    m = re.search(r'--port[=\s]+(\d+)', run_command)
    if m:
        return int(m.group(1))
    cmd = run_command.lower()
    if 'flask' in cmd or 'app.py' in cmd:
        return 5000
    if 'node' in cmd or 'npm' in cmd:
        return 3000
    if 'uvicorn' in cmd or 'fastapi' in cmd:
        return 8000
    return 8000


def _find_chromium_executable() -> Optional[str]:
    """
    Auto-discover the Playwright Chromium executable installed on this machine.
    Looks in the standard ms-playwright directory for the latest chromium-XXXX
    folder and returns the path to chrome.exe / chrome.
    Returns None if not found (playwright will fall back to its default).
    """
    import os
    import glob

    # Common Playwright browser cache locations
    candidates = [
        os.path.expandvars(r"%LOCALAPPDATA%\ms-playwright"),   # Windows
        os.path.expanduser("~/.cache/ms-playwright"),            # Linux
        os.path.expanduser("~/Library/Caches/ms-playwright"),   # macOS
    ]

    for base in candidates:
        if not os.path.isdir(base):
            continue
        # Find all chromium-XXXX folders (not headless-shell)
        pattern = os.path.join(base, "chromium-*")
        dirs = sorted(
            [d for d in glob.glob(pattern) if os.path.isdir(d) and "headless" not in d],
            reverse=True,  # latest version first
        )
        for d in dirs:
            for exe_name in ("chrome-win64/chrome.exe", "chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"):
                exe = os.path.join(d, exe_name)
                if os.path.isfile(exe):
                    return exe
    return None


def _wait_for_server(host: str, port: int, timeout: int = 30) -> bool:
    url = f'http://{host}:{port}/'
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=2)
            return True
        except urllib.error.HTTPError as e:
            # If we got an HTTP error, the server responded, so it is up
            return True
        except (urllib.error.URLError, OSError):
            time.sleep(0.5)
    return False


def browser_agent(
    project_root: str,
    run_command: str,
    host: str = '127.0.0.1',
) -> Dict[str, Any]:
    print(f'\n[6/6] Browser Agent testing the generated app...')
    root = Path(project_root)
    port = _detect_port(run_command)
    url = f'http://{host}:{port}/'
    print(f'     App URL      : {url}')
    print(f'     Run command  : {run_command}')

    try:
        app_process = subprocess.Popen(
            run_command,
            cwd=str(root),
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    except Exception as exc:
        print(f'     ERROR: Could not start the app: {exc}')
        return {
            'success': False,
            'url': url,
            'page_title': '',
            'status_code': None,
            'errors': [str(exc)],
            'screenshot_path': None,
        }

    print('     Waiting for server to be ready...', end=' ', flush=True)
    ready = _wait_for_server(host, port, timeout=30)
    if not ready:
        app_process.kill()
        print('TIMEOUT')
        return {
            'success': False,
            'url': url,
            'page_title': '',
            'status_code': None,
            'errors': ['Server did not start within 30 seconds.'],
            'screenshot_path': None,
        }
    print('READY')

    screenshot_path = str(root / 'browser_test_screenshot.png')
    errors = []
    page_title = ''
    status_code = None

    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as pw:
            # Use the full Chromium executable directly to avoid
            # dependency on chromium-headless-shell (which may not be installed)
            chromium_exe = _find_chromium_executable()
            launch_kwargs = dict(headless=True)
            if chromium_exe:
                launch_kwargs['executable_path'] = chromium_exe
            browser = pw.chromium.launch(**launch_kwargs)
            context = browser.new_context()
            page = context.new_page()

            try:
                response = page.goto(url, wait_until='networkidle', timeout=15000)
                status_code = response.status if response else None
                if status_code and status_code >= 500:
                    errors.append(f'HTTP {status_code} returned by the server.')
            except Exception as nav_exc:
                errors.append(f'Navigation failed: {nav_exc}')

            page.wait_for_timeout(2000)

            page_title = page.title()
            if not page_title.strip():
                errors.append('Page title is empty - the page may not have loaded correctly.')
            else:
                print(f'     Page title   : {page_title}')

            try:
                body_text = page.locator('body').inner_text(timeout=5000)
                if len(body_text.strip()) < 5:
                    errors.append('Page body appears empty - the app may have crashed.')
            except Exception:
                errors.append('Could not read page body content.')

            page.screenshot(path=screenshot_path, full_page=True)
            print(f'     Screenshot   : {screenshot_path}')

            context.close()
            browser.close()

    except ImportError:
        errors.append('Playwright not installed. Run: pip install playwright && playwright install')
    except Exception as exc:
        errors.append(f'Playwright error: {exc}')
    finally:
        app_process.kill()
        try:
            app_process.wait(timeout=5)
        except Exception:
            pass

    success = len(errors) == 0
    if success:
        print('     All smoke tests passed!')
    else:
        print(f'     {len(errors)} smoke test(s) failed:')
        for err in errors:
            print(f'       - {err}')

    return {
        'success': success,
        'url': url,
        'page_title': page_title,
        'status_code': status_code,
        'errors': errors,
        'screenshot_path': screenshot_path if Path(screenshot_path).exists() else None,
    }


def browser_agent_node(state: dict) -> dict:
    result = browser_agent(
        project_root=state['project_root'],
        run_command=state['manifest'].run_command,
    )
    return {'browser_result': result}
