"""
Assembla il documento UX rethink dal JSON di output del workflow.
Legge il file output del task, estrae le sezioni, scrive Markdown navigabile.
"""
import json
from pathlib import Path

OUTPUT_FILE = r"C:\Users\emanu\AppData\Local\Temp\claude\c--Users-emanu-Desktop-claude-project\36bbbcdb-0721-4aac-aec6-21055b31f0ed\tasks\wib7p4ib1.output"
DOCS_DIR = Path(r"c:\Users\emanu\Desktop\claude project\mercati-v2\docs\rethink-ux")
DOCS_DIR.mkdir(parents=True, exist_ok=True)

# Read raw output (it's the full JSON, not truncated)
with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
    raw = f.read()

# The output wraps the return value under "result"
outer = json.loads(raw)
data = outer.get("result") or outer

discovery = data["discovery"]
proposals = data["proposalsWithVerdicts"]
synthesis = data["synthesis"]
plan = data["implementationPlan"]

# Save raw JSON for posterity
(DOCS_DIR / "_raw.json").write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Raw JSON: {(DOCS_DIR / '_raw.json').stat().st_size // 1024} KB")

# ---------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------
def md(s):
    """Inline escape for table cells / simple text."""
    if s is None:
        return ""
    return str(s).replace("|", "\\|").replace("\n", " ")

def header(s, level=1):
    return f"{'#' * level} {s}\n\n"

def code_block(s, lang=""):
    return f"```{lang}\n{s}\n```\n\n"

def linkify_path(p):
    """If path looks like a file path inside the repo, make it clickable."""
    if not p or not isinstance(p, str):
        return p
    p_norm = p.replace("\\\\", "/").replace("\\", "/")
    if "mercati-v2/" in p_norm:
        # produce link relative to docs/rethink-ux/
        idx = p_norm.find("mercati-v2/")
        rel = p_norm[idx + len("mercati-v2/"):]
        return f"[`{rel}`](../../{rel})"
    return f"`{p}`"

# ---------------------------------------------------------------
# 00 — README / index
# ---------------------------------------------------------------
def write_index():
    parts = [
        header("UX Rethink — IMercati", 1),
        f"> Documento generato il **2026-05-14** da workflow multi-agente (28 agenti, 1.2M token, 18 min). ",
        f"> 4 lenti di design valutate, ciascuna verificata adversarialmente su admin/semplicita/brand, poi sintetizzate in una direzione unica.\n\n",
        header("Cosa trovi qui", 2),
        "| # | File | Cosa contiene |\n",
        "|---|------|---------------|\n",
        "| 01 | [Discovery — stato attuale](01-discovery.md) | Audit di route, componenti, API, admin, brand, pain point, user journeys |\n",
        "| 02 | [4 proposte di design](02-proposte.md) | Editorial, Utility, Story-first, Civic — con verifiche adversariali |\n",
        "| 03 | [Sintesi — la direzione scelta](03-sintesi.md) | La singola direzione UX risultante, con rationale |\n",
        "| 04 | [Piano di implementazione](04-piano.md) | File da cancellare, unire, creare. Nuova struttura. Fasi di migrazione |\n",
        "\n",
        header("Come leggere il doc", 2),
        "**Se hai 5 minuti**: leggi `03-sintesi.md` (la direzione) + intro di `04-piano.md` (le fasi).\n\n",
        "**Se hai 30 minuti**: leggi tutto in ordine. Le proposte (02) sono la cosa più stimolante: vedi 4 visioni alternative argomentate, capisci perché la sintesi ha scelto cosa.\n\n",
        "**Se vuoi solo decidere e partire**: il piano (04) ha già file da cancellare con riscaltura, file da unire con step, e fasi di rollout con stime ore.\n\n",
        header("Direzione scelta", 2),
        f"**{synthesis.get('name', '?')}**\n\n",
        f"*{synthesis.get('oneSentence', '')}*\n\n",
        header("Stato grezzo", 2),
        "Il JSON sorgente completo del workflow è in `_raw.json` (350KB).\n",
    ]
    (DOCS_DIR / "00-README.md").write_text("".join(parts), encoding="utf-8")

# ---------------------------------------------------------------
# 01 — Discovery
# ---------------------------------------------------------------
def write_discovery():
    out = []
    out.append(header("01 · Discovery — stato attuale", 1))
    out.append("Output dei 7 agenti che hanno mappato il codice in parallelo. Numeri concreti per dare la base alla discussione di design.\n\n")
    out.append("---\n\n")

    # PAGES
    pm = discovery.get("pagesMap", {}) or {}
    routes = pm.get("routes", [])
    out.append(header(f"Route pubbliche · {len(routes)} totali", 2))
    out.append(f"{pm.get('summary', '')}\n\n")
    if pm.get("redundantPaths"):
        out.append("**Route ridondanti rilevate:**\n\n")
        for r in pm["redundantPaths"]:
            out.append(f"- {r}\n")
        out.append("\n")

    out.append("| Path | Purpose | Complessità | Visibile | Issues |\n")
    out.append("|------|---------|-------------|----------|--------|\n")
    for r in routes:
        issues = "; ".join(r.get("issues", []))[:200] if r.get("issues") else "—"
        out.append(f"| `{md(r.get('path'))}` | {md(r.get('purpose'))} | {md(r.get('complexity'))} | {'✓' if r.get('userVisible') else '✗'} | {md(issues)} |\n")
    out.append("\n---\n\n")

    # COMPONENTS
    cm = discovery.get("componentsMap", {}) or {}
    comps = cm.get("components", [])
    out.append(header(f"Componenti · {len(comps)} totali", 2))
    out.append(f"{cm.get('summary', '')}\n\n")
    if cm.get("duplicates"):
        out.append("**Duplicati / sovrapposizioni:**\n\n")
        for d in cm["duplicates"]:
            out.append(f"- {d}\n")
        out.append("\n")

    out.append("<details><summary><b>Lista completa componenti</b></summary>\n\n")
    out.append("| Nome | Scopo | Used by | Complessità | Duplicato di |\n")
    out.append("|------|-------|---------|-------------|--------------|\n")
    for c in comps:
        used = ", ".join((c.get("usedBy") or [])[:3])
        if c.get("usedBy") and len(c.get("usedBy")) > 3:
            used += f" (+{len(c['usedBy']) - 3})"
        out.append(f"| `{md(c.get('name'))}` | {md(c.get('purpose'))} | {md(used)} | {md(c.get('complexity'))} | {md(c.get('duplicatesOf') or '—')} |\n")
    out.append("\n</details>\n\n---\n\n")

    # APIS
    am = discovery.get("apisMap", {}) or {}
    endpoints = am.get("endpoints", [])
    out.append(header(f"API · {len(endpoints)} endpoint", 2))
    out.append(f"{am.get('summary', '')}\n\n")
    if am.get("unused"):
        out.append("**Endpoint apparentemente non usati:**\n\n")
        for u in am["unused"]:
            out.append(f"- `{u}`\n")
        out.append("\n")

    out.append("<details><summary><b>Lista completa API</b></summary>\n\n")
    out.append("| Path | Metodi | Scopo | Admin only | Chiamato da |\n")
    out.append("|------|--------|-------|------------|-------------|\n")
    for e in endpoints:
        methods = ", ".join(e.get("methods", []))
        out.append(f"| `{md(e.get('path'))}` | {md(methods)} | {md(e.get('purpose'))} | {'✓' if e.get('adminOnly') else '—'} | {md(e.get('publicConsumer') or '—')} |\n")
    out.append("\n</details>\n\n---\n\n")

    # ADMIN
    adm = discovery.get("adminMap", {}) or {}
    features = adm.get("features", [])
    must = adm.get("mustPreserve", [])
    out.append(header("Superficie admin — da preservare", 2))
    out.append(f"{adm.get('summary', '')}\n\n")
    out.append(f"**MUST preserve ({len(must)} feature critiche):**\n\n")
    for m in must:
        out.append(f"- {m}\n")
    out.append("\n")
    out.append("| Feature | Entry path | Importanza | Descrizione |\n")
    out.append("|---------|------------|------------|-------------|\n")
    for f in features:
        out.append(f"| {md(f.get('name'))} | `{md(f.get('entryPath'))}` | {md(f.get('importance'))} | {md(f.get('description'))} |\n")
    out.append("\n---\n\n")

    # BRAND
    ba = discovery.get("brandAudit", {}) or {}
    out.append(header(f"Brand audit · coerenza {ba.get('coherenceScore', '?')}/10", 2))
    out.append(f"{ba.get('summary', '')}\n\n")

    if ba.get("palette"):
        out.append("**Palette**\n\n")
        out.append("```json\n")
        out.append(json.dumps(ba["palette"], indent=2, ensure_ascii=False))
        out.append("\n```\n\n")

    if ba.get("typography"):
        out.append("**Tipografia**\n\n")
        out.append("```json\n")
        out.append(json.dumps(ba["typography"], indent=2, ensure_ascii=False))
        out.append("\n```\n\n")

    if ba.get("voice"):
        voice = ba["voice"]
        out.append("**Voce**\n\n")
        out.append(f"- Tono: *{voice.get('tone', '')}*\n")
        out.append(f"- Registro: *{voice.get('register', '')}*\n\n")
        if voice.get("examples"):
            out.append("Esempi di copy che funziona:\n\n")
            for ex in voice["examples"][:8]:
                out.append(f"> {ex}\n>\n")
            out.append("\n")
        if voice.get("inconsistencies"):
            out.append("**Incoerenze:**\n\n")
            for inc in voice["inconsistencies"]:
                out.append(f"- {inc}\n")
            out.append("\n")

    if ba.get("illustrations"):
        out.append("**Illustrazioni**\n\n")
        for ill in ba["illustrations"]:
            if isinstance(ill, dict):
                name = ill.get("name", ill.get("component", "?"))
                desc = ill.get("description", ill.get("purpose", ""))
                out.append(f"- **{name}**: {desc}\n")
            else:
                out.append(f"- {ill}\n")
        out.append("\n")

    if ba.get("weakSpots"):
        out.append("**Punti deboli del brand:**\n\n")
        for ws in ba["weakSpots"]:
            out.append(f"- {ws}\n")
        out.append("\n")
    out.append("---\n\n")

    # PAIN POINTS
    pp = discovery.get("painPoints", {}) or {}
    points = pp.get("painPoints", [])
    out.append(header(f"Pain point UX · {len(points)} identificati", 2))
    out.append(f"{pp.get('summary', '')}\n\n")

    high = [p for p in points if p.get("severity") == "high"]
    med = [p for p in points if p.get("severity") == "medium"]
    low = [p for p in points if p.get("severity") == "low"]

    for label, items in [("Alta gravità", high), ("Media gravità", med), ("Bassa gravità", low)]:
        if not items:
            continue
        out.append(header(label, 3))
        for p in items:
            out.append(f"**{p.get('title')}**\n\n")
            out.append(f"- Dove: `{p.get('location', '?')}`\n")
            out.append(f"- {p.get('description', '')}\n")
            if p.get("impactedJourneys"):
                out.append(f"- Impatta: {', '.join(p['impactedJourneys'])}\n")
            out.append("\n")
    out.append("---\n\n")

    # JOURNEYS
    jm = discovery.get("journeys", {}) or {}
    journeys = jm.get("journeys", [])
    out.append(header(f"User journeys · {len(journeys)} personas", 2))
    for j in journeys:
        out.append(header(f"{j.get('persona', '?').capitalize()} — *{j.get('goal', '?')}*", 3))
        out.append("**Step attuali:**\n\n")
        for i, step in enumerate(j.get("currentSteps", []), 1):
            out.append(f"{i}. {step}\n")
        out.append("\n**Punti di frizione:**\n\n")
        for fp in j.get("frictionPoints", []):
            out.append(f"- {fp}\n")
        out.append("\n**Step ideali (target):**\n\n")
        for i, step in enumerate(j.get("idealSteps", []), 1):
            out.append(f"{i}. {step}\n")
        out.append("\n")

    (DOCS_DIR / "01-discovery.md").write_text("".join(out), encoding="utf-8")

# ---------------------------------------------------------------
# 02 — Proposte
# ---------------------------------------------------------------
def write_proposals():
    out = []
    out.append(header("02 · Quattro proposte di design", 1))
    out.append("Quattro lenti indipendenti hanno proposto ciascuna una direzione UX. Per ogni proposta, 3 verifier adversariali (admin / vera semplicità / brand) hanno tentato di smontarla. Risultato qui sotto.\n\n")
    out.append("Le proposte NON sono mutuamente esclusive: la sintesi (`03-sintesi.md`) ne ruba elementi da ciascuna.\n\n---\n\n")

    for entry in proposals:
        lens = entry.get("lens", "?")
        prop = entry.get("proposal", {}) or {}
        verdicts = entry.get("verdicts", []) or []

        out.append(header(f"Lente · {lens.capitalize()}", 2))

        # Verifica scores
        scores = {v.get("dimension", "?"): v.get("score", "?") for v in verdicts}
        passes = {v.get("dimension", "?"): v.get("passes", False) for v in verdicts}
        admin_s = next((v.get('score') for v in verdicts if 'admin' in v.get('dimension', '').lower()), "?")
        simpl_s = next((v.get('score') for v in verdicts if 'simpl' in v.get('dimension', '').lower()), "?")
        brand_s = next((v.get('score') for v in verdicts if 'brand' in v.get('dimension', '').lower()), "?")

        out.append(f"**Verifiche adversariali**: admin **{admin_s}/10** · semplicità **{simpl_s}/10** · brand **{brand_s}/10**\n\n")

        out.append("> " + (prop.get("northStar", "") or "").replace("\n", "\n> ") + "\n\n")

        if prop.get("principles"):
            out.append("**Principi**\n\n")
            for pr in prop["principles"]:
                out.append(f"- {pr}\n")
            out.append("\n")

        rm = prop.get("routeMap", {}) or {}
        if rm.get("publicRoutes"):
            out.append("**Route pubbliche proposte** (" + str(len(rm["publicRoutes"])) + ")\n\n")
            for r in rm["publicRoutes"]:
                if isinstance(r, dict):
                    path = r.get("path") or r.get("url") or "?"
                    purpose = r.get("purpose") or r.get("description") or ""
                    layout = r.get("layoutSketch") or r.get("layout") or ""
                    line = f"- `{path}` — {purpose}"
                    if layout:
                        line += f" · *{layout}*"
                    out.append(line + "\n")
                else:
                    out.append(f"- {r}\n")
            out.append("\n")

        if rm.get("adminRoutes"):
            out.append("**Route admin proposte** (" + str(len(rm["adminRoutes"])) + ")\n\n")
            for r in rm["adminRoutes"]:
                if isinstance(r, dict):
                    path = r.get("path") or r.get("url") or "?"
                    purpose = r.get("purpose") or r.get("description") or ""
                    out.append(f"- `{path}` — {purpose}\n")
                else:
                    out.append(f"- {r}\n")
            out.append("\n")

        cc = prop.get("componentChanges", {}) or {}
        if cc:
            out.append("**Componenti**\n\n")
            for action in ["delete", "merge", "create"]:
                items = cc.get(action, [])
                if items:
                    out.append(f"- **{action}** ({len(items)}): " + ", ".join(f"`{i}`" for i in items[:8]))
                    if len(items) > 8:
                        out.append(f" *(+{len(items)-8} altri)*")
                    out.append("\n")
            out.append("\n")

        if prop.get("brandMoves"):
            out.append("**Mosse brand**\n\n")
            for bm in prop["brandMoves"]:
                out.append(f"- {bm}\n")
            out.append("\n")

        if prop.get("exampleScreens"):
            out.append("**Schermate esempio**\n\n")
            for scr in prop["exampleScreens"]:
                if isinstance(scr, dict):
                    name = scr.get("name") or scr.get("screen") or "?"
                    desc = scr.get("description") or scr.get("layout") or scr.get("hierarchy") or ""
                    out.append(f"**{name}**\n\n")
                    out.append(f"{desc}\n\n")
                else:
                    out.append(f"- {scr}\n\n")

        if prop.get("tradeoffs"):
            out.append("**Trade-off dichiarati**\n\n")
            for to in prop["tradeoffs"]:
                out.append(f"- {to}\n")
            out.append("\n")

        # Verifiche dettagliate
        out.append("<details><summary><b>Dettaglio verifiche adversariali</b></summary>\n\n")
        for v in verdicts:
            dim = v.get("dimension", "?")
            score = v.get("score", "?")
            verdict = v.get("verdict", "")
            issues = v.get("issues", [])
            status = "✓ PASS" if v.get("passes") else "✗ FAIL"
            out.append(f"**{dim}** — {status} · score {score}/10\n\n")
            out.append(f"{verdict}\n\n")
            if issues:
                out.append("Issues:\n")
                for iss in issues:
                    out.append(f"- {iss}\n")
                out.append("\n")
        out.append("</details>\n\n---\n\n")

    (DOCS_DIR / "02-proposte.md").write_text("".join(out), encoding="utf-8")

# ---------------------------------------------------------------
# 03 — Sintesi
# ---------------------------------------------------------------
def write_synthesis():
    s = synthesis
    out = []
    out.append(header(f"03 · Sintesi — {s.get('name', '?')}", 1))
    out.append(f"> **{s.get('oneSentence', '')}**\n\n")
    out.append("Un singolo architetto ha consolidato le 4 proposte rubando il meglio da ciascuna. Questo è il documento di riferimento per le decisioni di design.\n\n")
    out.append("---\n\n")

    out.append(header("Rationale", 2))
    out.append(s.get("rationale", "") + "\n\n")
    out.append("---\n\n")

    out.append(header("Principi", 2))
    for i, p in enumerate(s.get("principles", []), 1):
        out.append(f"{i}. {p}\n")
    out.append("\n---\n\n")

    rm = s.get("newRouteMap", {}) or {}
    out.append(header("Nuova mappa route", 2))

    out.append(header("Pubbliche", 3))
    pub = rm.get("public", []) or []
    out.append(f"_{len(pub)} route_\n\n")
    for r in pub:
        if isinstance(r, dict):
            path = r.get("path") or r.get("url") or "?"
            purpose = r.get("purpose") or r.get("description") or ""
            layout = r.get("layoutSketch") or r.get("layout") or ""
            out.append(f"### `{path}`\n\n")
            out.append(f"{purpose}\n\n")
            if layout:
                out.append(f"**Layout**: {layout}\n\n")
            # other fields
            for k, v in r.items():
                if k in ("path", "url", "purpose", "description", "layoutSketch", "layout"):
                    continue
                if isinstance(v, (str, int, bool, float)):
                    out.append(f"**{k}**: {v}\n\n")
                elif isinstance(v, list):
                    out.append(f"**{k}**:\n")
                    for vv in v:
                        out.append(f"- {vv}\n")
                    out.append("\n")
        else:
            out.append(f"- {r}\n")
    out.append("\n")

    out.append(header("Admin", 3))
    adm = rm.get("admin", []) or []
    out.append(f"_{len(adm)} route_\n\n")
    for r in adm:
        if isinstance(r, dict):
            path = r.get("path") or r.get("url") or "?"
            purpose = r.get("purpose") or r.get("description") or ""
            out.append(f"- `{path}` — {purpose}\n")
        else:
            out.append(f"- {r}\n")
    out.append("\n---\n\n")

    inv = s.get("newComponentInventory", {}) or {}
    out.append(header("Inventario componenti", 2))

    for action, label in [("keep", "Da mantenere"), ("merge", "Da unire"), ("delete", "Da cancellare"), ("create", "Da creare")]:
        items = inv.get(action, [])
        out.append(header(f"{label} ({len(items)})", 3))
        for item in items:
            if isinstance(item, dict):
                name = item.get("name") or item.get("component") or item.get("file") or "?"
                desc = item.get("rationale") or item.get("purpose") or item.get("description") or ""
                out.append(f"- **`{name}`** — {desc}\n")
                if item.get("notes"):
                    out.append(f"  - {item['notes']}\n")
            else:
                out.append(f"- `{item}`\n")
        out.append("\n")
    out.append("---\n\n")

    # Brand system
    bs = s.get("brandSystem", {}) or {}
    out.append(header("Sistema brand", 2))

    for k in ("palette", "typography"):
        if bs.get(k):
            out.append(header(k.capitalize(), 3))
            out.append("```json\n")
            out.append(json.dumps(bs[k], indent=2, ensure_ascii=False))
            out.append("\n```\n\n")

    if bs.get("voice"):
        out.append(header("Voce", 3))
        voice = bs["voice"]
        if isinstance(voice, dict):
            for k, v in voice.items():
                if isinstance(v, list):
                    out.append(f"**{k}**:\n")
                    for vv in v:
                        out.append(f"- {vv}\n")
                    out.append("\n")
                else:
                    out.append(f"**{k}**: {v}\n\n")
        else:
            out.append(f"{voice}\n\n")

    if bs.get("mapStyle"):
        out.append(header("Map style", 3))
        out.append(f"{bs['mapStyle']}\n\n")

    if bs.get("iconography"):
        out.append(header("Iconografia", 3))
        out.append(f"{bs['iconography']}\n\n")

    if bs.get("copyExamples"):
        out.append(header("Esempi copy", 3))
        for ex in bs["copyExamples"]:
            out.append(f"> {ex}\n>\n")
        out.append("\n")
    out.append("---\n\n")

    # Key screens
    if s.get("keyScreensDetailed"):
        out.append(header("Schermate chiave (dettaglio)", 2))
        for scr in s["keyScreensDetailed"]:
            if isinstance(scr, dict):
                name = scr.get("name") or scr.get("screen") or scr.get("route") or "?"
                out.append(header(name, 3))
                # render dict
                for k, v in scr.items():
                    if k in ("name", "screen", "route"):
                        continue
                    if isinstance(v, list):
                        out.append(f"**{k}**:\n")
                        for vv in v:
                            if isinstance(vv, dict):
                                out.append(f"- {json.dumps(vv, ensure_ascii=False)}\n")
                            else:
                                out.append(f"- {vv}\n")
                        out.append("\n")
                    elif isinstance(v, dict):
                        out.append(f"**{k}**:\n```json\n{json.dumps(v, indent=2, ensure_ascii=False)}\n```\n\n")
                    else:
                        out.append(f"**{k}**: {v}\n\n")
            else:
                out.append(f"{scr}\n\n")
        out.append("---\n\n")

    if s.get("rejectedIdeas"):
        out.append(header("Idee scartate (e perche)", 2))
        for ri in s["rejectedIdeas"]:
            out.append(f"- {ri}\n")
        out.append("\n")

    (DOCS_DIR / "03-sintesi.md").write_text("".join(out), encoding="utf-8")

# ---------------------------------------------------------------
# 04 — Piano
# ---------------------------------------------------------------
def write_plan():
    out = []
    out.append(header("04 · Piano di implementazione", 1))
    out.append("Quattro agenti hanno generato in parallelo: file da cancellare, file da unire, nuova struttura, piano di migrazione in fasi.\n\n")
    out.append("---\n\n")

    # Delete
    fd = plan.get("filesToDelete", {}) or {}
    files_del = fd.get("filesToDelete", []) or []
    out.append(header(f"File da cancellare ({len(files_del)})", 2))
    out.append("| File | Motivo | Rischio |\n|------|--------|--------|\n")
    for f in files_del:
        out.append(f"| `{md(f.get('path'))}` | {md(f.get('reason'))} | {md(f.get('riskNote') or '—')} |\n")
    out.append("\n")
    if fd.get("routesToDelete"):
        out.append("**Route da rimuovere/redirect:**\n\n")
        for r in fd["routesToDelete"]:
            if isinstance(r, dict):
                out.append(f"- `{r.get('url') or r.get('path') or '?'}` → {r.get('action') or r.get('redirect') or '?'}")
                if r.get("reason"):
                    out.append(f" *({r['reason']})*")
                out.append("\n")
            else:
                out.append(f"- {r}\n")
        out.append("\n")
    out.append("---\n\n")

    # Merge
    fm = plan.get("filesToMerge", {}) or {}
    merges = fm.get("merges", []) or []
    out.append(header(f"File da unire ({len(merges)})", 2))
    for m in merges:
        out.append(f"### {' + '.join(f'`{s}`' for s in m.get('from', []))} → `{m.get('into', '?')}`\n\n")
        out.append(f"{m.get('rationale', '')}\n\n")
        if m.get("refactorSteps"):
            out.append("**Steps:**\n\n")
            for i, st in enumerate(m["refactorSteps"], 1):
                out.append(f"{i}. {st}\n")
            out.append("\n")
    out.append("---\n\n")

    # Structure
    st = plan.get("newStructure", {}) or {}
    if st.get("tree"):
        out.append(header("Nuova struttura", 2))
        out.append("```\n" + st["tree"] + "\n```\n\n")

    if st.get("routeTable"):
        out.append(header("Tabella route complete", 3))
        out.append("| URL | File | Scopo |\n|-----|------|-------|\n")
        for r in st["routeTable"]:
            out.append(f"| `{md(r.get('url'))}` | `{md(r.get('file'))}` | {md(r.get('purpose'))} |\n")
        out.append("\n")

    if st.get("newFiles"):
        out.append(header(f"Nuovi file da creare ({len(st['newFiles'])})", 3))
        for nf in st["newFiles"]:
            out.append(f"- **`{nf.get('path')}`** — {nf.get('purpose')}\n")
            if nf.get("scaffoldHint"):
                out.append(f"  - *Scaffold*: {nf['scaffoldHint']}\n")
        out.append("\n")
    out.append("---\n\n")

    # Migration
    mp = plan.get("migrationPlan", {}) or {}
    phases = mp.get("phases", []) or []
    total_hours = sum(p.get("estimatedHours", 0) for p in phases)
    out.append(header(f"Piano di migrazione · {len(phases)} fasi · stima totale {total_hours}h", 2))
    for i, ph in enumerate(phases, 1):
        out.append(f"### Fase {i}: {ph.get('name')} — *{ph.get('estimatedHours', '?')}h · rischio {ph.get('risk', '?')}*\n\n")
        out.append(f"**Obiettivo**: {ph.get('goal', '')}\n\n")
        if ph.get("steps"):
            out.append("**Step**:\n\n")
            for j, s in enumerate(ph["steps"], 1):
                out.append(f"{j}. {s}\n")
            out.append("\n")
        if ph.get("rollbackPlan"):
            out.append(f"**Rollback**: {ph['rollbackPlan']}\n\n")
    out.append("---\n\n")

    if mp.get("breakingChanges"):
        out.append(header("Breaking changes", 2))
        for bc in mp["breakingChanges"]:
            out.append(f"- {bc}\n")
        out.append("\n")

    if mp.get("productionSafety"):
        out.append(header("Sicurezza produzione", 2))
        out.append(f"{mp['productionSafety']}\n\n")

    (DOCS_DIR / "04-piano.md").write_text("".join(out), encoding="utf-8")

# ---------------------------------------------------------------
# Run
# ---------------------------------------------------------------
write_index()
write_discovery()
write_proposals()
write_synthesis()
write_plan()

print("\nDone. Files written:")
for f in sorted(DOCS_DIR.glob("*.md")):
    print(f"  {f.name}: {f.stat().st_size // 1024} KB")
