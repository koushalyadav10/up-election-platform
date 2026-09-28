from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class State(Base):
    __tablename__ = "states"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    total_pcs = Column(Integer, default=80)
    total_acs = Column(Integer, default=403)
    
    districts = relationship("District", back_populates="state")
    pcs = relationship("ParliamentaryConstituency", back_populates="state")

class District(Base):
    __tablename__ = "districts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    
    state = relationship("State", back_populates="districts")
    acs = relationship("AssemblyConstituency", back_populates="district")

class ParliamentaryConstituency(Base):
    __tablename__ = "parliamentary_constituencies"
    id = Column(Integer, primary_key=True, index=True)
    pc_no = Column(Integer, index=True, nullable=False)
    name = Column(String(150), index=True, nullable=False)
    category = Column(String(20), default="GEN") # GEN / SC / ST
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    delimitation_era = Column(String(50), default="2008_CURRENT") # 1976_2008, 2008_CURRENT
    valid_from_year = Column(Integer, default=2008)
    valid_to_year = Column(Integer, nullable=True) # None = active
    is_active = Column(Boolean, default=True) # False for abolished seats like Hapur, Jalesar, Bilhaur
    
    state = relationship("State", back_populates="pcs")
    ac_mappings = relationship("PCACMapping", back_populates="pc")
    results = relationship("ElectionResult", back_populates="pc")

class AssemblyConstituency(Base):
    __tablename__ = "assembly_constituencies"
    id = Column(Integer, primary_key=True, index=True)
    ac_no = Column(Integer, index=True, nullable=False)
    name = Column(String(150), index=True, nullable=False)
    category = Column(String(20), default="GEN")
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=True)
    delimitation_era = Column(String(50), default="2008_CURRENT")
    valid_from_year = Column(Integer, default=2008)
    valid_to_year = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    
    district = relationship("District", back_populates="acs")
    pc_mappings = relationship("PCACMapping", back_populates="ac")
    segment_results = relationship("AssemblySegmentResult", back_populates="ac")
    polling_stations = relationship("PollingStation", back_populates="ac")

class PCACMapping(Base):
    __tablename__ = "pc_ac_mapping"
    id = Column(Integer, primary_key=True, index=True)
    pc_id = Column(Integer, ForeignKey("parliamentary_constituencies.id"), nullable=False)
    ac_id = Column(Integer, ForeignKey("assembly_constituencies.id"), nullable=False)
    delimitation_era = Column(String(50), default="2008_CURRENT")
    election_id = Column(Integer, ForeignKey("elections.id"), nullable=True)
    
    pc = relationship("ParliamentaryConstituency", back_populates="ac_mappings")
    ac = relationship("AssemblyConstituency", back_populates="pc_mappings")

class Election(Base):
    __tablename__ = "elections"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False) # e.g. Lok Sabha 2024, Vidhan Sabha 2022
    year = Column(Integer, index=True, nullable=False)
    election_type = Column(String(50), index=True, nullable=False) # Lok Sabha / Vidhan Sabha
    delimitation_era = Column(String(50), default="2008_CURRENT")
    total_seats = Column(Integer, default=80)
    is_official = Column(Boolean, default=True)
    data_version = Column(String(50), default="UP-ECI-v1")
    
    results = relationship("ElectionResult", back_populates="election")

class Party(Base):
    __tablename__ = "parties"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    symbol = Column(String(150), nullable=True)
    party_type = Column(String(50), default="National")
    color_hex = Column(String(20), default="#626762")

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    gender = Column(String(20), nullable=True)
    age = Column(Float, nullable=True)
    category = Column(String(20), nullable=True)

class ElectionResult(Base):
    __tablename__ = "election_results"
    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, ForeignKey("elections.id"), index=True, nullable=False)
    pc_id = Column(Integer, ForeignKey("parliamentary_constituencies.id"), index=True, nullable=True)
    ac_id = Column(Integer, ForeignKey("assembly_constituencies.id"), index=True, nullable=True)
    total_electors = Column(Integer, nullable=False)
    total_votes_polled = Column(Integer, nullable=False)
    valid_votes = Column(Integer, nullable=False)
    margin = Column(Integer, nullable=False)
    turnout_pct = Column(Float, nullable=False)
    winner_candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=True)
    winner_party_id = Column(Integer, ForeignKey("parties.id"), nullable=True)
    runner_up_candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=True)
    runner_up_party_id = Column(Integer, ForeignKey("parties.id"), nullable=True)
    data_quality_score = Column(String(50), default="Official / Verified")
    
    election = relationship("Election", back_populates="results")
    pc = relationship("ParliamentaryConstituency", back_populates="results")
    ac = relationship("AssemblyConstituency")
    candidate_results = relationship("CandidateResult", back_populates="election_result")
    winner_candidate = relationship("Candidate", foreign_keys=[winner_candidate_id])
    winner_party = relationship("Party", foreign_keys=[winner_party_id])
    runner_up_candidate = relationship("Candidate", foreign_keys=[runner_up_candidate_id])
    runner_up_party = relationship("Party", foreign_keys=[runner_up_party_id])

