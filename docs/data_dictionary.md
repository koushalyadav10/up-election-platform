# Data Dictionary: UP Election Intelligence Platform

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| `states` | Master of Indian States | `id`, `name`, `code`, `total_pcs`, `total_acs` |
| `districts` | 75 Administrative Districts of UP | `id`, `name`, `state_id` |
| `parliamentary_constituencies` | 80 Lok Sabha Seats of UP | `id`, `pc_no`, `name`, `category`, `state_id` |
| `assembly_constituencies` | 403 Vidhan Sabha Seats of UP | `id`, `ac_no`, `name`, `category`, `district_id` |
| `pc_ac_mapping` | Delimited link between 80 PCs and 403 ACs | `id`, `pc_id`, `ac_id` |
| `elections` | Election Master Records | `id`, `name`, `year`, `election_type`, `data_version` |
| `parties` | Political Parties | `id`, `code`, `name`, `symbol`, `color_hex` |
| `candidates` | Candidate Master | `id`, `name`, `gender`, `age`, `category` |
| `election_results` | Constituency Contest Totals | `id`, `total_electors`, `votes_polled`, `valid_votes`, `margin`, `turnout_pct` |
| `candidate_results` | Candidate Vote Details | `general_votes`, `postal_votes`, `total_votes`, `vote_pct_valid`, `rank`, `is_winner` |
| `elector_statistics` | Demographic Elector Breakdown | `male_electors`, `female_electors`, `postal_voters`, `nota_votes` |
| `source_documents` | Primary Source Catalog | `document_code`, `document_name`, `file_name`, `data_version`, `status` |
