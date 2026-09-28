"""
ELECTRA Local News Engine & Multi-Source Deduplication
Organizes credible reporting by State -> District -> PC -> AC.
Clusters multiple reports of the same event into deduplicated story cards.
"""
from typing import List, Dict, Any, Optional
from .web_research import ElectraWebResearcher
from .source_ranker import ElectraSourceRanker

class ElectraNewsService:
    def __init__(self):
        self.researcher = ElectraWebResearcher()

    def get_local_news_feed(
        self,
        district: Optional[str] = None,
        ac_no: Optional[int] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        raw_items = self.researcher.search_news(district=district, ac_no=ac_no, limit=limit)
        return self._cluster_and_deduplicate(raw_items)

    def _cluster_and_deduplicate(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        clusters: Dict[str, Dict[str, Any]] = {}

        for it in items:
            # Create clustering key based on topic words
            headline_words = [w for w in it["headline"].lower().split() if len(w) > 4][:3]
            cluster_key = f"{it.get('district', '')}_{'_'.join(headline_words)}"

            if cluster_key in clusters:
                clusters[cluster_key]["cluster_count"] += 1
                clusters[cluster_key]["sources"].append({
                    "name": it["source_name"],
                    "url": it["source_url"],
                    "quality": it["source_quality"]
                })
            else:
                clusters[cluster_key] = {
                    **it,
                    "cluster_count": 1,
                    "sources": [{
                        "name": it["source_name"],
                        "url": it["source_url"],
                        "quality": it["source_quality"]
                    }]
                }

        return list(clusters.values())