class CandidateResult(Base):
    __tablename__ = "candidate_results"
    id = Column(Integer, primary_key=True, index=True)
    election_result_id = Column(Integer, ForeignKey("election_results.id"), index=True, nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), index=True, nullable=False)
    party_id = Column(Integer, ForeignKey("parties.id"), index=True, nullable=False)
    general_votes = Column(Integer, default=0)
    postal_votes = Column(Integer, default=0)
    total_votes = Column(Integer, nullable=False)
    vote_pct_valid = Column(Float, nullable=False)
    vote_pct_electors = Column(Float, nullable=False)
    rank = Column(Integer, nullable=False)
    is_winner = Column(Boolean, default=False)
    
    election_result = relationship("ElectionResult", back_populates="candidate_results")
    candidate = relationship("Candidate")
    party = relationship("Party")

class AssemblySegmentResult(Base):
    __tablename__ = "assembly_segment_results"
    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, ForeignKey("elections.id"), nullable=False)
    ac_id = Column(Integer, ForeignKey("assembly_constituencies.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    party_id = Column(Integer, ForeignKey("parties.id"), nullable=False)
    evm_votes = Column(Integer, nullable=False)
    nota_votes = Column(Integer, default=0)
    ac_total_electors = Column(Integer, nullable=False)
    
    ac = relationship("AssemblyConstituency", back_populates="segment_results")
    candidate = relationship("Candidate")
    party = relationship("Party")

class ElectorStatistic(Base):
    __tablename__ = "elector_statistics"
    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, ForeignKey("elections.id"), nullable=False)
    category = Column(String(50))
    no_of_seats = Column(Integer)
    male_electors = Column(Integer)
    female_electors = Column(Integer)
    third_gender_electors = Column(Integer)
    total_electors = Column(Integer)
    nri_electors = Column(Integer)
    service_electors = Column(Integer)
    male_voters = Column(Integer)
    female_voters = Column(Integer)
    third_gender_voters = Column(Integer)
    postal_voters = Column(Integer)
    total_voters = Column(Integer)
    poll_pct = Column(Float)
    rejected_postal = Column(Integer)
    evm_rejected = Column(Integer)
    nota_votes = Column(Integer)
    valid_votes = Column(Integer)

class Source(Base):
    __tablename__ = "sources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    authority = Column(String(200), nullable=False)
    url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

class SourceDocument(Base):
    __tablename__ = "source_documents"
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    document_code = Column(String(50), nullable=False)
    document_name = Column(String(250), nullable=False)
    file_name = Column(String(200), nullable=False)
    election_year = Column(Integer, default=2024)
    election_type = Column(String(50), default="Lok Sabha")
    imported_at = Column(DateTime, default=datetime.utcnow)
    data_version = Column(String(50), default="UP-ECI-v1")
    status = Column(String(50), default="Official / Verified")

class DataImport(Base):
    __tablename__ = "data_imports"
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(250), nullable=False)
    election_year = Column(Integer, nullable=True)
    election_type = Column(String(50), nullable=True)
    records_count = Column(Integer, default=0)
    status = Column(String(50), default="Success")
    validation_status = Column(String(50), default="Passed")
    error_log = Column(Text, nullable=True)
    imported_by = Column(String(100), default="System Administrator")
    created_at = Column(DateTime, default=datetime.utcnow)

class DataVersion(Base):
    __tablename__ = "data_versions"
    id = Column(Integer, primary_key=True, index=True)
    version_tag = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Survey(Base):
    __tablename__ = "surveys"
    id = Column(Integer, primary_key=True, index=True)
    agency = Column(String(150), nullable=False)
    survey_type = Column(String(100), default="Opinion Poll")
    publication_date = Column(String(50), nullable=False)
    sample_size = Column(Integer, nullable=True)
    methodology = Column(Text, nullable=True)
    notice = Column(String(250), default="OPINION POLL / SURVEY — NOT OFFICIAL ELECTION DATA")

class SurveyResult(Base):
    __tablename__ = "survey_results"
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=False)
    party_id = Column(Integer, ForeignKey("parties.id"), nullable=False)
    projected_seats_min = Column(Integer)
    projected_seats_max = Column(Integer)
    projected_vote_share = Column(Float)

