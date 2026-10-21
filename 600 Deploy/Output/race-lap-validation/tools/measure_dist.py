"""Resumo limitado de um `dist/`: tamanho bruto e gzip por arquivo, totais e verificação do limite de RNF02.

Uso (da raiz do repositório, depois de `npm run build`):
    python -I "600 Deploy/Output/race-lap-validation/tools/measure_dist.py" dist
    python -I "600 Deploy/Output/race-lap-validation/tools/measure_dist.py" dist 3145728

Imprime uma tabela Markdown e uma linha `files=... total_bytes=... gzip_bytes=... within_limit=...`.
Sai com 0 quando o total bruto cabe no limite e com 1 quando não cabe. Não lê nada fora da pasta dada.
"""
import gzip
import sys
from pathlib import Path

root = Path(sys.argv[1])
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 3 * 1024 * 1024
files = sorted(p for p in root.rglob("*") if p.is_file())
total = 0
gz_total = 0
print("| Arquivo | bytes | gzip bytes |")
print("|---|---:|---:|")
for p in files:
    b = p.read_bytes()
    g = len(gzip.compress(b, 9))
    total += len(b)
    gz_total += g
    print(f"| `{p.relative_to(root).as_posix()}` | {len(b)} | {g} |")
print(f"| **total** | **{total}** | **{gz_total}** |")
print()
within = total <= limit
print(f"files={len(files)} total_bytes={total} gzip_bytes={gz_total} limit_bytes={limit} "
      f"within_limit={within} ratio={total / limit:.3f}")
sys.exit(0 if within else 1)
