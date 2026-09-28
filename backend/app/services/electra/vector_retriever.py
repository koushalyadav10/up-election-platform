"""
ELECTRA Vector & Document Retriever
Performs keyword and semantic matching against official platform methodology,
Form 20 statutory guidelines, Delimitation Commission 2008 orders, and ECI regulations.
"""
from typing import List, Dict, Any

STATUTORY_DOCUMENT_INDEX = [
    {
        "id": "DOC_FORM20_METHODOLOGY",
        "title": "ECI Form 20 Statutory Guidelines & EVM Counting Procedures",
        "category": "STATUTORY_HANDBOOK",
        "authority": "Election Commission of India",
        "keywords": ["form 20", "booth", "evm", "counting", "polling station", "postal ballots", "margin", "valid votes"],
        "content": (
            "Under Rule 56C of the Conduct of Elections Rules, 1961, Form 20 is the Final Result Sheet "
            "recorded polling station by polling station. It provides certified EVM votes polled by each candidate "
            "at every designated booth. Assembly segment results of Parliamentary Elections are compiled by adding Form 20 returns "
            "across all constituent assembly constituencies."
        ),
        "source_url": "https://eci.gov.in/files/file/7438-handbook-for-returning-officers/"
    },
    {
        "id": "DOC_DELIMITATION_2008",
        "title": "Delimitation Commission of India Order 2008 (Uttar Pradesh)",
        "category": "DELIMITATION_ORDER",
        "authority": "Delimitation Commission of India / Ministry of Law & Justice",
        "keywords": ["delimitation", "boundary", "2008", "bifurcation", "sc reserved", "seat changes", "403"],
        "content": (
            "Pursuant to the Delimitation Act, 2002, the Delimitation Commission reorganized parliamentary and assembly "
            "constituency boundaries in Uttar Pradesh in 2008. Uttar Pradesh was delimited into 80 Lok Sabha and 403 Vidhan Sabha "
            "constituencies. 84 Assembly seats and 17 Parliamentary seats were reserved for Scheduled Castes (SC). "
            "Abolished historical seats like Hapur and Bilhaur were restructured into newly demarcated entities."
        ),
        "source_url": "https://eci.gov.in/delimitation/delimitation-commission-of-india-r6/"
    },
    {
        "id": "DOC_VOTER_ROLL_REVISION",
        "title": "Special Summary Revision (SSR) & Statutory Forms 6, 7, 8 Procedures",
        "category": "ELECTORAL_ROLL_POLICY",
        "authority": "Chief Electoral Officer (CEO), Uttar Pradesh",
        "keywords": ["electoral roll", "sir", "voter list", "form 6", "form 7", "form 8", "additions", "deletions", "brap"],
        "content": (
            "Registration of Electors Rules, 1960 governs voter list updates. Form 6 is submitted for inclusion of new electors, "
            "Form 7 for objections/deletions, and Form 8 for shifting/correction. Booth Level Agents (BLA-2) designated by recognized parties "
            "are authorized to cross-check draft electoral rolls against local electors to ensure transparent additions and prevent arbitrary deletions."
        ),
        "source_url": "https://ceouttarpradesh.nic.in"
    },
    {
        "id": "DOC_PDA_METHODOLOGY",
        "title": "Mission 2027: PDA Social Engineering & Micro-Targeting Framework",
        "category": "STRATEGY_FRAMEWORK",
        "authority": "Platform Analytical Research Directorate",
        "keywords": ["pda", "target", "mission 2027", "fortress", "battleground", "opportunity", "flip", "obc", "dalit"],
        "content": (
            "The PDA (Pichhda, Dalit, Alpasankhyak) Strategic Matrix classifies booths and constituencies based on empirical 4-election "
            "trajectories (2017 VS, 2019 LS, 2022 VS, 2024 LS). Constituencies where SP flipped the lead in 2024 are categorized as "
            "'A-Prime (Flipped to SP)'. Booths where margin is under 50 votes are designated as 'Critical Battlegrounds'."
        ),
        "source_url": "internal://platform/methodology/mission-2027"
    }
]

class ElectraVectorRetriever:
    def __init__(self):
        self.docs = STATUTORY_DOCUMENT_INDEX

    def search(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        tokens = set(query.lower().split())
        scored_docs = []
        for doc in self.docs:
            score = 0
            for kw in doc["keywords"]:
                if kw in query.lower():
                    score += 3
            for tok in tokens:
                if tok in doc["content"].lower():
                    score += 1
            if score > 0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_docs[:top_k]]
