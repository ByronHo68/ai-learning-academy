"""Install project-local lab dependencies. Does not require Docker or global Maven."""
import hashlib
import io
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import tarfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
AGENT = ROOT / "services/agent"
MAVEN_VERSION = "3.9.11"


def main():
    if sys.version_info < (3, 13):
        raise SystemExit("Python 3.13 or newer is required for this locked environment.")
    if not shutil.which("java") and not os.environ.get("JAVA_HOME"):
        raise SystemExit("Install Java 21 before running lab:setup.")
    venv = AGENT / ".venv"
    if not venv.exists():
        subprocess.run([sys.executable, "-m", "venv", str(venv)], check=True)
    subprocess.run([str(venv / "bin/python"), "-m", "pip", "install", "-r", str(AGENT / "requirements.lock")], check=True)
    tools = ROOT / ".tools"
    maven = tools / f"apache-maven-{MAVEN_VERSION}" / "bin/mvn"
    if not maven.exists():
        tools.mkdir(exist_ok=True)
        url = f"https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/{MAVEN_VERSION}/apache-maven-{MAVEN_VERSION}-bin.tar.gz"
        archive = urllib.request.urlopen(url, timeout=60).read()
        digest = urllib.request.urlopen(url + ".sha512", timeout=60).read().decode().split()[0]
        if hashlib.sha512(archive).hexdigest() != digest:
            raise SystemExit("Maven checksum mismatch.")
        with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as package:
            package.extractall(tools, filter="data")
    subprocess.run([str(maven), "-q", "package"], cwd=ROOT / "services/bank", check=True)
    config = ROOT / ".env.lab"
    if not config.exists():
        config.write_text("".join(f"{key}={secrets.token_hex(32)}\n" for key in
                                 ["LAB_AUTH_TOKEN", "BANK_API_TOKEN", "BANK_APPROVAL_SECRET"]) +
                          "LAB_LOCAL_MODE=true\nAGENT_API_URL=http://127.0.0.1:8001\n")
        config.chmod(0o600)
    print("Lab setup complete. Run npm run lab:start.")


if __name__ == "__main__":
    main()
