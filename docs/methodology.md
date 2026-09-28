# Analytical Methodology & Formulas

## 1. Core Principles
The platform adheres to the constitutional doctrine:
> **DATA FIRST. EVIDENCE FIRST. AI NEVER INVENTS FACTS.**

All numbers reflect primary certified Election Commission of India (ECI) records.

---

## 2. Electoral Formulas

### 2.1 Candidate Total Votes
$$\text{Total Votes} = \text{General Votes (EVM)} + \text{Postal Votes}$$

### 2.2 Percentage over Valid Votes
$$\text{Vote Share (\%)} = \left( \frac{\text{Candidate Total Votes}}{\text{Total Valid Votes in Constituency}} \right) \times 100$$

### 2.3 Winning Margin
$$\text{Winning Margin} = \text{Winner Valid Votes} - \text{Runner-Up Valid Votes}$$

### 2.4 Constituency Voter Turnout
$$\text{Turnout (\%)} = \left( \frac{\text{Total Votes Polled}}{\text{Total Registered Electors in Constituency}} \right) \times 100$$

---

## 3. Constituency DNA Indicators

### 3.1 Herfindahl-Hirschman Index (HHI) for Vote Concentration
Measures electoral bipolarity versus fragmentation:
$$HHI = \sum_{i=1}^{N} (s_i)^2$$
Where $s_i$ is the percentage vote share of candidate $i$.
- **High Concentration ($HHI > 4,000$)**: Strongly bi-polar contest (e.g. direct head-to-head between two major coalitions).
- **Moderate Concentration ($2,500 \le HHI \le 4,000$)**: Standard triangular or multi-cornered contest.
- **Fragmented ($HHI < 2,500$)**: Broadly distributed vote among multiple competing parties.

### 3.2 Competition Index
- **Highly Competitive**: Margin $< 15,000$ votes or $< 2.0\%$ of valid votes.
- **Competitive**: Margin between $15,000$ and $50,000$ votes.
- **Safe Seat**: Margin $> 50,000$ votes.

---

## 4. Scenario Lab Simulation Methodology
- Pure mathematical uniform swing model.
- Adds user-adjusted percentage points to the party's candidate vote share.
- Seats re-ranked by highest simulated vote share.
- Accompanied by mandatory disclaimer: **"SIMULATION — NOT AN ELECTION PREDICTION"**.

---

## 5. AI Research Assistant Rule
1. User question is parsed for intent and constituency/candidate entities.
2. Direct SQL queries execute against normalized tables in `up_election.db`.
3. Verified values and sources are extracted.
4. Response is structured with:
   - Factual synthesis
   - Extracted values table
   - Exact mathematical calculation
   - Primary gazette citation
   - Data quality badge