class AIQuery(Base):
    __tablename__ = "ai_queries"
    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(String(500), nullable=False)
    intent_detected = Column(String(100), nullable=True)
    sql_executed = Column(Text, nullable=True)
    response_text = Column(Text, nullable=False)
    source_cited = Column(String(200), default="ECI Official Publications")
    data_quality = Column(String(50), default="Official / Verified")
    created_at = Column(DateTime, default=datetime.utcnow)

class ACHistoricalIntelligence(Base):
    __tablename__ = "ac_historical_intelligence"
    id = Column(Integer, primary_key=True, index=True)
    ac_no = Column(Integer, unique=True, nullable=False, index=True)
    ac_name = Column(String(150), nullable=False, index=True)
    category = Column(String(50))
    district = Column(String(100), index=True)
    region = Column(String(100), index=True)
    pc_no = Column(Integer)
    pc_name = Column(String(150))
    winner_2017_party = Column(String(50))
    winner_2017_candidate = Column(String(200))
    margin_2017 = Column(Integer)
    lead_2019_party = Column(String(50))
    lead_2019_candidate = Column(String(200))
    margin_2019 = Column(Integer)
    winner_2022_party = Column(String(50), index=True)
    winner_2022_candidate = Column(String(200))
    margin_2022 = Column(Integer)
    valid_votes_2022 = Column(Integer)
    runner_2022_party = Column(String(50))
    runner_2022_candidate = Column(String(200))
    lead_2024_party = Column(String(50), index=True)
    lead_2024_candidate = Column(String(200))
    lead_2024_votes = Column(Integer)
    runner_2024_party = Column(String(50))
    runner_2024_candidate = Column(String(200))
    runner_2024_votes = Column(Integer)
    margin_2024 = Column(Integer)
    margin_pct_2024 = Column(Float)
    total_votes_2024 = Column(Integer)
    sp_votes_2024 = Column(Integer)
    bjp_votes_2024 = Column(Integer)
    inc_votes_2024 = Column(Integer)
    bsp_votes_2024 = Column(Integer)
    rld_votes_2024 = Column(Integer)
    strategic_category = Column(String(50), index=True)
    is_battleground = Column(Boolean, default=False)
    is_prime_flip = Column(Boolean, default=False)
    is_fortress = Column(Boolean, default=False)
    is_defensive_alert = Column(Boolean, default=False)
    is_near_miss = Column(Boolean, default=False)
    target_priority = Column(String(50))
    recommendation_note = Column(Text)


