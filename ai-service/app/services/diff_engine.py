import re
import difflib
from typing import List, Tuple
from app.models.schemas import ClauseDiffItem, RedlineDiffResponse, RiskImpact

def split_into_clauses(text: str) -> List[Tuple[str, str]]:
    """
    Splits legal contract text into titled clauses or paragraphs.
    Returns list of tuples: (clause_title, clause_body).
    """
    pattern = r"((?:Section|Clause|Article)\s+[\d\.]+(?:\s*\([^\)]+\)|\s*[-–—]\s*[^:\.\n]+)?)"
    matches = list(re.finditer(pattern, text, flags=re.IGNORECASE))
    
    if matches:
        clauses = []
        # Check if there is preamble text before the first section
        if matches[0].start() > 0:
            preamble = text[:matches[0].start()].strip()
            if preamble:
                clauses.append(("Preamble & Recitals", preamble))
                
        for i, match in enumerate(matches):
            title = match.group(1).strip()
            start = match.end()
            while start < len(text) and text[start] in [":", ".", " ", "\t", "-"]:
                start += 1
            end = matches[i+1].start() if i+1 < len(matches) else len(text)
            body = text[start:end].strip()
            clauses.append((title, body))
        return clauses
    else:
        # Fallback to paragraph splitting if no Section headers exist
        paras = [p.strip() for p in text.split("\n\n") if p.strip()]
        if not paras:
            return [("Clause 1", text.strip())]
        clauses = []
        for idx, p in enumerate(paras, start=1):
            title = f"Clause {idx}"
            clauses.append((title, p))
        return clauses

def evaluate_change_risk(title: str, old_body: str, new_body: str) -> Tuple[str, str]:
    """
    Determines severity (high, medium, low) and writes a risk impact explanation for redlines.
    """
    combined = f"{title} {old_body} {new_body}".lower()
    
    if any(k in combined for k in ["liability", "indemn", "damages", "uncapped", "cap"]):
        return ("high", "Materially alters liability distribution or indemnification exposure between the contracting parties.")
    elif any(k in combined for k in ["intellectual property", "work product", "patent", "ownership", "license"]):
        return ("high", "Modifies ownership covenants regarding bespoke software, proprietary data, or work product deliverables.")
    elif any(k in combined for k in ["audit", "inspect", "telemetry", "records"]):
        return ("medium", "Alters verification protocols, remote telemetry tracking, or audit cost-shifting covenants.")
    elif any(k in combined for k in ["security", "breach", "incident", "notice"]):
        return ("medium", "Changes notice windows or obligations regarding cybersecurity incident escalation.")
    elif any(k in combined for k in ["renewal", "term", "cpi", "escalation", "fee"]):
        return ("low", "Modifies financial terms, indexing ceilings, or automatic term continuation mechanics.")
    else:
        return ("low", "Administrative or stylistic contractual adjustment with minimal substantive legal exposure.")

def compare_documents(
    comparison_id: str,
    title: str,
    base_text: str,
    target_text: str,
    base_label: str = "Original Version",
    target_label: str = "Modified Version"
) -> RedlineDiffResponse:
    """
    Performs clause-by-clause redline comparison between two contract versions.
    """
    base_clauses = split_into_clauses(base_text)
    target_clauses = split_into_clauses(target_text)
    
    base_dict = {t: b for t, b in base_clauses}
    target_dict = {t: b for t, b in target_clauses}
    
    all_titles = []
    for t, _ in base_clauses:
        if t not in all_titles:
            all_titles.append(t)
    for t, _ in target_clauses:
        if t not in all_titles:
            all_titles.append(t)
            
    diff_items: List[ClauseDiffItem] = []
    diff_idx = 1
    
    for clause_title in all_titles:
        in_base = clause_title in base_dict
        in_target = clause_title in target_dict
        
        if in_base and not in_target:
            old_text = base_dict[clause_title]
            severity, explanation = evaluate_change_risk(clause_title, old_text, "")
            assessment = f"Clause removed entirely from modified version. {explanation}"
            diff_items.append(ClauseDiffItem(
                id=f"diff-{diff_idx}",
                clause_title=clause_title,
                section_title=clause_title,
                diff_type="removed",
                severity=severity,
                old_text=old_text,
                new_text=None,
                old_clause=old_text,
                new_clause="",
                risk_assessment=assessment,
                risk_impact=RiskImpact(severity=severity, description=assessment)
            ))
            diff_idx += 1
        elif in_target and not in_base:
            new_text = target_dict[clause_title]
            severity, explanation = evaluate_change_risk(clause_title, "", new_text)
            assessment = f"New clause introduced into modified version. {explanation}"
            diff_items.append(ClauseDiffItem(
                id=f"diff-{diff_idx}",
                clause_title=clause_title,
                section_title=clause_title,
                diff_type="added",
                severity=severity,
                old_text=None,
                new_text=new_text,
                old_clause="",
                new_clause=new_text,
                risk_assessment=assessment,
                risk_impact=RiskImpact(severity=severity, description=assessment)
            ))
            diff_idx += 1
        else:
            old_text = base_dict[clause_title]
            new_text = target_dict[clause_title]
            if old_text.strip() != new_text.strip():
                severity, explanation = evaluate_change_risk(clause_title, old_text, new_text)
                diff_items.append(ClauseDiffItem(
                    id=f"diff-{diff_idx}",
                    clause_title=clause_title,
                    section_title=clause_title,
                    diff_type="modified",
                    severity=severity,
                    old_text=old_text,
                    new_text=new_text,
                    old_clause=old_text,
                    new_clause=new_text,
                    risk_assessment=explanation,
                    risk_impact=RiskImpact(severity=severity, description=explanation)
                ))
                diff_idx += 1

    return RedlineDiffResponse(
        comparison_id=comparison_id,
        title=title,
        base_version_label=base_label,
        target_version_label=target_label,
        total_changes=len(diff_items),
        diffs=diff_items
    )
