#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if ! command -v gh >/dev/null 2>&1; then
  if [[ ! -x .tools/gh/bin/gh ]]; then
    echo 'Descargando GitHub CLI oficial para iniciar sesión…'
    python3 - <<'PY'
import json, platform, pathlib, tarfile, tempfile, urllib.request, shutil
arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}.get(platform.machine())
if platform.system() != 'Linux' or not arch:
    raise SystemExit('Instala GitHub CLI desde https://cli.github.com y vuelve a ejecutar este script.')
req = urllib.request.Request('https://api.github.com/repos/cli/cli/releases/latest', headers={'User-Agent': 'Wordstep-setup'})
with urllib.request.urlopen(req, timeout=30) as r:
    release = json.load(r)
asset = next(a for a in release['assets'] if a['name'].endswith(f'linux_{arch}.tar.gz'))
with tempfile.TemporaryDirectory() as temp:
    archive = pathlib.Path(temp) / 'gh.tar.gz'
    urllib.request.urlretrieve(asset['browser_download_url'], archive)
    with tarfile.open(archive) as tar:
        member = next(m for m in tar.getmembers() if m.name.endswith('/bin/gh') and m.isfile())
        dest = pathlib.Path('.tools/gh/bin/gh')
        dest.parent.mkdir(parents=True, exist_ok=True)
        with tar.extractfile(member) as source, dest.open('wb') as target:
            shutil.copyfileobj(source, target)
        dest.chmod(0o755)
PY
  fi
  export PATH="$PWD/.tools/gh/bin:$PATH"
fi
if ! gh auth status >/dev/null 2>&1; then
  gh auth login --hostname github.com --git-protocol https --web --scopes repo,workflow
fi
gh auth setup-git
WORDSTEP_OWNER="$(gh api user --jq .login)"
WORDSTEP_REPO="$WORDSTEP_OWNER/wordstep"
if [[ ! -d .git ]]; then git init -b main; fi
if ! git config user.name >/dev/null; then git config user.name "$WORDSTEP_OWNER"; fi
if ! git config user.email >/dev/null; then
  WORDSTEP_USER_ID="$(gh api user --jq .id)"
  git config user.email "$WORDSTEP_USER_ID+$WORDSTEP_OWNER@users.noreply.github.com"
fi
git add .gitignore README.md dist tests .github publish-github.sh
if ! git diff --cached --quiet; then git commit -m 'Build responsive B1+ English practice app'; fi
if ! gh repo view "$WORDSTEP_REPO" >/dev/null 2>&1; then
  gh repo create "$WORDSTEP_REPO" --public --description 'Práctica de inglés B1+: vocabulario, wish, condicionales y deducciones. Sin audios.'
fi
if git remote get-url github >/dev/null 2>&1; then
  WORDSTEP_REMOTE="$(git remote get-url github)"
  if [[ "$WORDSTEP_REMOTE" != "https://github.com/$WORDSTEP_REPO.git" ]]; then
    echo 'El remoto github apunta a otro repositorio. No se ha modificado.'
    exit 1
  fi
else
  git remote add github "https://github.com/$WORDSTEP_REPO.git"
fi
# Never force-push: existing remote work is preserved.
git push -u github HEAD:main
if ! gh api "repos/$WORDSTEP_REPO/pages" >/dev/null 2>&1; then
  gh api --method POST "repos/$WORDSTEP_REPO/pages" -f build_type=workflow >/dev/null
fi
gh workflow run pages.yml --repo "$WORDSTEP_REPO" --ref main
printf '\nRepositorio: https://github.com/%s\n' "$WORDSTEP_REPO"
printf 'GitHub Pages: https://%s.github.io/wordstep/\n' "$WORDSTEP_OWNER"
echo 'La página estará disponible cuando termine el flujo Publish Wordstep en la pestaña Actions.'
