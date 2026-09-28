from sqlalchemy.orm import Session, Query
from typing import Optional
from app.models import Election, ElectionResult, ParliamentaryConstituency, AssemblyConstituency

def get_pc_results_query(
    db: Session, 
    election_id: Optional[int] = None, 
    year: Optional[int] = None
) -> Query:
    """
    CRITICAL DATA INTEGRITY GUARD:
    Ensures that ONLY genuine Parliamentary Constituency (Lok Sabha) results are returned.
    Strictly filters:
      1. ElectionResult.ac_id.is_(None)
      2. Election.election_type == "Lok Sabha"
    """
    q = db.query(ElectionResult).join(Election, ElectionResult.election_id == Election.id)
    q = q.filter(
        ElectionResult.ac_id.is_(None),
        Election.election_type == "Lok Sabha"
    )
    if election_id:
        q = q.filter(ElectionResult.election_id == election_id)
    if year:
        q = q.filter(Election.year == year)
    return q

def get_ac_results_query(
    db: Session, 
    election_id: Optional[int] = None, 
    year: Optional[int] = None
) -> Query:
    """
    CRITICAL DATA INTEGRITY GUARD:
    Ensures that ONLY genuine Assembly Constituency (Vidhan Sabha) results are returned.
    Strictly filters:
      1. ElectionResult.ac_id.isnot(None)
      2. Election.election_type == "Vidhan Sabha"
    """
    q = db.query(ElectionResult).join(Election, ElectionResult.election_id == Election.id)
    q = q.filter(
        ElectionResult.ac_id.isnot(None),
        Election.election_type == "Vidhan Sabha"
    )
    if election_id:
        q = q.filter(ElectionResult.election_id == election_id)
    if year:
        q = q.filter(Election.year == year)
    return q