class PollingStation(Base):
    __tablename__ = "polling_stations"
    id = Column(Integer, primary_key=True, index=True)
    ac_id = Column(Integer, ForeignKey("assembly_constituencies.id"), index=True, nullable=False)
    part_no = Column(Integer, nullable=False, index=True)
    station_name = Column(String(300), nullable=False)
    address = Column(String(500), nullable=True)
    total_electors = Column(Integer, default=0)
    votes_polled = Column(Integer, default=0)
    turnout_pct = Column(Float, default=0.0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    ac = relationship("AssemblyConstituency", back_populates="polling_stations")
    results = relationship("PollingStationResult", back_populates="polling_station")


class PollingStationResult(Base):
    __tablename__ = "polling_station_results"
    id = Column(Integer, primary_key=True, index=True)
    polling_station_id = Column(Integer, ForeignKey("polling_stations.id"), index=True, nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    party_id = Column(Integer, ForeignKey("parties.id"), nullable=False)
    evm_votes = Column(Integer, nullable=False)
    data_label = Column(String(100), default="Form 20 Certified Return")
    election_year = Column(Integer, default=2022, index=True)
    election_type = Column(String(50), default="Vidhan Sabha")
    vote_share = Column(Float, default=0.0)
    rank = Column(Integer, default=1)
    is_winner = Column(Boolean, default=False)
    source_document = Column(String(150), default="Form 20 Certified Return")
    source_url = Column(String(500), nullable=True)
    source_page = Column(String(50), nullable=True)
    raw_candidate_name = Column(String(200), nullable=True)
    raw_party_name = Column(String(100), nullable=True)
    raw_votes = Column(Integer, nullable=True)
    validation_status = Column(String(50), default="VERIFIED")  # 'VERIFIED', 'PARTIAL', 'UNVERIFIED', 'FLAGGED'
    validation_error = Column(String(300), nullable=True)
    validation_timestamp = Column(DateTime, default=datetime.utcnow)

    polling_station = relationship("PollingStation", back_populates="results")
    candidate = relationship("Candidate")
    party = relationship("Party")


class BoothHistoricalMapping(Base):
    __tablename__ = "booth_historical_mappings"
    id = Column(Integer, primary_key=True, index=True)
    base_ac_no = Column(Integer, nullable=False, index=True)
    base_booth_no = Column(Integer, nullable=False, index=True)
    target_year = Column(Integer, nullable=False, index=True)
    target_election_type = Column(String(50), nullable=False)
    target_pc_no = Column(Integer, nullable=True)
    target_ac_no = Column(Integer, nullable=True)
    target_booth_no = Column(Integer, nullable=True)
    target_polling_station_name = Column(String(300), nullable=True)
    mapping_method = Column(String(100), default="EXACT_PART_AND_NAME")
    mapping_confidence = Column(String(50), default="VERIFIED")  # 'VERIFIED', 'PROBABLE', 'UNVERIFIED', 'UNAVAILABLE'
    mapping_notes = Column(Text, nullable=True)


class Form20Reconciliation(Base):
    __tablename__ = "form20_reconciliation"
    id = Column(Integer, primary_key=True, index=True)
    election_year = Column(Integer, nullable=False, index=True)
    election_type = Column(String(50), nullable=False)
    ac_no = Column(Integer, nullable=False, index=True)
    pc_no = Column(Integer, nullable=True)
    candidate_name = Column(String(200), nullable=True)
    party_name = Column(String(100), nullable=True)
    sum_booth_votes = Column(Integer, default=0)
    official_total_votes = Column(Integer, default=0)
    evm_votes = Column(Integer, default=0)
    postal_votes = Column(Integer, default=0)
    checksum_status = Column(String(50), default="RECONCILED")  # 'RECONCILED', 'DISCREPANCY', 'PENDING'
    discrepancy_delta = Column(Integer, default=0)
    validation_timestamp = Column(DateTime, default=datetime.utcnow)


class BoothWorkerAssignment(Base):
    __tablename__ = "booth_worker_assignments"
    id = Column(Integer, primary_key=True, index=True)
    ac_no = Column(Integer, nullable=False, index=True)
    part_no = Column(Integer, nullable=False, index=True)
    adhyaksh_name = Column(String(150), nullable=True)
    adhyaksh_mobile = Column(String(30), nullable=True)
    bla2_name = Column(String(150), nullable=True)
    bla2_mobile = Column(String(30), nullable=True)
    status = Column(String(50), default="सत्यापित (VERIFIED)")
    form6_count = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    updated_by = Column(String(100), default="Admin")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_booth_worker_ac_part", "ac_no", "part_no", unique=True),
    )


class ElectraNotification(Base):
    __tablename__ = "electra_notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    summary = Column(Text, nullable=False)
    alert_type = Column(String(50), default="INFO")  # INFO, UPDATE, IMPORTANT, DATA_CHANGE, SOURCE_UPDATE
    category = Column(String(50), default="electoral")  # district, ac, pc, official, roll, news
    target_type = Column(String(50), default="AC")  # AC, PC, DISTRICT, STATE, SYSTEM
    target_id = Column(String(100), nullable=True, index=True)  # e.g. "313" or "Sant Kabir Nagar"
    source_name = Column(String(200), nullable=True)
    source_url = Column(String(500), nullable=True)
    source_quality = Column(String(50), default="Official")  # Official, High, Established, Secondary, Unverified
    publication_date = Column(String(50), nullable=True)
    cluster_count = Column(Integer, default=1)  # e.g. 3 sources reporting same event
    deduplication_key = Column(String(100), index=True, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ElectraSubscription(Base):
    __tablename__ = "electra_subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_analyst", index=True)
    target_type = Column(String(50), nullable=False)  # AC, PC, DISTRICT, ALL
    target_id = Column(String(100), nullable=False)  # "313", "Sant Kabir Nagar", etc.
    target_name = Column(String(200), nullable=True)
    alert_frequency = Column(String(50), default="instant")  # instant, daily, off
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ElectraSourceSnapshot(Base):
    __tablename__ = "electra_source_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(200), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    content_hash = Column(String(100), nullable=False)
    previous_hash = Column(String(100), nullable=True)
    title = Column(String(300), nullable=True)
    change_summary = Column(Text, nullable=True)
    last_seen = Column(DateTime, default=datetime.utcnow)
    last_changed = Column(DateTime, default=datetime.utcnow)


class ElectraTraceLog(Base):
    __tablename__ = "electra_trace_logs"
    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(String(500), nullable=False)
    query_intent = Column(String(100), nullable=False)
    context_payload = Column(Text, nullable=True)
    internal_records_count = Column(Integer, default=0)
    external_sources_count = Column(Integer, default=0)
    source_quality = Column(String(50), default="Official / Verified")
    numerical_checks_passed = Column(Boolean, default=True)
    hallucination_flag = Column(Boolean, default=False)
    latency_ms = Column(Float, default=0.0)
    response_answer = Column(Text, nullable=True)
    evidence_payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
